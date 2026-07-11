from agent.state import AgentState
from agent.nodes.tracer import emit_trace

REQUIRED_FIELDS = [
    "diagnoses.principal_diagnosis",
    "vitals.bp",
    "vitals.pr", 
    "course.summary",
    "medications_discharge.medications",
]

def run(state: AgentState) -> AgentState:
    print("\n--- GUARD NODE START ---")
    missing = []
    extracted = state.get("extracted_fields", {})
    
    for field_path in REQUIRED_FIELDS:
        try:
            section, field = field_path.split(".")
            value = extracted.get(section, {}).get(field, None)
            if not value or (isinstance(value, str) and "MISSING" in value):
                missing.append(field_path)
        except Exception as e:
            missing.append(field_path)
    
    state["missing_fields"] = missing
    print(f"Missing required fields: {missing}")
    
    # Trigger escalation for critical values
    escalation_triggered = False
    vitals = extracted.get("vitals", {})
    labs = extracted.get("labs", {})
    
    # Simple mock check for escalation
    try:
        lab_results = labs.get("results", [])
        for lab in lab_results:
            if lab.get("test", "").lower() == "sodium" and "130" in str(lab.get("value", "")):
                from agent.tools.escalation import escalate
                print("Escalating: Sodium < 130")
                res = escalate("Critical Lab Value", "Sodium", str(lab.get("value")))
                escalation_triggered = True
    except Exception as e:
        print(f"Error checking labs for escalation: {e}")
        
    state["critical_flags"] = []
    if escalation_triggered:
        state["critical_flags"].append("ESCALATION_TRIGGERED")
    state["escalation_triggered"] = escalation_triggered

    trace = emit_trace(
        state=state,
        node="guard",
        reasoning="Checked required fields and critical escalation criteria",
        action="enforce_guardrails",
        inputs={},
        result={"missing": missing, "escalation": escalation_triggered},
        next_node="output"
    )
    state["trace"].append(trace)
    return state
