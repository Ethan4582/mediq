from typing import TypedDict, Any

class AgentState(TypedDict):
    session_id: str
    user_id: str
    mistral_key: str
    llm_key: str
    llm_provider: str
    
    # Planning
    sections_to_extract: list[str]
    current_section: str
    iteration: int
    max_iterations: int          # hard cap = 5
    
    # Extracted data per section
    extracted_fields: dict       # { section: { field: value | "MISSING" } }
    source_citations: dict       # { section: [chunk_ids] }
    
    # Reconciliation + conflicts
    medications_admission: list
    medications_discharge: list
    medication_flags: list
    conflicts: list
    missing_fields: list
    critical_flags: list
    
    # Tool results
    drug_interactions: list
    escalation_triggered: bool
    pending_labs: list
    
    # Output
    draft: dict | None
    trace: list[dict]            # one entry per step
    status: str                  # "running" | "done" | "error"
    error: str | None
