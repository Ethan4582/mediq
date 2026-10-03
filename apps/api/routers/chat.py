import os
import uuid
import json
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from core.auth import get_current_user
from core.supabase import db
from core.encryption import decrypt
from core.rag import retrieve_context
from core.streaming import normalize_stream, sse_token_event, sse_done_event
from agent.utils import get_llm_model

router = APIRouter(tags=["chat"])

CHAT_SYSTEM_PROMPT = """You are a clinical assistant helping a doctor understand a patient case.
Answer questions based ONLY on the provided document excerpts.
Never infer or add information not present in the text.
If the answer is not in the provided context, say: "This information was not found in the uploaded documents."
Always be concise and clinically precise."""


class ChatRequest(BaseModel):
    session_id: str
    message: str
    message_history: list[dict] = []
    model: str | None = None
    provider: str | None = None


@router.post("/chat")
async def chat(req: ChatRequest, user: dict = Depends(get_current_user)):
    user_id = user["user_id"]

    session = db.table("sessions").select("id, status").eq("id", req.session_id).eq("user_id", user_id).maybe_single().execute()
    if not session.data:
        raise HTTPException(status_code=403, detail="Session not found")
    if session.data.get("status") != "done":
        raise HTTPException(status_code=400, detail={"error": "session_not_ready", "message": "Document still processing"})

    # Pass 4: Provider Lock Per Session - Read runs.provider_used first
    run_res = (
        db.table("runs")
        .select("provider_used")
        .eq("session_id", req.session_id)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    locked_provider = run_res.data[0]["provider_used"] if run_res.data and run_res.data[0].get("provider_used") else None

    profile_res = db.table("profiles").select("active_llm_provider").eq("id", user_id).maybe_single().execute()
    profile_provider = profile_res.data.get("active_llm_provider") if profile_res.data else None

    llm_provider = locked_provider or req.provider or profile_provider or "groq"

    keys_res = db.table("api_keys").select("*").eq("user_id", user_id).execute()
    keys = keys_res.data or []

    # Layer 1: Mistral OCR key for RAG embeddings
    mistral_key_obj = next((k for k in keys if k["key_type"] == "ocr" and k.get("is_active")), None)
    mistral_key = decrypt(mistral_key_obj["key_encrypted"]) if mistral_key_obj else os.environ.get("MISTRAL_API_KEY", "")

    # Layer 2: LLM key
    llm_key_obj = next((k for k in keys if k["key_type"] == "llm" and k["provider"] == llm_provider and k.get("is_active")), None)
    if not llm_key_obj:
        llm_key_obj = next((k for k in keys if k["key_type"] == "llm" and k["provider"] == llm_provider), None)

    llm_key = decrypt(llm_key_obj["key_encrypted"]) if llm_key_obj else ""
    if not llm_key and llm_provider == "groq":
        llm_key = os.environ.get("GROQ_API_KEY", "")

    if not llm_key:
        raise HTTPException(status_code=400, detail=f"Missing LLM API key for provider '{llm_provider}'")

    # Context retrieval
    rag_result = retrieve_context(req.message, req.session_id, mistral_key) if mistral_key else {"chunks": [], "context_text": ""}
    context_text = rag_result.get("context_text", "")

    detailed_sources = [
        {
            "chunk_id": c["id"],
            "page_num": c.get("page_num", 1),
            "source_file": c.get("metadata", {}).get("source_file", "Document") if isinstance(c.get("metadata"), dict) else "Document",
            "excerpt": (c.get("text") or c.get("chunk_text") or c.get("content") or "")[:150]
        }
        for c in rag_result.get("chunks", []) if c.get("id")
    ]

    model = req.model if req.model and req.model != "default" else get_llm_model(llm_provider)

    messages = [
        *req.message_history[-6:],
        {"role": "user", "content": f"Document context:\n{context_text}\n\nQuestion: {req.message}" if context_text else req.message}
    ]

    # Save user message
    db.table("messages").insert({
        "id": str(uuid.uuid4()),
        "session_id": req.session_id,
        "role": "user",
        "content": req.message,
        "metadata": {}
    }).execute()

    def stream_generator():
        accumulated_text = []
        if not context_text.strip():
            fallback_answer = "I could not find relevant information in the uploaded documents."
            yield sse_token_event(fallback_answer)
            accumulated_text.append(fallback_answer)
        else:
            for token in normalize_stream(llm_provider, llm_key, model, messages, CHAT_SYSTEM_PROMPT):
                accumulated_text.append(token)
                yield sse_token_event(token)

        full_answer = "".join(accumulated_text)

        # Save assistant message
        db.table("messages").insert({
            "id": str(uuid.uuid4()),
            "session_id": req.session_id,
            "role": "assistant",
            "content": full_answer,
            "metadata": {"sources": detailed_sources, "source_count": len(detailed_sources), "provider_used": llm_provider}
        }).execute()

        # Final SSE event with sources
        yield sse_done_event(detailed_sources, full_text=full_answer)

    return StreamingResponse(stream_generator(), media_type="text/event-stream")
