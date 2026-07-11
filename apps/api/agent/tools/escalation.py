def escalate(reason: str, field: str, value: str) -> dict:
    # Mock — in production would call webhook/notification service
    return {
        "escalated": True,
        "reason": reason,
        "field": field,
        "value": value,
        "message": f"ESCALATED FOR CLINICIAN REVIEW: {reason}",
        "mock": True
    }
