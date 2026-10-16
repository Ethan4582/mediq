import pytest
from unittest.mock import patch, MagicMock
from tasks.ocr import process_document
from agent.nodes.extractor import run as run_extractor
from agent.state import AgentState

OCR_KEY_VALUE = "mistral-ocr-key-SECRET-111"
LLM_KEY_VALUE = "openai-llm-key-SECRET-999"


def test_ocr_and_llm_key_separation():
    # 1. Test OCR layer process_document strictly uses OCR key
    with patch("tasks.ocr.download_file") as mock_download, \
         patch("tasks.ocr.fitz.open") as mock_fitz, \
         patch("tasks.ocr._ocr_pdf_batch") as mock_pdf_ocr, \
         patch("tasks.ocr.db") as mock_db, \
         patch("tasks.ocr.set_doc_progress"):

        mock_doc_table = MagicMock()
        mock_doc_table.select.return_value.eq.return_value.single.return_value.execute.return_value.data = {
            "id": "doc-123",
            "file_name": "test.pdf",
            "r2_key": "r2-key",
            "page_count": 1,
        }
        mock_db.table.return_value = mock_doc_table

        mock_pdf = MagicMock()
        mock_pdf.page_count = 1
        mock_batch = MagicMock()
        mock_batch.tobytes.return_value = b"pdf-bytes"
        mock_fitz.return_value = mock_pdf
        mock_fitz.open.return_value = mock_batch

        mock_pdf_ocr.return_value = "Extracted medical record text."

        process_document("doc-123", "sess-123", OCR_KEY_VALUE)

        # Assert OCR called with OCR_KEY_VALUE and never LLM_KEY_VALUE
        assert mock_pdf_ocr.called
        call_args = mock_pdf_ocr.call_args[0]
        assert call_args[1] == OCR_KEY_VALUE
        assert call_args[1] != LLM_KEY_VALUE

    # 2. Test LLM extraction layer strictly uses LLM key
    with patch("agent.nodes.extractor.get_llm_client") as mock_get_client:
        mock_client = MagicMock()
        mock_client.chat.completions.create.return_value = MagicMock(
            model_dump=lambda: {"principal_diagnosis": "Sample"}
        )
        mock_get_client.return_value = mock_client

        state: AgentState = {
            "session_id": "sess-123",
            "document_id": "doc-123",
            "user_id": "usr-123",
            "mistral_key": OCR_KEY_VALUE,
            "llm_key": LLM_KEY_VALUE,
            "llm_provider": "openai",
            "sections_to_extract": ["diagnoses"],
            "current_section": "diagnoses",
            "iteration": 1,
            "max_iterations": 5,
            "extracted_fields": {},
            "source_citations": {},
            "medications_admission": [],
            "medications_discharge": [],
            "medication_flags": [],
            "conflicts": [],
            "missing_fields": [],
            "critical_flags": [],
            "drug_interactions": [],
            "escalation_triggered": False,
            "pending_labs": [],
            "draft": None,
            "trace": [],
            "status": "running",
            "error": None,
            "_current_chunks": ["Sample chunk"],
        }

        run_extractor(state)

        # Assert get_llm_client was called with LLM_KEY_VALUE, NOT OCR_KEY_VALUE
        assert mock_get_client.called
        assert mock_get_client.call_args[0][1] == LLM_KEY_VALUE
        assert mock_get_client.call_args[0][1] != OCR_KEY_VALUE
