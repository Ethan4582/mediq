import instructor
from openai import OpenAI
from groq import Groq
from anthropic import Anthropic

def get_llm_client(provider: str, api_key: str):
    if provider == "groq":
        from groq import Groq
        return instructor.from_groq(Groq(api_key=api_key))
    elif provider == "openai":
        from openai import OpenAI
        return instructor.from_openai(OpenAI(api_key=api_key))
    elif provider == "anthropic":
        import anthropic
        return instructor.from_anthropic(anthropic.Anthropic(api_key=api_key))
    elif provider == "mistral":
        from openai import OpenAI
        return instructor.from_openai(OpenAI(
            api_key=api_key,
            base_url="https://api.mistral.ai/v1"
        ))
    elif provider == "gemini":
        from openai import OpenAI
        return instructor.from_openai(OpenAI(
            api_key=api_key,
            base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
        ))
    else:
        from openai import OpenAI
        return instructor.from_openai(OpenAI(api_key=api_key))

def get_llm_model(provider: str) -> str:
    if provider.lower() == "groq":
        return "llama-3.3-70b-versatile"
    elif provider.lower() == "anthropic":
        return "claude-3-5-sonnet-20240620"
    elif provider.lower() == "mistral":
        return "mistral-large-latest"
    elif provider.lower() == "gemini":
        return "gemini-2.0-flash"
    else:
        return "gpt-4o-mini"
