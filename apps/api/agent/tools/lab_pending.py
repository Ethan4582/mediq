def check_pending_labs(lab_results: list[dict]) -> dict:
    pending = [l for l in lab_results if l.get("flag") == "pending" 
               or "awaited" in str(l.get("value","")).lower()
               or "pending" in str(l.get("value","")).lower()]
    return {"pending_labs": pending, "count": len(pending)}
