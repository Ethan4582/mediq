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
    "active_llm_provider": "anthropic",  # Provider B
}


def test_session_provider_lock_in_chat():
    app.dependency_overrides[get_current_user] = lambda: TEST_USER

    session_id = "test-session-lock-1"
    provider_a = "openai"
    provider_b = "anthropic"

    # Mock DB queries
    with patch("routers.chat.db") as mock_db, \
         patch("routers.chat.retrieve_context") as mock_rag, \
         patch("routers.chat.normalize_stream") as mock_stream:

        # 1. runs table returns provider_used = provider_a
        def db_table_side_effect(table_name):
            mock_table = MagicMock()
            if table_name == "sessions":
                mock_table.select.return_value.eq.return_value.eq.return_value.maybe_single.return_value.execute.return_value.data = {
                    "id": session_id,
                    "status": "done",
                }
            elif table_name == "runs":
                # returns provider_a
                mock_table.select.return_value.eq.return_value.order.return_value.limit.return_value.execute.return_value.data = [
                    {"provider_used": provider_a}
                ]
            elif table_name == "profiles":
                # user profile has switched to provider_b!
                mock_table.select.return_value.eq.return_value.maybe_single.return_value.execute.return_value.data = {
                    "active_llm_provider": provider_b
                }
            elif table_name == "api_keys":
                from core.encryption import encrypt
                mock_table.select.return_value.eq.return_value.execute.return_value.data = [
                    {"key_type": "ocr", "provider": "mistral", "is_active": True, "key_encrypted": encrypt("mock-ocr-key")},
                    {"key_type": "llm", "provider": provider_a, "is_active": True, "key_encrypted": encrypt("mock-a-key")},
                    {"key_type": "llm", "provider": provider_b, "is_active": True, "key_encrypted": encrypt("mock-b-key")},
                ]
            return mock_table

        mock_db.table.side_effect = db_table_side_effect
        mock_rag.return_value = {"chunks": [], "context_text": "Sample clinical notes."}
        mock_stream.return_value = iter(["Patient is stable."])

        response = client.post("/api/chat", json={
            "session_id": session_id,
            "message": "What is the diagnosis?",
        })

        assert response.status_code == 200

        # Assert normalize_stream was called with provider_a, NOT provider_b!
        assert mock_stream.called
        call_provider = mock_stream.call_args[0][0]
        assert call_provider == provider_a
        assert call_provider != provider_b

    app.dependency_overrides.clear()
