from langgraph.graph import StateGraph, END
from agent.state import AgentState
from agent.nodes import planner, retriever, extractor, reconciler, conflict, guard

def build_output(state: AgentState) -> AgentState:
    print("\n--- BUILDING FINAL OUTPUT ---")
    draft = state.get("extracted_fields", {})
    draft["medications_admission"] = state.get("medications_admission", [])
    draft["medications_discharge"] = state.get("medications_discharge", [])
    draft["flags"] = {
        "medication_discrepancies": state.get("medication_flags", []),
        "drug_interactions": state.get("drug_interactions", []),
        "pending_labs": state.get("pending_labs", []),
        "conflicts": state.get("conflicts", []),
        "missing_fields": state.get("missing_fields", []),
        "escalation_triggered": state.get("escalation_triggered", False),
        "critical_flags": state.get("critical_flags", [])
    }
    state["draft"] = draft
    state["status"] = "done"
    return state

def route_extractor(state: AgentState) -> str:
    if state.get("status") == "done" or state["iteration"] >= state["max_iterations"]:
        print("Routing to output (cap hit)")
        return "cap_hit"
        
    remaining = [s for s in state.get("sections_to_extract", []) 
                 if s not in state.get("extracted_fields", {})]
                 
    if remaining:
        print(f"Routing to next_section: {remaining[0]}")
        return "next_section"
        
    print("All sections extracted. Routing to reconcile.")
    return "reconcile"

def build_graph():
    graph = StateGraph(AgentState)
    
    graph.add_node("planner",     planner.run)
    graph.add_node("retriever",   retriever.run)
    graph.add_node("extractor",   extractor.run)
    graph.add_node("reconciler",  reconciler.run)
    graph.add_node("conflict",    conflict.run)
    graph.add_node("guard",       guard.run)
    graph.add_node("output",      build_output)
    
    graph.set_entry_point("planner")
    
    graph.add_edge("planner",    "retriever")
    graph.add_edge("retriever",  "extractor")
    
    # Loop: extractor → next section or move on
    graph.add_conditional_edges("extractor", route_extractor, {
        "next_section": "retriever",   # more sections to extract
        "reconcile":    "reconciler",  # all sections done
        "cap_hit":      "output",      # iteration cap reached
    })
    
    graph.add_edge("reconciler", "conflict")
    graph.add_edge("conflict",   "guard")
    graph.add_edge("guard",      "output")
    graph.add_edge("output",      END)
    
    return graph.compile()
