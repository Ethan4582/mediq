import pytest
import instructor
from unittest.mock import patch, MagicMock
from agent.utils import get_llm_client, get_llm_model, PROVIDER_MODEL_DEFAULTS

CONFIRMED_PROVIDERS = [
    "openai",
    "anthropic",
    "gemini",
    "groq",
    "mistral",
    "xai",
    "deepseek",
]


@pytest.mark.parametrize("provider", CONFIRMED_PROVIDERS)
def test_provider_client_and_model_init(provider):
    model = get_llm_model(provider)
    assert model is not None
    assert len(model) > 0
    assert model == PROVIDER_MODEL_DEFAULTS[provider]

    client = get_llm_client(provider, "test-mock-key")
    assert client is not None


def test_gemini_path_uses_from_gemini():
    with patch("instructor.from_gemini") as mock_from_gemini, \
         patch("google.generativeai.configure") as mock_genai_cfg, \
         patch("google.generativeai.GenerativeModel") as mock_gen_model:
        mock_from_gemini.return_value = MagicMock()

        client = get_llm_client("gemini", "test-gemini-key")
        assert mock_from_gemini.called
        assert client == mock_from_gemini.return_value


def test_anthropic_path_uses_from_anthropic():
    with patch("instructor.from_anthropic") as mock_from_anthropic, \
         patch("anthropic.Anthropic") as mock_anthropic_cls:
        mock_from_anthropic.return_value = MagicMock()

        client = get_llm_client("anthropic", "test-anthropic-key")
        assert mock_from_anthropic.called
        assert client == mock_from_anthropic.return_value
