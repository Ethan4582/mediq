from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from core.auth import get_current_user
from core.supabase import db
from core.encryption import decrypt
from core.rag import retrieve_context
from agent.utils import get_llm_client, get_llm_model

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


@router.post("/chat")
async def chat(req: ChatRequest, user: dict = Depends(get_current_user)):
    user_id = user["user_id"]

    # Verify session belongs to user
    session = db.table("sessions").select("id, status").eq("id", req.session_id).eq("user_id", user_id).maybe_single().execute()
    if not session.data:
        raise HTTPException(status_code=403, detail="Session not found")
    if session.data.get("status") != "done":
        raise HTTPException(status_code=400, detail={"error": "session_not_ready", "message": "Document still processing"})

    # Fetch keys
    keys_res = db.table("api_keys").select("*").eq("user_id", user_id).execute()
    keys = keys_res.data

    mistral_key_obj = next((k for k in keys if k["key_type"] == "ocr" and k.get("is_active")), None)
    if not mistral_key_obj:
        raise HTTPException(status_code=400, detail="Missing OCR API key")
    mistral_key = decrypt(mistral_key_obj["key_encrypted"])

    llm_key_obj = next((k for k in keys if k["key_type"] == "llm" and k.get("is_active")), None)
    if not llm_key_obj:
        raise HTTPException(status_code=400, detail="Missing LLM API key")
    llm_key = decrypt(llm_key_obj["key_encrypted"])
    llm_provider = llm_key_obj["provider"]

    # Retrieve context
    rag_result = retrieve_context(req.message, req.session_id, mistral_key)
    context_text = rag_result["context_text"]
    chunk_ids = [c["id"] for c in rag_result["chunks"] if c.get("id")]

    if not context_text.strip():
        answer = "I could not find relevant information in the uploaded documents."
        sources = []
    else:
        messages = [
            {"role": "system", "content": CHAT_SYSTEM_PROMPT},
            *req.message_history[-6:],
            {"role": "user", "content": f"Document context:\n{context_text}\n\nQuestion: {req.message}"}
        ]

        client = get_llm_client(llm_provider, llm_key)
        model = get_llm_model(llm_provider)

        # Plain completion (no Instructor structured output)
        raw_client = client._client if hasattr(client, "_client") else client
        response = raw_client.chat.completions.create(model=model, messages=messages)
        answer = response.choices[0].message.content
        sources = chunk_ids

    # Persist messages
    db.table("messages").insert({
        "session_id": req.session_id,
        "role": "user",
        "content": req.message,
        "metadata": {}
    }).execute()

    db.table("messages").insert({
        "session_id": req.session_id,
        "role": "assistant",
        "content": answer,
        "metadata": {"sources": sources, "source_count": len(sources)}
    }).execute()

    return {"answer": answer, "sources": sources, "source_count": len(sources)}
