from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Request
from core.auth import get_current_user
from core.supabase import db
from models.analytics import OverviewResponse, ActivityEntry, RecentSession

router = APIRouter(tags=["analytics"])


@router.get("/analytics/overview", response_model=OverviewResponse)
async def overview(request: Request):
    user = await get_current_user(request)
    uid = user["user_id"]

    def count(table, **filters):
        q = db.table(table).select("id", count="exact")
        for k, v in filters.items():
            q = q.eq(k, v)
        return q.execute().count or 0

    total_sessions = count("sessions", user_id=uid)
    total_runs = count("runs", **{})  # runs has session_id, need subquery workaround
    total_documents = count("documents", user_id=uid)
    total_drafts = 0

    # total_pages
    pages_resp = db.table("documents").select("page_count").eq("user_id", uid).execute()
    total_pages = sum((r.get("page_count") or 0) for r in (pages_resp.data or []))

    # runs via sessions
    session_ids_resp = db.table("sessions").select("id").eq("user_id", uid).execute()
    session_ids = [r["id"] for r in (session_ids_resp.data or [])]

    runs_data = []
    if session_ids:
        runs_resp = db.table("runs").select("id, status, created_at").in_("session_id", session_ids).execute()
        runs_data = runs_resp.data or []
    total_runs = len(runs_data)

    # drafts
    if session_ids:
        drafts_resp = db.table("drafts").select("id", count="exact").in_("session_id", session_ids).execute()
        total_drafts = drafts_resp.count or 0

    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
    week_start = (now - timedelta(days=7)).isoformat()
    runs_today = sum(1 for r in runs_data if r["created_at"] >= today_start)
    runs_this_week = sum(1 for r in runs_data if r["created_at"] >= week_start)

    # sessions by status
    sessions_resp = db.table("sessions").select("status").eq("user_id", uid).execute()
    by_status: dict[str, int] = {}
    for r in (sessions_resp.data or []):
        s = r["status"]
        by_status[s] = by_status.get(s, 0) + 1

    return OverviewResponse(
        total_sessions=total_sessions,
        total_runs=total_runs,
        total_documents=total_documents,
        total_pages=total_pages,
        total_drafts=total_drafts,
        runs_today=runs_today,
        runs_this_week=runs_this_week,
        sessions_by_status=by_status,
    )


@router.get("/analytics/activity")
async def activity(request: Request, days: int = 30):
    user = await get_current_user(request)
    uid = user["user_id"]
    days = min(days, 90)

    since = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    session_ids_resp = db.table("sessions").select("id").eq("user_id", uid).execute()
    session_ids = [r["id"] for r in (session_ids_resp.data or [])]

    # runs per day
    runs_by_day: dict[str, int] = {}
    pages_by_day: dict[str, int] = {}
    if session_ids:
        runs_resp = db.table("runs").select("created_at").in_("session_id", session_ids).gte("created_at", since).execute()
        for r in (runs_resp.data or []):
            day = r["created_at"][:10]
            runs_by_day[day] = runs_by_day.get(day, 0) + 1

    docs_resp = db.table("documents").select("created_at, page_count").eq("user_id", uid).gte("created_at", since).execute()
    for r in (docs_resp.data or []):
        day = r["created_at"][:10]
        pages_by_day[day] = pages_by_day.get(day, 0) + (r.get("page_count") or 0)

    all_days = set(runs_by_day.keys()) | set(pages_by_day.keys())
    result = sorted([
        ActivityEntry(date=d, runs=runs_by_day.get(d, 0), pages=pages_by_day.get(d, 0))
        for d in all_days
    ], key=lambda x: x.date)

    return {"activity": result}


@router.get("/analytics/sessions")
async def recent_sessions(request: Request, limit: int = 5):
    user = await get_current_user(request)
    uid = user["user_id"]
    limit = min(limit, 20)

    sessions_resp = (
        db.table("sessions")
        .select("id, title, patient_name, status, created_at")
        .eq("user_id", uid)
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )
    result = []
    for s in (sessions_resp.data or []):
        # get page count
        docs = db.table("documents").select("page_count").eq("session_id", s["id"]).execute()
        page_count = sum((r.get("page_count") or 0) for r in (docs.data or []))
        # latest run
        run = db.table("runs").select("provider_used").eq("session_id", s["id"]).order("created_at", desc=True).limit(1).execute()
        provider_used = run.data[0]["provider_used"] if run.data else None
        result.append(RecentSession(
            session_id=s["id"],
            title=s.get("patient_name") or s.get("title"),
            created_at=str(s["created_at"]),
            status=s["status"],
            page_count=page_count,
            provider_used=provider_used,
        ))
    return {"recent": result}
