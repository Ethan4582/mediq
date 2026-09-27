import instructor
from openai import OpenAI

def get_llm_client(provider: str, api_key: str):
    if provider == "groq":
        from groq import Groq
        return instructor.from_groq(Groq(api_key=api_key))
    elif provider == "openai":
        return instructor.from_openai(OpenAI(api_key=api_key))
    elif provider == "anthropic":
        import anthropic
        return instructor.from_anthropic(anthropic.Anthropic(api_key=api_key))
    elif provider == "mistral":
        return instructor.from_openai(OpenAI(
            api_key=api_key,
            base_url="https://api.mistral.ai/v1"
        ))
    elif provider == "gemini":
        return instructor.from_openai(OpenAI(
            api_key=api_key,
            base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
        ))
    elif provider == "deepseek":
        return instructor.from_openai(OpenAI(
            api_key=api_key,
            base_url="https://api.deepseek.com"
        ))
    elif provider == "grok":
        return instructor.from_openai(OpenAI(
            api_key=api_key,
            base_url="https://api.x.ai/v1"
        ))
    elif provider == "meta":
        return instructor.from_openai(OpenAI(
            api_key=api_key,
            base_url="https://api.llama.com/v1"
        ))
    else:
        return instructor.from_openai(OpenAI(api_key=api_key))

def get_llm_model(provider: str) -> str:
    prov = provider.lower()
    if prov == "groq":
        return "llama-3.3-70b-versatile"
    elif prov == "anthropic":
        return "claude-3-5-sonnet-20241022"
    elif prov == "mistral":
        return "mistral-large-latest"
    elif prov == "gemini":
        return "gemini-2.0-flash"
    elif prov == "deepseek":
        return "deepseek-chat"
    elif prov == "grok":
        return "grok-2-latest"
    elif prov == "meta":
        return "llama-3.3-70b-instruct"
    else:
        return "gpt-4o-mini"
