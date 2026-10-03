import os
import uuid
import json
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from core.supabase import db
from core.encryption import decrypt
from core.auth import get_current_user
from core.streaming import normalize_stream, sse_token_event, sse_done_event
from agent.utils import get_llm_model

router = APIRouter(tags=["agent"])


@router.get("/patient/{session_id}/ocr-result")
async def get_ocr_result(session_id: str):
    doc_resp = db.table("documents").select("raw_text, file_name, page_count").eq("session_id", session_id).execute()
    if not doc_resp.data:
        raise HTTPException(404, {"error": "Document not found"})
    chunks_resp = db.table("chunks").select("id", count="exact").eq("session_id", session_id).execute()
    chunk_count = chunks_resp.count if chunks_resp.count is not None else len(chunks_resp.data or [])
    docs = doc_resp.data
    combined_text = "\n\n---\n\n".join([d.get("raw_text", "") for d in docs if d.get("raw_text")])
    return {
        "raw_text": combined_text,
        "file_name": ", ".join([d.get("file_name", "") for d in docs if d.get("file_name")]),
        "page_count": sum([d.get("page_count", 0) or 0 for d in docs]),
        "chunk_count": chunk_count,
    }


@router.get("/patient/{session_id}/documents")
async def get_documents(session_id: str, user=Depends(get_current_user)):
    docs = db.table("documents").select("id, file_name, page_count, ocr_status, created_at, r2_key").eq("session_id", session_id).execute()
    return {"documents": docs.data}


@router.get("/patient/{session_id}/chunks-debug")
async def debug_chunks(session_id: str, user=Depends(get_current_user)):
    chunks = db.table("chunks").select("text, chunk_index").eq("session_id", session_id).order("chunk_index").execute()
    return {"chunks": chunks.data, "count": len(chunks.data)}


class RunAgentRequest(BaseModel):
    llm_provider: str = "groq"
    document_id: str | None = None


