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
        
        result = db.rpc("match_chunks", {
            "query_embedding": vector_str,
            "session_id": state["session_id"],
            "match_count": 8
        }).execute()
        
        if not result.data or len(result.data) == 0:
            result = db.table("chunks")\
                .select("id, text")\
                .eq("session_id", state["session_id"])\
                .not_.is_("embedding", "null")\
                .limit(8)\
                .execute()
        
        chunks = result.data
        chunk_ids = [c["id"] for c in chunks]
        
        if "source_citations" not in state:
            state["source_citations"] = {}
        state["source_citations"][section] = chunk_ids
        
        # Put the retrieved texts in a temporary state key for the extractor to use
        state["_current_chunks"] = [c["text"] for c in chunks]
        
        print(f"Retrieved {len(chunks)} chunks.")
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
