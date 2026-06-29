from pydantic import BaseModel

class OverviewResponse(BaseModel):
    total_sessions: int
    total_runs: int
    total_documents: int
    total_pages: int
    total_drafts: int
    runs_today: int
    runs_this_week: int
    sessions_by_status: dict[str, int]

class ActivityEntry(BaseModel):
    date: str
    runs: int
    pages: int

class RecentSession(BaseModel):
    session_id: str
    title: str | None
    created_at: str
    status: str
    page_count: int
    provider_used: str | None
