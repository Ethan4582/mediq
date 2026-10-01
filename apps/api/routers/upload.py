import asyncio
import json
import uuid
from fastapi import APIRouter, Request, HTTPException, UploadFile, File, Form, BackgroundTasks
from fastapi.responses import StreamingResponse
import fitz

from core.auth import require_keys
from core.supabase import db
from core.r2 import upload_file
from core.progress import get_doc_progress
from core.encryption import decrypt
from models.upload import UploadResponse, JobStatus

router = APIRouter(tags=["upload"])

ALLOWED_TYPES = {"application/pdf", "image/jpeg", "image/png", "image/jpg"}
MAX_SIZE = 20 * 1024 * 1024
MAX_PAGES = 100
MAX_FILES = 5


@router.post("/upload", response_model=UploadResponse)
async def upload_documents(
    request: Request,
    background_tasks: BackgroundTasks,
    files: list[UploadFile] = File(...),
    session_id: str | None = Form(None),
):
    user = await require_keys(request)
    user_id = user["user_id"]

    if len(files) > MAX_FILES:
        raise HTTPException(400, {"error": "too_many_files", "limit": MAX_FILES})

    file_data = []
    total_pages = 0
    for f in files:
        contents = await f.read()
        if len(contents) > MAX_SIZE:
            raise HTTPException(400, {"error": "file_too_large", "limit_mb": 20, "file": f.filename})
        if f.content_type not in ALLOWED_TYPES:
            raise HTTPException(400, {"error": "unsupported_file_type", "file": f.filename})
        if f.content_type == "application/pdf":
            doc = fitz.open(stream=contents, filetype="pdf")
            pages = doc.page_count
            doc.close()
        else:
            pages = 1
        if pages > MAX_PAGES:
            raise HTTPException(400, {"error": "page_limit_exceeded", "pages": pages, "limit": MAX_PAGES})
        total_pages += pages
        file_data.append({"file": f, "contents": contents, "pages": pages})

    # Create session if not provided
    if not session_id:
        session_row = (
            db.table("sessions")
            .insert({"user_id": user_id, "status": "processing"})
            .execute()
        )
        session_id = session_row.data[0]["id"]
    else:
        db.table("sessions").update({"status": "processing"}).eq("id", session_id).execute()

    # Retrieve user's active model provider & decrypted API key for unified OCR + reasoning
    profile_row = db.table("profiles").select("active_llm_provider").eq("id", user_id).maybe_single().execute()
    active_provider = (profile_row.data.get("active_llm_provider") if profile_row.data else None)

    keys_resp = (
        db.table("api_keys")
        .select("provider, key_encrypted")
        .eq("user_id", user_id)
        .eq("is_active", True)
        .execute()
    )
    keys_list = keys_resp.data or []
    chosen_provider = active_provider or (keys_list[0]["provider"] if keys_list else "openai")
    matching = [k for k in keys_list if k.get("provider") == chosen_provider]
    active_record = matching[0] if matching else (keys_list[0] if keys_list else None)

    decrypted_key = decrypt(active_record["key_encrypted"]) if active_record else ""
    if active_record:
        chosen_provider = active_record["provider"]

    document_ids = []
    job_id = None
    for item in file_data:
        f = item["file"]
        contents = item["contents"]
        pages = item["pages"]
        r2_key = f"{user_id}/{session_id}/{uuid.uuid4()}_{f.filename}"
        upload_file(contents, r2_key, f.content_type or "application/octet-stream")

        doc_row = (
            db.table("documents")
            .insert({
                "session_id": session_id,
                "user_id": user_id,
                "file_name": f.filename,
                "r2_key": r2_key,
                "page_count": pages,
                "ocr_status": "pending",
                "progress": 0,
                "stage": "queued",
            })
            .execute()
        )
        doc_id = doc_row.data[0]["id"]
        document_ids.append(doc_id)

        from tasks.ocr import process_document
        background_tasks.add_task(process_document, doc_id, session_id, chosen_provider, decrypted_key)

        # Record upload in session chat stream so it renders on chat surface immediately
        db.table("messages").insert({
            "id": str(uuid.uuid4()),
            "session_id": session_id,
            "role": "user",
            "content": f"Uploaded medical document: {f.filename} ({pages} page{'s' if pages != 1 else ''})",
            "metadata": {
                "type": "document_upload",
                "document_id": doc_id,
                "file_name": f.filename,
                "page_count": pages,
            }
        }).execute()

        if job_id is None:
            job_id = doc_id

    return UploadResponse(
        session_id=session_id,
        job_id=job_id,
        document_ids=document_ids,
        page_count=total_pages,
        status="pending",
    )


@router.get("/upload/{job_id}/status")
async def job_status_stream(job_id: str):
    async def stream():
        for _ in range(300):  # max 5 min
            data = get_doc_progress(job_id)
            if data:
                yield f"data: {json.dumps(data)}\n\n"
                if data.get("status") in ("done", "failed", "error"):
                    break
            else:
                yield f"data: {json.dumps({'job_id': job_id, 'status': 'pending', 'progress': 0, 'stage': 'queued'})}\n\n"
            await asyncio.sleep(1)

    return StreamingResponse(stream(), media_type="text/event-stream")
