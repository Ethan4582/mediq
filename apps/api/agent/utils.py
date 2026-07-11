import instructor
from openai import OpenAI
from groq import Groq
from anthropic import Anthropic

def get_instructor_client(provider: str, key: str):
    if provider.lower() == "groq":
        return instructor.from_groq(Groq(api_key=key), mode=instructor.Mode.TOOLS)
    elif provider.lower() == "anthropic":
        return instructor.from_anthropic(Anthropic(api_key=key))
    else:
        # Default to openai
        return instructor.from_openai(OpenAI(api_key=key))

def get_llm_model(provider: str) -> str:
    if provider.lower() == "groq":
        return "llama3-70b-8192"
    elif provider.lower() == "anthropic":
        return "claude-3-5-sonnet-20240620"
    else:
        return "gpt-4o-mini"
