from fastapi import APIRouter

router = APIRouter(prefix="/patient", tags=["agent"])

@router.post("/{session_id}/run")
def run_agent(session_id: str):
    return {"detail": "Not implemented"}
