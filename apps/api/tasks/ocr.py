import math
import base64
import traceback
from datetime import datetime, timezone
import httpx
import fitz

from celery import Celery
from core.config import settings
from core.supabase import db
from core.r2 import download_file
from core.redis import set_job_progress

# Celery app using Upstash Redis REST → use rediss:// URL
# Upstash requires token-based URL: rediss://:TOKEN@HOST:6379
_redis_url = (
    settings.UPSTASH_REDIS_REST_URL
    .replace("https://", "rediss://:")
    .rstrip("/") + f"@{settings.UPSTASH_REDIS_REST_URL.replace('https://', '')}:6379"
    if "upstash" in settings.UPSTASH_REDIS_REST_URL
    else settings.UPSTASH_REDIS_REST_URL
)
# Simpler: use token in URL format for Upstash
_host = settings.UPSTASH_REDIS_REST_URL.replace("https://", "")
_redis_broker = f"rediss://:{settings.UPSTASH_REDIS_REST_TOKEN}@{_host}:6379"

celery_app = Celery("mediq", broker=_redis_broker, backend=_redis_broker)
celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    broker_use_ssl={"ssl_cert_reqs": None},
    redis_backend_use_ssl={"ssl_cert_reqs": None},
)


def _ocr_pdf_batch(pages_bytes: bytes, mistral_key: str) -> str:
    b64 = base64.b64encode(pages_bytes).decode()
    for attempt in range(3):
        try:
            resp = httpx.post(
                "https://api.mistral.ai/v1/ocr",
                headers={"Authorization": f"Bearer {mistral_key}", "Content-Type": "application/json"},
                json={"model": "mistral-ocr-latest", "document": {"type": "document_url", "document_url": f"data:application/pdf;base64,{b64}"}},
                timeout=60,
            )
            resp.raise_for_status()
            data = resp.json()
            return "\n\n".join(p.get("markdown", "") for p in data.get("pages", []))
        except Exception:
            if attempt == 2:
                raise
            import time; time.sleep(2)
    return ""


def _ocr_image(img_bytes: bytes, content_type: str, mistral_key: str) -> str:
    b64 = base64.b64encode(img_bytes).decode()
    data_url = f"data:{content_type};base64,{b64}"
    resp = httpx.post(
        "https://api.mistral.ai/v1/ocr",
        headers={"Authorization": f"Bearer {mistral_key}", "Content-Type": "application/json"},
        json={"model": "mistral-ocr-latest", "document": {"type": "image_url", "image_url": data_url}},
        timeout=60,
    )
    resp.raise_for_status()
    data = resp.json()
    return "\n\n".join(p.get("markdown", "") for p in data.get("pages", []))


def _chunk_text(text: str) -> list[str]:
    raw = text.split("\n\n")
    chunks = []
    for block in raw:
        if len(block) > 500:
            sub = block.split("\n")
            buf = ""
            for line in sub:
                if len(buf) + len(line) < 500:
                    buf += line + "\n"
                else:
                    if buf.strip():
                        chunks.append(buf.strip())
                    buf = line + "\n"
            if buf.strip():
                chunks.append(buf.strip())
        else:
            chunks.append(block.strip())
    return [c for c in chunks if len(c) >= 20]


@celery_app.task(bind=True, name="tasks.ocr.process_document")
def process_document(self, document_id: str, session_id: str, mistral_api_key: str):
    task_id = self.request.id
    try:
        doc_row = db.table("documents").select("*").eq("id", document_id).single().execute()
        doc = doc_row.data

        file_bytes = download_file(doc["r2_key"])
        set_job_progress(task_id, "processing", 5, "ocr")
        db.table("documents").update({"ocr_status": "processing"}).eq("id", document_id).execute()

        file_name: str = doc["file_name"] or ""
        is_pdf = file_name.lower().endswith(".pdf")
        extracted_text = ""

        if is_pdf:
            pdf = fitz.open(stream=file_bytes, filetype="pdf")
            page_count = pdf.page_count
            total_batches = math.ceil(page_count / 20)
            for i in range(total_batches):
                start = i * 20
                end = min(start + 20, page_count)
                batch_pdf = fitz.open()
                batch_pdf.insert_pdf(pdf, from_page=start, to_page=end - 1)
                batch_bytes = batch_pdf.tobytes()
                batch_pdf.close()
                extracted_text += _ocr_pdf_batch(batch_bytes, mistral_api_key)
                progress = int((i + 1) / total_batches * 55) + 5
                set_job_progress(task_id, "processing", progress, "ocr")
            pdf.close()
        else:
            # image
            content_type = "image/jpeg" if file_name.lower().endswith(".jpg") or file_name.lower().endswith(".jpeg") else "image/png"
            extracted_text = _ocr_image(file_bytes, content_type, mistral_api_key)

        db.table("documents").update({"raw_text": extracted_text, "ocr_status": "done"}).eq("id", document_id).execute()
        set_job_progress(task_id, "processing", 65, "chunking")

        chunks = _chunk_text(extracted_text)
        chunk_rows = [
            {
                "document_id": document_id,
                "session_id": session_id,
                "text": c,
                "page_num": max(1, (i // 5) + 1),
                "chunk_index": i,
                "metadata": {"doc_type": "unknown", "source_file": file_name},
            }
            for i, c in enumerate(chunks)
        ]
        if chunk_rows:
            db.table("chunks").insert(chunk_rows).execute()

        set_job_progress(task_id, "done", 100, "ready")
        db.table("sessions").update({"status": "done", "updated_at": datetime.now(timezone.utc).isoformat()}).eq("id", session_id).execute()
        db.table("documents").update({"ocr_status": "done"}).eq("id", document_id).execute()

    except Exception as e:
        set_job_progress(task_id, "error", 0, "error", error=str(e))
        db.table("documents").update({"ocr_status": "failed"}).eq("id", document_id).execute()
        db.table("sessions").update({"status": "error"}).eq("id", session_id).execute()
        traceback.print_exc()
        raise
