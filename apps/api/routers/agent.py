from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from core.supabase import db
from core.encryption import decrypt

router = APIRouter(tags=["agent"])

@router.get("/patient/{session_id}/ocr-result")
async def get_ocr_result(session_id: str):
    doc_resp = db.table("documents").select("raw_text, file_name, page_count").eq("session_id", session_id).maybe_single().execute()
    if not doc_resp.data:
        raise HTTPException(404, {"error": "Document not found"})
        
    chunks_resp = db.table("chunks").select("id", count="exact").eq("session_id", session_id).execute()
    chunk_count = chunks_resp.count if chunks_resp.count is not None else len(chunks_resp.data or [])
    
    doc = doc_resp.data
    return {
        "raw_text": doc.get("raw_text", ""),
        "file_name": doc.get("file_name", ""),
        "page_count": doc.get("page_count", 0),
        "chunk_count": chunk_count
    }

from pydantic import BaseModel
import uuid
from core.auth import get_current_user
from fastapi import Depends

@router.get("/patient/{session_id}/chunks-debug")
async def debug_chunks(session_id: str, user=Depends(get_current_user)):
    chunks = db.table("chunks")\
        .select("text, chunk_index")\
        .eq("session_id", session_id)\
        .order("chunk_index")\
        .execute()
    return {"chunks": chunks.data, "count": len(chunks.data)}

class RunAgentRequest(BaseModel):
    llm_provider: str = "openai"

@router.post("/patient/{session_id}/run")
async def run_agent(session_id: str, req: RunAgentRequest, user: dict = Depends(get_current_user)):
    user_id = user["user_id"]
    
    # 1. Fetch keys
    keys_res = db.table("api_keys").select("*").eq("user_id", user_id).execute()
    keys = keys_res.data
    mistral_key_obj = next((k for k in keys if k["key_type"] == "ocr" and k.get("is_active")), None)
    mistral_key = decrypt(mistral_key_obj["key_encrypted"]) if mistral_key_obj else None
    
    # Find requested LLM key
    llm_key_obj_req = next((k for k in keys if k["key_type"] == "llm" and k["provider"] == req.llm_provider), None)
    llm_key = decrypt(llm_key_obj_req["key_encrypted"]) if llm_key_obj_req else None
    
    # Fallback
    if not llm_key:
        profile_res = db.table("profiles").select("active_llm_provider").eq("id", user_id).maybe_single().execute()
        active_provider = profile_res.data.get("active_llm_provider") if profile_res.data else None
        
        if active_provider:
            llm_key_obj = next((k for k in keys if k["key_type"] == "llm" and k["provider"] == active_provider and k.get("is_active")), None)
        else:
            llm_key_obj = next((k for k in keys if k["key_type"] == "llm" and k.get("is_active")), None)
            
        if llm_key_obj:
            llm_key = decrypt(llm_key_obj["key_encrypted"])
            req.llm_provider = llm_key_obj["provider"]
    
    if not mistral_key or not llm_key:
        raise HTTPException(status_code=400, detail="Missing required API keys (OCR and LLM)")
        
    # Check if a completed run already exists for this session
    existing = db.table("runs")\
        .select("id, status")\
        .eq("session_id", session_id)\
        .eq("status", "done")\
        .limit(1)\
        .execute()

    if existing.data:
        # Return existing draft instead of running again
        draft = db.table("drafts")\
            .select("*")\
            .eq("session_id", session_id)\
            .order("created_at", desc=True)\
            .limit(1)\
            .execute()
        if draft.data:
            return { "run_id": existing.data[0]["id"], "draft_id": draft.data[0]["id"], "status": "done", "cached": True }
            
    run_id = str(uuid.uuid4())
    db.table("runs").insert({
        "id": run_id,
        "session_id": session_id,
        "status": "running",
        "provider_used": req.llm_provider
    }).execute()
    
    from agent.graph import build_graph
    
    initial_state = {
        "session_id": session_id,
        "user_id": user_id,
        "mistral_key": mistral_key,
        "llm_key": llm_key,
        "llm_provider": req.llm_provider,
        "sections_to_extract": [],
        "current_section": "",
        "iteration": 0,
        "max_iterations": 5,
        "extracted_fields": {},
        "source_citations": {},
        "medications_admission": [],
        "medications_discharge": [],
        "medication_flags": [],
        "conflicts": [],
        "missing_fields": [],
        "critical_flags": [],
        "drug_interactions": [],
        "escalation_triggered": False,
        "pending_labs": [],
        "draft": None,
        "trace": [],
        "status": "running",
        "error": None,
        "_current_chunks": [],
    }
    
    graph = build_graph()
    try:
        print(f"\n[AGENT] Starting run {run_id} for session {session_id}")
        result = graph.invoke(initial_state)
        
        draft = result.get("draft")
        
        draft_id = str(uuid.uuid4())
        db.table("drafts").insert({
            "id": draft_id,
            "session_id": session_id,
            "run_id": run_id,
            "content": draft
        }).execute()
        
        db.table("runs").update({
            "status": "done",
            "trace": result.get("trace", []),
            "iteration_count": result.get("iteration", 0)
        }).eq("id", run_id).execute()
        
        try:
            diag = draft.get("diagnoses", {}).get("principal_diagnosis")
            if diag and "MISSING" not in diag:
                db.table("sessions").update({"title": diag[:50]}).eq("id", session_id).execute()
        except:
            pass
            
        return {"run_id": run_id, "draft_id": draft_id, "status": "done"}
    except Exception as e:
        print(f"[AGENT] Error running graph: {e}")
        db.table("runs").update({
            "status": "error"
        }).eq("id", run_id).execute()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/patient/{session_id}/draft")
async def get_draft(session_id: str, user: dict = Depends(get_current_user)):
    res = db.table("drafts").select("*").eq("session_id", session_id).order("created_at", desc=True).limit(1).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Draft not found")
    return res.data[0]

@router.get("/patient/{session_id}/trace")
async def get_trace(session_id: str, user: dict = Depends(get_current_user)):
    res = db.table("runs").select("trace").eq("session_id", session_id).eq("status", "done").order("created_at", desc=True).limit(1).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Trace not found")
    return res.data[0].get("trace", [])
