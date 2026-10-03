import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from main import app
from core.auth import get_current_user

client = TestClient(app)

TEST_USER = {
    "user_id": "test-user-id",
    "has_mistral_key": True,
    "has_llm_key": True,
    "active_llm_provider": "openai",
}


def test_summary_preview_duplicate_guard():
    app.dependency_overrides[get_current_user] = lambda: TEST_USER
    session_id = "test-session-guard-1"

    mock_draft_data = {
        "id": "draft-1",
        "session_id": session_id,
        "content": {
            "diagnoses": {"principal_diagnosis": "Pneumonia"},
        }
    }

    with patch("routers.agent.db") as mock_db, \
         patch("routers.agent.normalize_stream") as mock_stream:

        mock_stream.return_value = iter(["Patient diagnosed with pneumonia.", " Discharge summary ready."])

        def db_side_effect(table_name):
            mock_table = MagicMock()
            if table_name == "drafts":
                mock_table.select.return_value.eq.return_value.order.return_value.limit.return_value.execute.return_value.data = [
                    mock_draft_data
                ]
                def update_side_effect(val):
                    mock_draft_data["content"] = val.get("content", mock_draft_data["content"])
                    return MagicMock()
                mock_table.update.side_effect = update_side_effect
            elif table_name == "runs":
                mock_table.select.return_value.eq.return_value.order.return_value.limit.return_value.execute.return_value.data = [
                    {"provider_used": "openai"}
                ]
            elif table_name == "api_keys":
                from core.encryption import encrypt
                mock_table.select.return_value.eq.return_value.execute.return_value.data = [
                    {"key_type": "llm", "provider": "openai", "is_active": True, "key_encrypted": encrypt("mock-key")}
                ]
            return mock_table

        mock_db.table.side_effect = db_side_effect

        # Call 1: First invocation generates and streams preview via LLM
        res1 = client.get(f"/api/patient/{session_id}/summary-preview")
        assert res1.status_code == 200
        assert mock_stream.call_count == 1
        assert "pneumonia" in res1.text.lower()

        # Call 2: Second invocation should hit duplicate guard and return cached content WITHOUT calling LLM
        res2 = client.get(f"/api/patient/{session_id}/summary-preview")
        assert res2.status_code == 200
        assert mock_stream.call_count == 1  # Still 1, NOT 2!
        assert "cached" in res2.text
        assert "pneumonia" in res2.text.lower()

    app.dependency_overrides.clear()
