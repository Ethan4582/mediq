from pydantic import BaseModel, Field
from core.supabase import db
from agent.state import AgentState
from agent.nodes.tracer import emit_trace
from agent.utils import get_llm_client, get_llm_model

class PlannerResult(BaseModel):
    sections_present: list[str]

def run(state: AgentState) -> AgentState:
    print("\n--- PLANNER NODE START ---")
    if state["iteration"] >= state["max_iterations"]:
        state["status"] = "done"
        return state
    
    state["iteration"] += 1
    
    res = db.table("chunks").select("text").eq("session_id", state["session_id"]).limit(5).execute()
    sample_texts = [row["text"] for row in res.data]
    context = "\n---\n".join(sample_texts)
    
    client = get_llm_client(state["llm_provider"], state["llm_key"])
    model = get_llm_model(state["llm_provider"])
    
    try:
        kwargs = {
            "model": model,
            "response_model": PlannerResult,
            "max_retries": 3,
            "messages": [
                {"role": "system", "content": "You are a clinical planner. Given these document excerpts, list which clinical sections are present from this exact list: diagnoses, medications_admission, medications_discharge, vitals, labs, course, procedures, follow_up, allergies. If you are unsure, include it to be safe."},
                {"role": "user", "content": f"Context:\n{context}\n\nList the sections."}
            ]
        }
        response = client.chat.completions.create(**kwargs)
        sections = response.sections_present
        # Ensure medications_admission and medications_discharge are always present to trigger reconciliation
        if "medications_admission" not in sections: sections.append("medications_admission")
        if "medications_discharge" not in sections: sections.append("medications_discharge")
    except Exception as e:
        print(f"Planner LLM failed: {e}")
        sections = ["diagnoses", "medications_admission", "medications_discharge", "vitals", "labs", "course", "follow_up"]
        
    state["sections_to_extract"] = sections
    print(f"Planned sections: {sections}")
    
    trace = emit_trace(
        state=state,
        node="planner",
        reasoning="Sampled chunks to determine available sections",
        action="set_extraction_plan",
        inputs={"sampled_chunks": len(sample_texts)},
        result={"sections": sections},
        next_node="retriever"
    )
    state["trace"].append(trace)
    return state
