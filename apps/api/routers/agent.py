from fastapi import APIRouter
from fastapi.responses import JSONResponse

router = APIRouter(tags=["agent"])

@router.post("/patient/{session_id}/run")
async def run_agent(session_id: str):
    return JSONResponse({"error": "not_implemented"}, status_code=501)

@router.get("/patient/{session_id}/draft")
async def get_draft(session_id: str):
    return JSONResponse({"error": "not_implemented"}, status_code=501)

@router.get("/patient/{session_id}/trace")
async def get_trace(session_id: str):
    return JSONResponse({"error": "not_implemented"}, status_code=501)
