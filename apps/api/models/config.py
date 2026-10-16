from pydantic import BaseModel
from typing import Literal

ProviderType = Literal["openai", "anthropic", "gemini", "groq", "mistral", "grok", "deepseek", "meta"]

class UnifiedModelConfig(BaseModel):
    id: str
    name: str
    provider: ProviderType
    is_vision_capable: bool = False
    ocr_fallback_provider: str = "mistral"

class SystemConfigResponse(BaseModel):
    selected_model: str
    provider: ProviderType
    supports_native_ocr: bool
    ocr_strategy: Literal["native_vision", "mistral_fallback"]
