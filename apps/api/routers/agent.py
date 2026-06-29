from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from core.supabase import db

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

@router.post("/patient/{session_id}/run")
async def run_agent(session_id: str):
    return JSONResponse({"error": "not_implemented"}, status_code=501)

@router.get("/patient/{session_id}/draft")
async def get_draft(session_id: str):
    return JSONResponse({"error": "not_implemented"}, status_code=501)

@router.get("/patient/{session_id}/trace")
async def get_trace(session_id: str):
    return JSONResponse({"error": "not_implemented"}, status_code=501)
