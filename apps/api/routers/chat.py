from fastapi import APIRouter

router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("/")
def send_message():
    return {"detail": "Not implemented"}
