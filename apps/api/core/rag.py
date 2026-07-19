from core.supabase import db
from core.embeddings import generate_embeddings


def retrieve_context(question: str, session_id: str, mistral_key: str, match_count: int = 12) -> dict:
    # 1. Vector Search
    embeddings = generate_embeddings([question], mistral_key)
    query_embedding = embeddings[0]
    vector_str = "[" + ",".join(str(x) for x in query_embedding) + "]"

    result = db.rpc("match_chunks", {
        "query_embedding": vector_str,
        "session_id": session_id,
        "match_count": match_count
    }).execute()

    vector_results = result.data or []

    # 2. Keyword Search
    VITAL_KEYWORDS = {
        "vital": ["%bp%", "%pulse%", "%spo2%", "%temp%", "%rr%", "%hr%", "%map%", "%gcs%", "%weight%", "%height%", "%bmi%"],
        "blood pressure": ["%bp%", "%mmhg%", "%100/60%"],
        "medication": ["%tab%", "%inj%", "%mg%", "%ml%"],
        "diagnosis": ["%diagnosis%", "%dka%", "%uti%", "%gastro%"],
        "heart rate": ["%hr%", "%pulse%", "%bpm%"],
        "temperature": ["%temp%", "%°f%", "%°c%", "%fever%"],
    }
    
    keyword_results = []
    question_lower = question.lower()
    for trigger, patterns in VITAL_KEYWORDS.items():
        if trigger in question_lower:
            for pattern in patterns:
                rows = db.table("chunks").select("id, text, page_num, metadata, chunk_text, content")\
                    .eq("session_id", session_id)\
                    .ilike("text", pattern)\
                    .limit(5).execute()
                keyword_results.extend(rows.data or [])

    # 3. Merge & Deduplicate with Scoring
    seen = {}
    for c in vector_results:
        seen[c["id"]] = {**c, "score": 1.0}
    for c in keyword_results:
        if c["id"] in seen:
            seen[c["id"]]["score"] += 0.8
        else:
            seen[c["id"]] = {**c, "score": 0.8}

    chunks = sorted(seen.values(), key=lambda x: x["score"], reverse=True)[:match_count]

    def extract_text(c: dict) -> str:
        return c.get("text") or c.get("chunk_text") or c.get("content") or ""

    total_chars = sum(len(extract_text(c)) for c in chunks)
    if total_chars < 300:
        fallback = db.table("chunks").select("id, text, page_num, metadata, chunk_text, content")\
            .eq("session_id", session_id).limit(15).execute()
        fallback_chunks = fallback.data or []
        existing_ids = {c["id"] for c in chunks}
        for c in fallback_chunks:
            if c["id"] not in existing_ids:
                chunks.append(c)

    context_text = "\n---\n".join(extract_text(c) for c in chunks if extract_text(c))
    return {"chunks": chunks, "context_text": context_text}
