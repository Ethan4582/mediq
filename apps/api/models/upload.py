from pydantic import BaseModel
from typing import Literal

class UploadResponse(BaseModel):
    session_id: str
    job_id: str
    document_ids: list[str]
    page_count: int
    status: str = "pending"

class JobStatus(BaseModel):
    job_id: str
    status: str
    progress: int
    stage: str
    error: str | None = None
