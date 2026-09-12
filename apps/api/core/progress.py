from core.supabase import db
from datetime import datetime, timezone


def set_doc_progress(document_id: str, status: str, progress: int, stage: str, error: str | None = None):
    update = {"progress": progress, "stage": stage}
    if error:
        update["stage"] = f"error: {error[:200]}"
    db.table("documents").update(update).eq("id", document_id).execute()


def get_doc_progress(document_id: str) -> dict | None:
    row = db.table("documents").select("ocr_status, progress, stage").eq("id", document_id).maybe_single().execute()
    if not row.data:
        return None
    d = row.data
    return {
        "job_id": document_id,
        "status": d["ocr_status"],
        "progress": d.get("progress", 0),
        "stage": d.get("stage", "pending"),
    }
