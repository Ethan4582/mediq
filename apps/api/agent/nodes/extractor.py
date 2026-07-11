from pydantic import BaseModel, Field
from typing import Optional
from agent.state import AgentState
from agent.nodes.tracer import emit_trace
from agent.utils import get_instructor_client, get_llm_model

EXTRACTION_SYSTEM_PROMPT = """
You are a clinical data extraction assistant. 
Extract only what is explicitly stated in the provided document excerpts.
Never infer, assume, or complete missing information.
If a field cannot be found verbatim in the text, return exactly: "MISSING — clinician review required"
Do not fabricate values. Do not use medical knowledge to fill gaps.
"""

class DiagnosisSection(BaseModel):
    principal_diagnosis: str
    secondary_diagnoses: list[str]

class MedicationItem(BaseModel):
    name: str
    dose: str = "MISSING"
    route: str = "MISSING"
    frequency: str = "MISSING"

class MedicationSection(BaseModel):
    medications: list[MedicationItem]

class VitalsSection(BaseModel):
    bp: str = "MISSING — clinician review required"
    pr: str = "MISSING — clinician review required"
    rr: str = "MISSING — clinician review required"
    spo2: str = "MISSING — clinician review required"
    temperature: str = "MISSING — clinician review required"
    weight: str = "MISSING"

class LabItem(BaseModel):
    test: str
    value: str
    unit: str = "MISSING"
    reference_range: str = "MISSING"
    flag: str = "normal" # normal, abnormal, pending

class LabSection(BaseModel):
    results: list[LabItem]

class CourseSection(BaseModel):
    summary: str = "MISSING — clinician review required"
    procedures: list[str]
    condition_on_discharge: str = "MISSING"

class FollowUpSection(BaseModel):
    instructions: str = "MISSING"
    appointments: list[str]
    pending_results: list[str]

class AllergySection(BaseModel):
    allergies: list[str]

SECTION_MODELS = {
    "diagnoses": DiagnosisSection,
    "medications_admission": MedicationSection,
    "medications_discharge": MedicationSection,
    "vitals": VitalsSection,
    "labs": LabSection,
    "course": CourseSection,
    "procedures": CourseSection,
    "follow_up": FollowUpSection,
    "allergies": AllergySection,
}

def run(state: AgentState) -> AgentState:
    print("\n--- EXTRACTOR NODE START ---")
    section = state["current_section"]
    print(f"Extracting section: {section}")
    
    chunks = state.get("_current_chunks", [])
    context = "\n---\n".join(chunks) if chunks else "No relevant information found."
    
    client = get_instructor_client(state["llm_provider"], state["llm_key"])
    model = get_llm_model(state["llm_provider"])
    
    model_class = SECTION_MODELS.get(section, CourseSection)
    
    try:
        response = client.chat.completions.create(
            model=model,
            response_model=model_class,
            messages=[
                {"role": "system", "content": EXTRACTION_SYSTEM_PROMPT},
                {"role": "user", "content": f"Context:\n{context}\n\nExtract the {section} section."}
            ]
        )
        extracted = response.model_dump()
    except Exception as e:
        print(f"Extractor LLM failed for {section}: {e}")
        extracted = {"error": str(e), "status": "MISSING — clinician review required"}
        
    if "extracted_fields" not in state:
        state["extracted_fields"] = {}
    
    state["extracted_fields"][section] = extracted
    print(f"Extracted keys: {list(extracted.keys())}")
    
    # Store med list specially if it's meds
    if section == "medications_admission":
        state["medications_admission"] = extracted.get("medications", [])
    elif section == "medications_discharge":
        state["medications_discharge"] = extracted.get("medications", [])
        
    # Check if we should call the drug checker
    if section == "medications_discharge":
        meds = [m["name"] for m in extracted.get("medications", []) if isinstance(m, dict)]
        if len(meds) >= 2:
            from agent.tools.drug_checker import check_drug_interactions
            print(f"Calling drug_checker tool on {len(meds)} meds")
            res = check_drug_interactions(meds)
            state["drug_interactions"] = res["interactions"]
            
    # Check if we should call pending labs
    if section == "labs":
        from agent.tools.lab_pending import check_pending_labs
        res = check_pending_labs(extracted.get("results", []))
        state["pending_labs"] = res.get("pending_labs", [])
        if res.get("pending_labs"):
            print(f"Found pending labs: {len(res['pending_labs'])}")

    trace = emit_trace(
        state=state,
        node="extractor",
        reasoning=f"Extracted structured fields for {section} using Pydantic schema",
        action="llm_extract",
        inputs={"section": section, "context_length": len(context)},
        result=extracted,
        next_node="route_extractor"
    )
    state["trace"].append(trace)
    return state
