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
                json={"model": "mistral-ocr-latest", "document": {"type": "document_url", "document_url": f"data:application/pdf;base64,{b64}"}},
                timeout=60,
            )
            resp.raise_for_status()
            data = resp.json()
            return "\n\n".join(p.get("markdown", "") for p in data.get("pages", []))
        except Exception:
            if attempt == 2:
                raise
            import time; time.sleep(2)
    return ""


def _ocr_image(img_bytes: bytes, content_type: str, mistral_key: str) -> str:
    b64 = base64.b64encode(img_bytes).decode()
    data_url = f"data:{content_type};base64,{b64}"
    resp = httpx.post(
        "https://api.mistral.ai/v1/ocr",
        headers={"Authorization": f"Bearer {mistral_key}", "Content-Type": "application/json"},
        json={"model": "mistral-ocr-latest", "document": {"type": "image_url", "image_url": data_url}},
        timeout=60,
    )
    resp.raise_for_status()
    data = resp.json()
    return "\n\n".join(p.get("markdown", "") for p in data.get("pages", []))


def _chunk_text(text: str) -> list[str]:
    import re
    VITAL_PATTERN = r'((?:(?:BP|Temp|HR|RR|Sp[O0]2|Pulse|SpO2|MAP|GCS|Weight|Height|BMI)[:\s\-]+[\d\.\/]+[^\n]*\n?){2,})'
    vital_blocks = re.findall(VITAL_PATTERN, text, re.IGNORECASE)

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


def process_document(document_id: str, session_id: str, mistral_api_key: str):
    print(f"=== OCR TASK START ===")
    print(f"document_id: {document_id}")
    print(f"session_id: {session_id}")
    print(f"mistral_api_key present: {bool(mistral_api_key)}")
    print(f"mistral_api_key last4: {mistral_api_key[-4:] if mistral_api_key else 'NONE'}")

    try:
        if not mistral_api_key:
            print("Missing API key")
            set_doc_progress(document_id, "error", 0, "error", error="Mistral API key is missing")
            db.table("documents").update({"ocr_status": "failed"}).eq("id", document_id).execute()
            db.table("sessions").update({"status": "error"}).eq("id", session_id).execute()
            return

        print("Fetching doc from DB...")
        doc_row = db.table("documents").select("*").eq("id", document_id).single().execute()
        doc = doc_row.data
        print(f"Doc fetched: {doc['file_name']}")

        print("Downloading from R2...")
        file_bytes = download_file(doc["r2_key"])
        print("Downloaded file bytes length:", len(file_bytes))
        
        set_doc_progress(document_id, "processing", 5, "ocr")
        db.table("documents").update({"ocr_status": "processing"}).eq("id", document_id).execute()

        file_name: str = doc["file_name"] or ""
        is_pdf = file_name.lower().endswith(".pdf")
        extracted_text = ""

        if is_pdf:
            print("Processing PDF...")
            pdf = fitz.open(stream=file_bytes, filetype="pdf")
            page_count = pdf.page_count
            total_batches = math.ceil(page_count / 20)
            for i in range(total_batches):
                start = i * 20
                end = min(start + 20, page_count)
                batch_pdf = fitz.open()
                batch_pdf.insert_pdf(pdf, from_page=start, to_page=end - 1)
                batch_bytes = batch_pdf.tobytes()
                batch_pdf.close()
                print(f"Calling Mistral OCR for batch {i+1}/{total_batches}...")
                extracted_text += _ocr_pdf_batch(batch_bytes, mistral_api_key)
                progress = int((i + 1) / total_batches * 55) + 5
                set_doc_progress(document_id, "processing", progress, "ocr")
            pdf.close()
        else:
            print("Processing image...")
            content_type = "image/jpeg" if file_name.lower().endswith((".jpg", ".jpeg")) else "image/png"
            print(f"Calling Mistral OCR for image ({content_type})...")
            extracted_text = _ocr_image(file_bytes, content_type, mistral_api_key)
            print("Mistral OCR finished. Text length:", len(extracted_text))

        print("Cleaning text...")
        def clean_ocr_text(text: str) -> str:
            import re
            text = re.sub(r'^#{1,6}\s*', '', text, flags=re.MULTILINE)
            text = '\n'.join([line.rstrip() for line in text.split('\n')])
            text = re.sub(r'\n{3,}', '\n\n', text)
            return text.strip()

        extracted_text = clean_ocr_text(extracted_text)

        print("Updating raw text in DB...")
        db.table("documents").update({"raw_text": extracted_text, "ocr_status": "processing"}).eq("id", document_id).execute()
        set_doc_progress(document_id, "processing", 65, "chunking")

        print("Chunking text...")
        chunks = _chunk_text(extracted_text)
        print(f"Created {len(chunks)} chunks.")
        
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
            print("Inserting chunks into DB...")
            db.table("chunks").insert(chunk_rows).execute()
            set_doc_progress(document_id, "processing", 75, "embedding")

            print("Generating embeddings...")
            from core.embeddings import generate_embeddings
            chunk_texts = [c["text"] for c in chunk_rows]
            embeddings = generate_embeddings(chunk_texts, mistral_api_key)
            print("Embeddings generated.")

            inserted = db.table("chunks")\
                .select("id, chunk_index")\
                .eq("session_id", session_id)\
                .eq("document_id", document_id)\
                .order("chunk_index")\
                .execute()

            chunk_ids = [row["id"] for row in inserted.data]
            
            print("Updating chunks with embeddings...")
            for chunk_id, embedding in zip(chunk_ids, embeddings):
                db.table("chunks")\
                    .update({"embedding": embedding})\
                    .eq("id", chunk_id)\
                    .execute()

        print("Finalizing job...")
        set_doc_progress(document_id, "done", 100, "ready")
        db.table("sessions").update({"status": "done", "updated_at": datetime.now(timezone.utc).isoformat()}).eq("id", session_id).execute()
        db.table("documents").update({"ocr_status": "done"}).eq("id", document_id).execute()
        print("=== OCR TASK FINISHED ===")

    except Exception as e:
        print(f"Exception caught in process_document: {e}")
        try:
            set_doc_progress(document_id, "error", 0, "error", error=str(e))
            db.table("documents").update({"ocr_status": "failed"}).eq("id", document_id).execute()
            db.table("sessions").update({"status": "error"}).eq("id", session_id).execute()
        except Exception as e2:
            print(f"Secondary exception in error handler: {e2}")
        traceback.print_exc()
        raise
