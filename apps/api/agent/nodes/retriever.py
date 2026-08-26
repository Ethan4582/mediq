from core.supabase import db
from core.embeddings import generate_embeddings
from agent.state import AgentState
from agent.nodes.tracer import emit_trace

SECTION_QUERIES = {
    "diagnoses": "diagnosis principal secondary disease condition problem list assessment",
    "medications_admission": "home medication prior to admission drug prescription dose route frequency",
    "medications_discharge": "discharge medication drug prescription dose route frequency",
    "vitals": "blood pressure pulse rate temperature SPO2 respiratory rate height weight",
    "labs": "laboratory results tests CBC BMP metabolic panel blood work",
    "course": "hospital course clinical narrative events procedures treatments",
    "procedures": "surgery procedure operation intervention",
    "follow_up": "follow up instructions discharge plan appointments pending results",
    "allergies": "allergies adverse drug reactions intolerances",
}

def run(state: AgentState) -> AgentState:
    print("\n--- RETRIEVER NODE START ---")
    section = state.get("current_section")
    
    if not section:
        # We need to pick a section
        remaining = [s for s in state["sections_to_extract"] if s not in state.get("extracted_fields", {})]
        if not remaining:
            print("No remaining sections to retrieve.")
            return state
        section = remaining[0]
        state["current_section"] = section
        
    print(f"Retrieving chunks for section: {section}")
    query_text = SECTION_QUERIES.get(section, section)
    
    # Generate query embedding
    try:
        embeddings = generate_embeddings([query_text], state["mistral_key"])
        query_embedding = embeddings[0]
        
        # Supabase API format for Postgres arrays/vectors expects a string like '[0.1, 0.2, ...]'
        vector_str = "[" + ",".join(str(x) for x in query_embedding) + "]"
        
        rpc_params = {
            "query_embedding": vector_str,
            "session_id": state["session_id"],
            "match_count": 15
        }
        if state.get("document_id"):
            rpc_params["document_id"] = state["document_id"]
        result = db.rpc("match_chunks", rpc_params).execute()
        
        if not result.data or len(result.data) == 0:
            q = db.table("chunks")\
                .select("id, text")\
                .eq("session_id", state["session_id"])\
                .not_.is_("embedding", "null")
            if state.get("document_id"):
                q = q.eq("document_id", state["document_id"])
            result = q.limit(15).execute()
        
        chunks = result.data
        
        # RPC may return 'text' or 'chunk_text' depending on function definition
        def extract_text(chunk: dict) -> str:
            return chunk.get("text") or chunk.get("chunk_text") or chunk.get("content") or ""

        total_chars = sum(len(extract_text(c)) for c in chunks)
        if total_chars < 500:
            fb_q = db.table("chunks").select("id, text").eq("session_id", state["session_id"])
            if state.get("document_id"):
                fb_q = fb_q.eq("document_id", state["document_id"])
            fallback = fb_q.limit(15).execute()
            fallback_chunks = fallback.data or []
            existing_ids = {c["id"] for c in chunks}
            for c in fallback_chunks:
                if c["id"] not in existing_ids:
                    chunks.append(c)
            total_chars = sum(len(extract_text(c)) for c in chunks)
        
        # Debug: log what keys the RPC returned
        if chunks:
            print(f"Chunk keys available: {list(chunks[0].keys())}")
        
        chunk_ids = [c["id"] for c in chunks]
        
        if "source_citations" not in state:
            state["source_citations"] = {}
        state["source_citations"][section] = chunk_ids
        
        state["_current_chunks"] = [extract_text(c) for c in chunks if extract_text(c)]
        
        print(f"Retrieved {len(chunks)} chunks, total chars: {total_chars}")
    except Exception as e:
        print(f"Retriever error: {e}")
        state["_current_chunks"] = []

    trace = emit_trace(
        state=state,
        node="retriever",
        reasoning=f"Retrieved top chunks for {section}",
        action="vector_search",
        inputs={"section": section, "query": query_text},
        result={"retrieved_count": len(state.get("_current_chunks", []))},
        next_node="extractor"
    )
    state["trace"].append(trace)
    return state
