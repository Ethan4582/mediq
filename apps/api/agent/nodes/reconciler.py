from agent.state import AgentState
from agent.nodes.tracer import emit_trace

def run(state: AgentState) -> AgentState:
    print("\n--- RECONCILER NODE START ---")
    
    admin_meds = state.get("medications_admission", [])
    disch_meds = state.get("medications_discharge", [])
    
    flags = []
    
    if not admin_meds or not disch_meds:
        print("Missing admission or discharge meds, cannot fully reconcile.")
        flags.append({
            "type": "INCOMPLETE",
            "message": "Medication reconciliation incomplete — admission or discharge medications not found."
        })
    else:
        # Simple diffing logic
        admin_dict = {str(m.get("name", "")).lower(): m for m in admin_meds if isinstance(m, dict)}
        disch_dict = {str(m.get("name", "")).lower(): m for m in disch_meds if isinstance(m, dict)}
        
        for name, disch_m in disch_dict.items():
            if name not in admin_dict:
                flags.append({
                    "type": "ADDED",
                    "drug": name,
                    "message": f"Medication ADDED at discharge: {disch_m.get('name')} (no reason documented in basic extraction)"
                })
            else:
                admin_m = admin_dict[name]
                if admin_m.get("dose") != disch_m.get("dose"):
                    flags.append({
                        "type": "DOSE_CHANGED",
                        "drug": name,
                        "message": f"Dose changed for {name}: {admin_m.get('dose')} -> {disch_m.get('dose')}"
                    })
                    
        for name, admin_m in admin_dict.items():
            if name not in disch_dict:
                flags.append({
                    "type": "STOPPED",
                    "drug": name,
                    "message": f"Medication STOPPED at discharge: {admin_m.get('name')}"
                })

    state["medication_flags"] = flags
    print(f"Found {len(flags)} medication reconciliation flags.")

    trace = emit_trace(
        state=state,
        node="reconciler",
        reasoning="Compared admission vs discharge medications for discrepancies",
        action="diff_medications",
        inputs={"admission_count": len(admin_meds), "discharge_count": len(disch_meds)},
        result={"flags": flags},
        next_node="conflict"
    )
    state["trace"].append(trace)
    return state
