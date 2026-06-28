from fastapi import APIRouter

router = APIRouter(prefix="/keys", tags=["keys"])

@router.get("/")
def get_keys():
    return {"detail": "Not implemented"}

@router.post("/")
def add_key():
    return {"detail": "Not implemented"}

@router.delete("/{id}")
def delete_key(id: str):
    return {"detail": "Not implemented"}
