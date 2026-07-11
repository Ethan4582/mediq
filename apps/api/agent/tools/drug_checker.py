def check_drug_interactions(medications: list[str]) -> dict:
    # Mock — in production would call real drug DB API
    KNOWN_INTERACTIONS = {
        ("warfarin", "aspirin"): "HIGH RISK: Increased bleeding risk",
        ("metformin", "contrast"): "HOLD: Risk of lactic acidosis",
    }
    flags = []
    for i, drug_a in enumerate(medications):
        for drug_b in medications[i+1:]:
            key = tuple(sorted([drug_a.lower(), drug_b.lower()]))
            if key in KNOWN_INTERACTIONS:
                flags.append({"drugs": list(key), "interaction": KNOWN_INTERACTIONS[key]})
    return {"interactions": flags, "checked": True, "mock": True}
