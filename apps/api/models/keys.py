from pydantic import BaseModel
from typing import Literal

class AddKeyRequest(BaseModel):
    provider: Literal["groq", "openai", "anthropic", "mistral"]
    key: str
    key_type: Literal["ocr", "llm"]

class KeyResponse(BaseModel):
    id: str
    provider: str
    key_type: str
    key_last4: str
    is_active: bool
    created_at: str
