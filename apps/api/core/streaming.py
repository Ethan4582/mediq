import json
from typing import Generator
from openai import OpenAI
from agent.utils import PROVIDER_MODEL_DEFAULTS


def normalize_stream(
    provider: str,
    api_key: str,
    model: str,
    messages: list[dict],
    system_prompt: str = "",
) -> Generator[str, None, None]:
    prov = (provider or "").lower()

    if prov == "anthropic":
        import anthropic
        client = anthropic.Anthropic(api_key=api_key)
        anthropic_msgs = [m for m in messages if m.get("role") != "system"]
        with client.messages.stream(
            model=model,
            max_tokens=2048,
            system=system_prompt,
            messages=anthropic_msgs,
        ) as stream:
            for text in stream.text_stream:
                if text:
                    yield text

    elif prov == "gemini":
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        model_name = model if model.startswith("models/") else f"models/{model}"
        try:
            gen_model = genai.GenerativeModel(model_name=model_name)
        except Exception:
            gen_model = genai.GenerativeModel(model_name="models/gemini-2.5-flash")

        history_parts = []
        if system_prompt:
            history_parts.append(f"System: {system_prompt}\n")
        for m in messages:
            role = "User" if m.get("role") == "user" else "Assistant"
            history_parts.append(f"{role}: {m.get('content', '')}\n")

        full_prompt = "\n".join(history_parts)
        response = gen_model.generate_content(full_prompt, stream=True)
        for chunk in response:
            if hasattr(chunk, "text") and chunk.text:
                yield chunk.text

    else:
        # OpenAI-compat providers: OpenAI, xAI, Mistral, DeepSeek, Groq
        base_urls = {
            "mistral": "https://api.mistral.ai/v1",
            "deepseek": "https://api.deepseek.com",
            "xai": "https://api.x.ai/v1",
            "grok": "https://api.x.ai/v1",
            "groq": "https://api.groq.com/openai/v1",
            "openai": "https://api.openai.com/v1",
        }
        base_url = base_urls.get(prov, "https://api.openai.com/v1")
        client = OpenAI(api_key=api_key, base_url=base_url)

        req_messages = []
        if system_prompt:
            req_messages.append({"role": "system", "content": system_prompt})
        req_messages.extend([m for m in messages if m.get("role") != "system"])

        # Fallback to working Groq model if llama-3.3-70b-versatile is specified on Groq
        target_model = model
        if prov == "groq" and model == "llama-3.3-70b-versatile":
            target_model = "openai/gpt-oss-120b"

        response = client.chat.completions.create(
            model=target_model,
            messages=req_messages,
            stream=True,
        )
        for chunk in response:
            if chunk.choices and chunk.choices[0].delta and chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content


def sse_token_event(token: str) -> str:
    return f"data: {json.dumps({'token': token})}\n\n"


def sse_done_event(sources: list, full_text: str = "", cached: bool = False) -> str:
    return f"data: {json.dumps({'done': True, 'sources': sources, 'full_text': full_text, 'cached': cached})}\n\n"
