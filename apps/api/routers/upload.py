import asyncio
import json
import uuid
from fastapi import APIRouter, Request, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
import fitz

from core.auth import get_current_user, require_keys
from core.supabase import db
from core.r2 import upload_file
from core.redis import set_job_progress, get_job_progress
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
    files: list[UploadFile] = File(...),
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

    # Create session
    session_row = (
        db.table("sessions")
        .insert({"user_id": user_id, "status": "processing"})
        .execute()
    )
    session_id = session_row.data[0]["id"]

    # Get OCR key
    ocr_key_row = (
        db.table("api_keys")
        .select("key_encrypted")
        .eq("user_id", user_id)
        .eq("key_type", "ocr")
        .eq("is_active", True)
        .limit(1)
        .execute()
    )
    mistral_key = decrypt(ocr_key_row.data[0]["key_encrypted"])

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
            })
            .execute()
        )
        doc_id = doc_row.data[0]["id"]
        document_ids.append(doc_id)

        # Dispatch Celery task
        from tasks.ocr import process_document
        task = process_document.delay(doc_id, session_id, mistral_key)
        if job_id is None:
            job_id = task.id
            set_job_progress(job_id, "pending", 0, "uploading")

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
        for _ in range(300):  # max 5min polling
            data = get_job_progress(job_id)
            if data:
                yield f"data: {json.dumps(data)}\n\n"
                if data.get("status") in ("done", "error"):
                    break
            else:
                yield f"data: {json.dumps({'job_id': job_id, 'status': 'pending', 'progress': 0, 'stage': 'queued'})}\n\n"
            await asyncio.sleep(1)

    return StreamingResponse(stream(), media_type="text/event-stream")
