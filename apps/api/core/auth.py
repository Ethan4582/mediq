from fastapi import HTTPException, Request
from core.supabase import db

async def get_current_user(request: Request) -> dict:
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail={"error": "unauthorized"})
    token = auth.removeprefix("Bearer ").strip()
    try:
        resp = db.auth.get_user(token)
        user = resp.user
        if not user:
            raise ValueError("no user")
    except Exception:
        raise HTTPException(status_code=401, detail={"error": "unauthorized"})

    profile = (
        db.table("profiles")
        .select("*")
        .eq("id", str(user.id))
        .maybe_single()
        .execute()
    )
    data = profile.data or {}
    return {
        "user_id": str(user.id),
        "has_mistral_key": bool(data.get("has_mistral_key")),
        "has_llm_key": bool(data.get("has_llm_key")),
        "active_llm_provider": data.get("active_llm_provider"),
    }

async def require_keys(request: Request) -> dict:
    user = await get_current_user(request)
    missing = []
    if not user["has_mistral_key"]:
        missing.append("mistral")
    if not user["has_llm_key"]:
        missing.append("llm_provider")
    if missing:
        raise HTTPException(
            status_code=403,
            detail={"error": "keys_required", "missing": missing, "redirect": "/api-keys"},
        )
    return user
