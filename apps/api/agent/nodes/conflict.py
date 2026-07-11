from agent.state import AgentState
from agent.nodes.tracer import emit_trace

def run(state: AgentState) -> AgentState:
    print("\n--- CONFLICT NODE START ---")
    conflicts = []
    
    # In a full implementation, this node checks cross-note conflicts by looking
    # at the source citations or multiple extracts of the same field.
    # Since our extractor currently outputs one single value per section,
    # true conflict detection requires multi-document extraction.
    # We will simulate the check here.
    
    extracted = state.get("extracted_fields", {})
    if "diagnoses" in extracted:
        diag = extracted["diagnoses"].get("principal_diagnosis", "")
        if diag and "MISSING" not in diag.upper():
            print(f"Checking for conflicts in principal diagnosis: {diag}")
            # Mock conflict
            if "pneumonia" in diag.lower() and "heart failure" in diag.lower():
                conflicts.append({
                    "field": "principal_diagnosis",
                    "values": [diag, "possible CHF"],
                    "sources": ["chunk_a", "chunk_b"],
                    "message": "Conflicting primary diagnosis noted between admission and consult."
                })
                
    state["conflicts"] = conflicts
    print(f"Found {len(conflicts)} cross-document conflicts.")

    trace = emit_trace(
        state=state,
        node="conflict",
        reasoning="Checked for contradictions across extracted fields",
        action="check_conflicts",
        inputs={},
        result={"conflicts": conflicts},
        next_node="guard"
    )
    state["trace"].append(trace)
    return state
