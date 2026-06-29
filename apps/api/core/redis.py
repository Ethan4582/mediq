import json
import httpx
from core.config import settings

_base = settings.UPSTASH_REDIS_REST_URL.rstrip("/")
_token = settings.UPSTASH_REDIS_REST_TOKEN
_headers = {"Authorization": f"Bearer {_token}"}

def _cmd(*args):
    resp = httpx.post(f"{_base}", json=list(args), headers=_headers)
    resp.raise_for_status()
    return resp.json()

def set_job_progress(job_id: str, status: str, progress: int, stage: str, error: str | None = None):
    payload = {"status": status, "progress": progress, "stage": stage, "job_id": job_id}
    if error:
        payload["error"] = error
    _cmd("SET", f"job:{job_id}:progress", json.dumps(payload), "EX", 3600)

def get_job_progress(job_id: str) -> dict | None:
    result = _cmd("GET", f"job:{job_id}:progress")
    raw = result.get("result")
    if raw:
        return json.loads(raw)
    return None
