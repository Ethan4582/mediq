import instructor
from openai import OpenAI

PROVIDER_MODEL_DEFAULTS = {
    "openai": "gpt-4o-mini",
    "anthropic": "claude-haiku-4-5-20251001",
    "gemini": "gemini-2.5-flash",
    "groq": "llama-3.3-70b-versatile",
    "mistral": "mistral-small-latest",
    "xai": "grok-4.6",
    "grok": "grok-4.6",
    "deepseek": "deepseek-chat",
}

def get_llm_client(provider: str, api_key: str):
    prov = (provider or "").lower()
    if prov == "groq":
        from groq import Groq
        return instructor.from_groq(Groq(api_key=api_key))
    elif prov == "openai":
        return instructor.from_openai(OpenAI(api_key=api_key))
    elif prov == "anthropic":
        import anthropic
        return instructor.from_anthropic(anthropic.Anthropic(api_key=api_key))
    elif prov == "mistral":
        return instructor.from_openai(OpenAI(
            api_key=api_key,
            base_url="https://api.mistral.ai/v1"
        ))
    elif prov == "gemini":
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        client = instructor.from_gemini(client=genai.GenerativeModel("models/gemini-2.5-flash"))
        orig_create = client.chat.completions.create
        def _gemini_create(*args, **kwargs):
            clean_kw = {k: v for k, v in kwargs.items() if k != "model"}
            return orig_create(*args, **clean_kw)
        client.chat.completions.create = _gemini_create
        return client
    elif prov == "deepseek":
        return instructor.from_openai(OpenAI(
            api_key=api_key,
            base_url="https://api.deepseek.com"
        ))
    elif prov in ("xai", "grok"):
        return instructor.from_openai(OpenAI(
            api_key=api_key,
            base_url="https://api.x.ai/v1"
        ))
    else:
        return instructor.from_openai(OpenAI(api_key=api_key))

def get_llm_model(provider: str) -> str:
    prov = (provider or "").lower()
    return PROVIDER_MODEL_DEFAULTS.get(prov, "llama-3.3-70b-versatile")
