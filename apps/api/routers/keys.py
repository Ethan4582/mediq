from fastapi import APIRouter, Request, HTTPException, Response
import httpx
from core.auth import get_current_user
from core.supabase import db
from core.encryption import encrypt, decrypt
from models.keys import AddKeyRequest, KeyResponse

router = APIRouter(tags=["keys"])

async def _validate_key(provider: str, key: str):
    prov = (provider or "").lower()
    try:
        if prov == "gemini":
            import google.generativeai as genai
            genai.configure(api_key=key.strip())
            next(iter(genai.list_models()))
            return

        async with httpx.AsyncClient(timeout=10) as client:
            if prov == "groq":
                r = await client.get(
                    "https://api.groq.com/openai/v1/models",
                    headers={"Authorization": f"Bearer {key}"},
                )
            elif prov == "openai":
                r = await client.get(
                    "https://api.openai.com/v1/models",
                    headers={"Authorization": f"Bearer {key}"},
                )
            elif prov == "anthropic":
                r = await client.post(
                    "https://api.anthropic.com/v1/messages",
                    headers={"x-api-key": key, "anthropic-version": "2023-06-01"},
                    json={
                        "model": "claude-haiku-4-5-20251001",
                        "max_tokens": 1,
                        "messages": [{"role": "user", "content": "hi"}],
                    },
                )
            elif prov == "mistral":
                r = await client.get(
                    "https://api.mistral.ai/v1/models",
                    headers={"Authorization": f"Bearer {key}"},
                )
            elif prov == "deepseek":
                r = await client.get(
                    "https://api.deepseek.com/models",
                    headers={"Authorization": f"Bearer {key}"},
                )
            elif prov in ("xai", "grok"):
                r = await client.get(
                    "https://api.x.ai/v1/models",
                    headers={"Authorization": f"Bearer {key}"},
                )
            else:
                raise HTTPException(400, {"error": "invalid_provider"})

            if r.status_code >= 400:
                raise HTTPException(400, {"error": "invalid_key", "provider": provider})
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(400, {"error": "invalid_key", "provider": provider, "detail": str(e)})


@router.post("/keys", response_model=KeyResponse)
async def add_key(body: AddKeyRequest, request: Request):
    user = await get_current_user(request)
    body.key = body.key.strip()
    await _validate_key(body.provider, body.key)

    encrypted = encrypt(body.key)
    row = (
        db.table("api_keys")
        .insert({
            "user_id": user["user_id"],
            "provider": body.provider,
            "key_type": body.key_type,
            "key_last4": body.key[-4:],
            "key_encrypted": encrypted,
            "is_active": True,
        })
        .execute()
    )
    key_row = row.data[0]

    profile_update = {}
    if body.key_type == "ocr":
        profile_update["has_mistral_key"] = True
    if body.key_type == "llm":
        profile_update["has_llm_key"] = True
        profile_update["active_llm_provider"] = body.provider
    if profile_update:
        db.table("profiles").update(profile_update).eq("id", user["user_id"]).execute()

    return KeyResponse(
        id=key_row["id"],
        provider=key_row["provider"],
        key_type=key_row["key_type"],
        key_last4=key_row["key_last4"],
        is_active=key_row["is_active"],
        created_at=str(key_row["created_at"]),
    )


@router.get("/keys", response_model=list[KeyResponse])
async def list_keys(request: Request):
    user = await get_current_user(request)
    rows = (
        db.table("api_keys")
        .select("id, provider, key_type, key_last4, is_active, created_at")
        .eq("user_id", user["user_id"])
        .order("created_at", desc=True)
        .execute()
    )
    keys_res = [
        KeyResponse(
            id=r["id"],
            provider=r["provider"],
            key_type=r["key_type"],
            key_last4=r["key_last4"],
            is_active=r["is_active"],
            created_at=str(r["created_at"]),
        )
        for r in (rows.data or [])
    ]
    return keys_res


@router.delete("/keys/{key_id}", status_code=204)
async def delete_key(key_id: str, request: Request):
    user = await get_current_user(request)
    existing = (
        db.table("api_keys")
        .select("id, key_type")
        .eq("id", key_id)
        .eq("user_id", user["user_id"])
        .maybe_single()
        .execute()
    )
    if not existing.data:
        raise HTTPException(404, {"error": "not_found"})
    key_type = existing.data["key_type"]
    db.table("api_keys").delete().eq("id", key_id).execute()

    remaining = (
        db.table("api_keys")
        .select("provider")
        .eq("user_id", user["user_id"])
        .eq("key_type", key_type)
        .eq("is_active", True)
        .execute()
    )
    profile_update = {}
    if key_type == "ocr" and not remaining.data:
        profile_update["has_mistral_key"] = False
    if key_type == "llm":
        if not remaining.data:
            profile_update["has_llm_key"] = False
            profile_update["active_llm_provider"] = None
        else:
            profile_update["active_llm_provider"] = remaining.data[0]["provider"]
    if profile_update:
        db.table("profiles").update(profile_update).eq("id", user["user_id"]).execute()

    return Response(status_code=204)


@router.patch("/keys/{key_id}/activate")
async def activate_key(key_id: str, request: Request):
    user = await get_current_user(request)
    key_row = (
        db.table("api_keys")
        .select("id, provider, key_type")
        .eq("id", key_id)
        .eq("user_id", user["user_id"])
        .maybe_single()
        .execute()
    )
    if not key_row.data:
        raise HTTPException(404, {"error": "not_found"})
    provider = key_row.data["provider"]
    db.table("profiles").update({"active_llm_provider": provider}).eq("id", user["user_id"]).execute()
    return {"active_llm_provider": provider}


@router.post("/keys/validate")
async def validate_key_only(body: AddKeyRequest, request: Request):
    await get_current_user(request)
    await _validate_key(body.provider, body.key)
    return {"valid": True}


@router.get("/config")
async def get_system_config(request: Request):
    user = await get_current_user(request)
    profile_res = db.table("profiles").select("active_llm_provider").eq("id", user["user_id"]).maybe_single().execute()
    active_provider = (profile_res.data.get("active_llm_provider") if profile_res.data else None) or "openai"
    is_vision = active_provider in ("openai", "anthropic", "gemini")

    return {
        "selected_model": "gpt-4o-mini" if active_provider == "openai" else f"{active_provider}-default",
        "provider": active_provider,
        "supports_native_ocr": is_vision,
        "ocr_strategy": "native_vision" if is_vision else "mistral_fallback"
    }
