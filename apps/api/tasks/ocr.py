import math
import base64
import traceback
from datetime import datetime, timezone
import httpx
import fitz

from core.supabase import db
from core.r2 import download_file
from core.progress import set_doc_progress


def _ocr_pdf_batch(pages_bytes: bytes, mistral_key: str) -> str:
    b64 = base64.b64encode(pages_bytes).decode()
    for attempt in range(3):
        try:
            resp = httpx.post(
                "https://api.mistral.ai/v1/ocr",
                headers={"Authorization": f"Bearer {mistral_key}", "Content-Type": "application/json"},
                json={
                    "model": "mistral-ocr-latest",
                    "document": {"type": "document_url", "document_url": f"data:application/pdf;base64,{b64}"},
                },
                timeout=60,
            )
            resp.raise_for_status()
            data = resp.json()
            return "\n\n".join(p.get("markdown", "") for p in data.get("pages", []))
        except Exception as e:
            if attempt == 2:
                print(f"[OCR] Mistral PDF batch attempt {attempt + 1} failed: {e}", flush=True)
                raise
            import time
            time.sleep((attempt + 1) * 2)
    return ""


def _ocr_image(img_bytes: bytes, content_type: str, mistral_key: str) -> str:
    b64 = base64.b64encode(img_bytes).decode()
    data_url = f"data:{content_type};base64,{b64}"
    for attempt in range(3):
        try:
            resp = httpx.post(
                "https://api.mistral.ai/v1/ocr",
                headers={"Authorization": f"Bearer {mistral_key}", "Content-Type": "application/json"},
                json={
                    "model": "mistral-ocr-latest",
                    "document": {"type": "image_url", "image_url": data_url},
                },
                timeout=60,
            )
            resp.raise_for_status()
            data = resp.json()
            return "\n\n".join(p.get("markdown", "") for p in data.get("pages", []))
        except Exception as e:
            if attempt == 2:
                print(f"[OCR] Mistral image attempt {attempt + 1} failed: {e}", flush=True)
                raise
            import time
            time.sleep((attempt + 1) * 2)
    return ""


def _chunk_text(text: str) -> list[str]:
    raw_chunks = [c.strip() for c in text.split("\n\n") if len(c.strip()) > 20]
    merged = []
    buffer = ""
    for chunk in raw_chunks:
        buffer += "\n\n" + chunk if buffer else chunk
        if len(buffer) >= 200:
            merged.append(buffer)
            buffer = ""
    if buffer:
        merged.append(buffer)
    return merged


def process_document(document_id: str, session_id: str, mistral_ocr_key: str):
    print("=== LAYER 1: MISTRAL OCR TASK START ===", flush=True)
    print(f"document_id: {document_id}", flush=True)
    print(f"session_id: {session_id}", flush=True)

    if not mistral_ocr_key:
        err_msg = "Mistral OCR key is missing. OCR layer strictly requires key_type='ocr'."
        print(f"[OCR ERROR] {err_msg}", flush=True)
        set_doc_progress(document_id, "error", 0, "error", error=err_msg)
        db.table("documents").update({"ocr_status": "failed"}).eq("id", document_id).execute()
        db.table("sessions").update({"status": "error"}).eq("id", session_id).execute()
        raise ValueError(err_msg)

    try:
        doc_row = db.table("documents").select("*").eq("id", document_id).single().execute()
        doc = doc_row.data
        file_name: str = doc["file_name"] or ""

        file_bytes = download_file(doc["r2_key"])
        set_doc_progress(document_id, "processing", 10, "ocr")
        db.table("documents").update({"ocr_status": "processing"}).eq("id", document_id).execute()

        is_pdf = file_name.lower().endswith(".pdf")
        extracted_text = ""

        if is_pdf:
            pdf = fitz.open(stream=file_bytes, filetype="pdf")
            total_pages = pdf.page_count
            total_batches = math.ceil(total_pages / 20)
            print(f"[OCR] Processing PDF with Mistral OCR: {total_pages} pages in {total_batches} batches...", flush=True)

            for i in range(total_batches):
                start = i * 20
                end = min(start + 20, total_pages)
                batch_pdf = fitz.open()
                batch_pdf.insert_pdf(pdf, from_page=start, to_page=end - 1)
                batch_bytes = batch_pdf.tobytes()
                batch_pdf.close()

                batch_text = _ocr_pdf_batch(batch_bytes, mistral_ocr_key)
                extracted_text += ("\n\n" + batch_text if extracted_text else batch_text)
                progress = min(60, int((i + 1) / total_batches * 50) + 10)
                set_doc_progress(document_id, "processing", progress, "ocr")

            pdf.close()
        else:
            print(f"[OCR] Processing image with Mistral OCR...", flush=True)
            content_type = "image/jpeg" if file_name.lower().endswith((".jpg", ".jpeg")) else "image/png"
            extracted_text = _ocr_image(file_bytes, content_type, mistral_ocr_key)
            set_doc_progress(document_id, "processing", 60, "ocr")

        # Clean extracted text
        import re
        extracted_text = re.sub(r'^#{1,6}\s*', '', extracted_text, flags=re.MULTILINE)
        extracted_text = '\n'.join([line.rstrip() for line in extracted_text.split('\n')])
        extracted_text = re.sub(r'\n{3,}', '\n\n', extracted_text).strip()

        db.table("documents").update({"raw_text": extracted_text, "ocr_status": "processing"}).eq("id", document_id).execute()
        set_doc_progress(document_id, "processing", 70, "chunking")

        chunks = _chunk_text(extracted_text)
        chunk_rows = [
            {
                "document_id": document_id,
                "session_id": session_id,
                "text": c,
                "page_num": max(1, (i // 5) + 1),
                "chunk_index": i,
                "metadata": {"doc_type": "unknown", "source_file": file_name},
            }
            for i, c in enumerate(chunks)
        ]

        if chunk_rows:
            db.table("chunks").insert(chunk_rows).execute()
            set_doc_progress(document_id, "processing", 85, "indexing")

            try:
                from core.embeddings import generate_embeddings
                chunk_texts = [c["text"] for c in chunk_rows]
                embeddings = generate_embeddings(chunk_texts, mistral_ocr_key)
                inserted = db.table("chunks").select("id").eq("document_id", document_id).order("chunk_index").execute()
                chunk_ids = [row["id"] for row in inserted.data]
                for chunk_id, embedding in zip(chunk_ids, embeddings):
                    db.table("chunks").update({"embedding": embedding}).eq("id", chunk_id).execute()
            except Exception as emb_err:
                print(f"[OCR] Embedding generation notice: {emb_err}", flush=True)

        set_doc_progress(document_id, "done", 100, "ready")
        db.table("sessions").update({"status": "done", "updated_at": datetime.now(timezone.utc).isoformat()}).eq("id", session_id).execute()
        db.table("documents").update({"ocr_status": "done"}).eq("id", document_id).execute()
        print("=== LAYER 1: MISTRAL OCR FINISHED SUCCESSFULLY ===", flush=True)

    except Exception as e:
        print(f"[OCR ERROR] Exception in process_document: {e}", flush=True)
        set_doc_progress(document_id, "error", 0, "error", error=str(e))
        db.table("documents").update({"ocr_status": "failed"}).eq("id", document_id).execute()
        db.table("sessions").update({"status": "error"}).eq("id", session_id).execute()
        traceback.print_exc()
        raise
