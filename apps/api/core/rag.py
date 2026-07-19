from core.supabase import db
from core.embeddings import generate_embeddings


def retrieve_context(question: str, session_id: str, mistral_key: str, match_count: int = 10) -> dict:
    embeddings = generate_embeddings([question], mistral_key)
    query_embedding = embeddings[0]
    vector_str = "[" + ",".join(str(x) for x in query_embedding) + "]"

    result = db.rpc("match_chunks", {
        "query_embedding": vector_str,
        "session_id": session_id,
        "match_count": match_count
    }).execute()

    chunks = result.data or []

    def extract_text(c: dict) -> str:
        return c.get("text") or c.get("chunk_text") or c.get("content") or ""

    total_chars = sum(len(extract_text(c)) for c in chunks)
    if total_chars < 300:
        fallback = db.table("chunks").select("id, text").eq("session_id", session_id).limit(15).execute()
        fallback_chunks = fallback.data or []
        existing_ids = {c["id"] for c in chunks}
        for c in fallback_chunks:
            if c["id"] not in existing_ids:
                chunks.append(c)

    context_text = "\n---\n".join(extract_text(c) for c in chunks if extract_text(c))
    return {"chunks": chunks, "context_text": context_text}