@router.post("/patient/{session_id}/run")
async def run_agent(session_id: str, req: RunAgentRequest, user: dict = Depends(get_current_user)):
    user_id = user["user_id"]
    keys_res = db.table("api_keys").select("*").eq("user_id", user_id).execute()
    keys = keys_res.data or []

    # Layer 1: Mistral OCR key
    mistral_key_obj = next((k for k in keys if k["key_type"] == "ocr" and k.get("is_active")), None)
    mistral_key = decrypt(mistral_key_obj["key_encrypted"]) if mistral_key_obj else os.environ.get("MISTRAL_API_KEY", "")

    # Layer 2: LLM key + active provider
    profile_res = db.table("profiles").select("active_llm_provider").eq("id", user_id).maybe_single().execute()
    active_prov = profile_res.data.get("active_llm_provider") if profile_res.data else None
    chosen_provider = req.llm_provider or active_prov or "groq"

    llm_key_obj = next((k for k in keys if k["key_type"] == "llm" and k["provider"] == chosen_provider and k.get("is_active")), None)
    if not llm_key_obj:
        llm_key_obj = next((k for k in keys if k["key_type"] == "llm" and k.get("is_active")), None)
        if llm_key_obj:
            chosen_provider = llm_key_obj["provider"]

    llm_key = decrypt(llm_key_obj["key_encrypted"]) if llm_key_obj else ""
    if not llm_key and chosen_provider == "groq":
        llm_key = os.environ.get("GROQ_API_KEY", "")

    if not mistral_key or not llm_key:
        raise HTTPException(status_code=400, detail="Missing required API keys (Mistral OCR and LLM)")

    # Deduplication guard
    query = db.table("runs").select("id, status").eq("session_id", session_id).eq("status", "done")
    if req.document_id:
        query = query.eq("document_id", req.document_id)
    existing = query.limit(1).execute()

    if existing.data:
        draft = db.table("drafts").select("id").eq("session_id", session_id).order("created_at", desc=True).limit(1).execute()
        draft_id = draft.data[0]["id"] if draft.data else None
        return {"status": "done", "run_id": existing.data[0]["id"], "draft_id": draft_id, "cached": True}

    run_id = str(uuid.uuid4())
    run_insert = {
        "id": run_id,
        "session_id": session_id,
        "status": "running",
        "provider_used": chosen_provider,
    }
    if req.document_id:
        run_insert["document_id"] = req.document_id
    db.table("runs").insert(run_insert).execute()

    from agent.graph import build_graph

    initial_state = {
        "session_id": session_id,
        "document_id": req.document_id,
        "user_id": user_id,
        "mistral_key": mistral_key,
        "llm_key": llm_key,
        "llm_provider": chosen_provider,
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

    try:
        result = build_graph().invoke(initial_state)
        draft = result.get("draft")
        draft_id = str(uuid.uuid4())

        db.table("drafts").insert({
            "id": draft_id,
            "session_id": session_id,
            "run_id": run_id,
            "content": draft,
        }).execute()

        db.table("runs").update({
            "status": "done",
            "trace": result.get("trace", []),
            "iteration_count": result.get("iteration", 0),
        }).eq("id", run_id).execute()

        db.table("sessions").update({"status": "done"}).eq("id", session_id).execute()
        return {"run_id": run_id, "draft_id": draft_id, "status": "done", "draft": draft}
    except Exception as e:
        db.table("runs").update({"status": "error"}).eq("id", run_id).execute()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/patient/{session_id}/summary-preview")
@router.post("/patient/{session_id}/summary-preview")
async def get_summary_preview(session_id: str, user: dict = Depends(get_current_user)):
    user_id = user["user_id"]
    res = db.table("drafts").select("id, content").eq("session_id", session_id).order("created_at", desc=True).limit(1).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="No clinical draft found for this session")

    draft_row = res.data[0]
    draft_id = draft_row["id"]
    content = draft_row.get("content") or {}
    if isinstance(content, str):
        try: content = json.loads(content)
        except Exception: content = {}

    # Guard: Return cached preview without making an LLM call if already generated
    cached_preview = content.get("summary_preview")
    if cached_preview:
        def stream_cached():
            yield sse_token_event(cached_preview)
            yield sse_done_event([], full_text=cached_preview, cached=True)
        return StreamingResponse(stream_cached(), media_type="text/event-stream")

    # Pass 4: Read locked provider from runs.provider_used
    run_res = db.table("runs").select("provider_used").eq("session_id", session_id).order("created_at", desc=True).limit(1).execute()
    locked_provider = run_res.data[0]["provider_used"] if run_res.data and run_res.data[0].get("provider_used") else None
    provider = locked_provider or "groq"

    keys_res = db.table("api_keys").select("*").eq("user_id", user_id).execute()
    keys = keys_res.data or []
    llm_key_obj = next((k for k in keys if k["key_type"] == "llm" and k["provider"] == provider and k.get("is_active")), None)
    llm_key = decrypt(llm_key_obj["key_encrypted"]) if llm_key_obj else (os.environ.get("GROQ_API_KEY", "") if provider == "groq" else "")
    if not llm_key:
        raise HTTPException(status_code=400, detail=f"Missing LLM API key for provider '{provider}'")

    model = get_llm_model(provider)
    prompt_msgs = [{
        "role": "user",
        "content": f"Here is the clinical draft: {json.dumps(content)[:2500]}\n\nWrite a 2-3 sentence clinical summary preview highlighting the principal diagnosis, one notable flag, and confirm the full discharge summary is ready."
    }]

    def stream_preview():
        acc = []
        for token in normalize_stream(provider, llm_key, model, prompt_msgs, "You are a clinical summarizer."):
            acc.append(token)
            yield sse_token_event(token)
        full_preview = "".join(acc)
        content["summary_preview"] = full_preview
        db.table("drafts").update({"content": content}).eq("id", draft_id).execute()
        yield sse_done_event([], full_text=full_preview, cached=False)

    return StreamingResponse(stream_preview(), media_type="text/event-stream")


@router.get("/patient/{session_id}/draft")
async def get_draft(session_id: str, user: dict = Depends(get_current_user)):
    res = db.table("drafts").select("*").eq("session_id", session_id).order("created_at", desc=True).limit(1).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Draft not found")
    return res.data[0]


@router.get("/patient/{session_id}/drafts")
async def get_all_drafts(session_id: str, user: dict = Depends(get_current_user)):
    res = db.table("drafts").select("*").eq("session_id", session_id).order("created_at", desc=True).execute()
    return {"drafts": res.data or []}


@router.get("/patient/{session_id}/trace")
async def get_trace(session_id: str, user: dict = Depends(get_current_user)):
    res = db.table("runs").select("trace").eq("session_id", session_id).eq("status", "done").order("created_at", desc=True).limit(1).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Trace not found")
    return res.data[0].get("trace", [])
