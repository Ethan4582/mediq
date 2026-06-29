from fastapi import APIRouter
from fastapi.responses import JSONResponse

router = APIRouter(tags=["chat"])

@router.post("/chat")
async def chat():
    return JSONResponse({"error": "not_implemented"}, status_code=501)
