import math
import base64
import traceback
from datetime import datetime, timezone
import httpx
import fitz

from core.supabase import db
from core.r2 import download_file
from core.progress import set_doc_progress


def _extract_page_with_model(img_bytes: bytes, content_type: str, provider: str, api_key: str) -> str:
    prov = (provider or "").lower()
    b64 = base64.b64encode(img_bytes).decode()

    for attempt in range(3):
        try:
            if prov == "gemini":
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"
                payload = {
                    "contents": [{
                        "parts": [
                            {"text": "Extract all medical records, vitals, lab results, medications, diagnoses, and tables verbatim into clean Markdown. Do not summarize or omit anything."},
                            {"inline_data": {"mime_type": content_type, "data": b64}}
                        ]
                    }]
                }
                resp = httpx.post(url, json=payload, timeout=60)
                resp.raise_for_status()
                data = resp.json()
                return data["candidates"][0]["content"]["parts"][0]["text"]

            elif prov == "openai":
                data_url = f"data:{content_type};base64,{b64}"
                resp = httpx.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={"Authorization": f"Bearer {api_key}"},
                    json={
                        "model": "gpt-4o-mini",
                        "messages": [{
                            "role": "user",
                            "content": [
                                {"type": "text", "text": "Extract all medical records, vitals, lab results, medications, diagnoses, and tables verbatim into clean Markdown. Do not summarize."},
                                {"type": "image_url", "image_url": {"url": data_url}}
                            ]
                        }],
                        "max_tokens": 4096,
                    },
                    timeout=60,
                )
                resp.raise_for_status()
                return resp.json()["choices"][0]["message"]["content"]

            elif prov == "anthropic":
                resp = httpx.post(
                    "https://api.anthropic.com/v1/messages",
                    headers={"x-api-key": api_key, "anthropic-version": "2023-06-01", "content-type": "application/json"},
                    json={
                        "model": "claude-3-5-sonnet-20241022",
                        "max_tokens": 4096,
                        "messages": [{
                            "role": "user",
                            "content": [
                                {"type": "image", "source": {"type": "base64", "media_type": content_type, "data": b64}},
                                {"type": "text", "text": "Extract all medical records, vitals, lab results, medications, diagnoses, and tables verbatim into clean Markdown. Do not summarize."}
                            ]
                        }]
                    },
                    timeout=60,
                )
                resp.raise_for_status()
                return resp.json()["content"][0]["text"]

            elif prov == "mistral":
                data_url = f"data:{content_type};base64,{b64}"
                resp = httpx.post(
                    "https://api.mistral.ai/v1/ocr",
                    headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                    json={"model": "mistral-ocr-latest", "document": {"type": "image_url", "image_url": data_url}},
                    timeout=60,
                )
                resp.raise_for_status()
                data = resp.json()
                return "\n\n".join(p.get("markdown", "") for p in data.get("pages", []))

            else:
                # Default to OpenAI vision
                data_url = f"data:{content_type};base64,{b64}"
                resp = httpx.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={"Authorization": f"Bearer {api_key}"},
                    json={
                        "model": "gpt-4o-mini",
                        "messages": [{
                            "role": "user",
                            "content": [
                                {"type": "text", "text": "Extract all clinical text verbatim in clean Markdown."},
                                {"type": "image_url", "image_url": {"url": data_url}}
                            ]
                        }],
                        "max_tokens": 4096,
                    },
                    timeout=60,
                )
                resp.raise_for_status()
                return resp.json()["choices"][0]["message"]["content"]

        except Exception as err:
            print(f"[OCR] Vision extraction attempt {attempt + 1} failed: {err}", flush=True)
            if attempt == 2:
                return ""
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


def process_document(document_id: str, session_id: str, provider: str = "openai", api_key: str = ""):
    print(f"=== UNIFIED OCR TASK START ===", flush=True)
    print(f"document_id: {document_id}", flush=True)
    print(f"session_id: {session_id}", flush=True)
    print(f"chosen_provider: {provider}", flush=True)
    print(f"api_key present: {bool(api_key)} (last4: {api_key[-4:] if api_key else 'NONE'})", flush=True)

    try:
        print("Fetching doc from DB...", flush=True)
        doc_row = db.table("documents").select("*").eq("id", document_id).single().execute()
        doc = doc_row.data
        file_name: str = doc["file_name"] or ""
        print(f"Doc fetched: {file_name}", flush=True)

        print("Downloading from R2...", flush=True)
        file_bytes = download_file(doc["r2_key"])
        print(f"Downloaded file bytes length: {len(file_bytes)}", flush=True)

        set_doc_progress(document_id, "processing", 10, "ocr")
        db.table("documents").update({"ocr_status": "processing"}).eq("id", document_id).execute()

        is_pdf = file_name.lower().endswith(".pdf")
        extracted_text = ""

        if is_pdf:
            print(f"[OCR] Processing PDF with unified model {provider}...", flush=True)
            pdf = fitz.open(stream=file_bytes, filetype="pdf")
            total_pages = pdf.page_count
            print(f"[OCR] Total pages: {total_pages}", flush=True)

            page_texts = []
            for idx in range(total_pages):
                page = pdf[idx]
                raw_page_text = page.get_text()

                # If page has clear digital text stream (> 80 characters), use direct extraction
                if len(raw_page_text.strip()) > 80:
                    page_texts.append(raw_page_text.strip())
                else:
                    # Scanned or image-heavy page: render to pixmap and use chosen provider's vision API
                    print(f"[OCR] Page {idx + 1} has sparse text. Calling {provider} vision API...", flush=True)
                    pix = page.get_pixmap(dpi=150)
                    img_bytes = pix.tobytes("png")
                    v_text = _extract_page_with_model(img_bytes, "image/png", provider, api_key)
                    page_texts.append(v_text or raw_page_text.strip())

                progress = min(60, int((idx + 1) / total_pages * 50) + 10)
                set_doc_progress(document_id, "processing", progress, "ocr")

            extracted_text = "\n\n".join(p for p in page_texts if p)
            pdf.close()
        else:
            print(f"[OCR] Processing image with unified model {provider}...", flush=True)
            content_type = "image/jpeg" if file_name.lower().endswith((".jpg", ".jpeg")) else "image/png"
            extracted_text = _extract_page_with_model(file_bytes, content_type, provider, api_key)
            set_doc_progress(document_id, "processing", 60, "ocr")

        # Clean extracted text
        import re
        extracted_text = re.sub(r'^#{1,6}\s*', '', extracted_text, flags=re.MULTILINE)
        extracted_text = '\n'.join([line.rstrip() for line in extracted_text.split('\n')])
        extracted_text = re.sub(r'\n{3,}', '\n\n', extracted_text).strip()

        print(f"[OCR] Extracted text length: {len(extracted_text)} chars. Storing in DB...", flush=True)
        db.table("documents").update({"raw_text": extracted_text, "ocr_status": "processing"}).eq("id", document_id).execute()
        set_doc_progress(document_id, "processing", 70, "chunking")

        # Chunk text
        chunks = _chunk_text(extracted_text)
        print(f"[OCR] Generated {len(chunks)} chunks.", flush=True)

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

            # Vector embeddings if Mistral key is available
            if provider == "mistral" and api_key:
                try:
                    from core.embeddings import generate_embeddings
                    chunk_texts = [c["text"] for c in chunk_rows]
                    embeddings = generate_embeddings(chunk_texts, api_key)
                    inserted = db.table("chunks").select("id").eq("document_id", document_id).order("chunk_index").execute()
                    chunk_ids = [row["id"] for row in inserted.data]
                    for chunk_id, embedding in zip(chunk_ids, embeddings):
                        db.table("chunks").update({"embedding": embedding}).eq("id", chunk_id).execute()
                except Exception as emb_err:
                    print(f"[OCR] Embedding notice: {emb_err}", flush=True)

        print("=== UNIFIED OCR FINISHED SUCCESSFULLY ===", flush=True)
        set_doc_progress(document_id, "done", 100, "ready")
        db.table("sessions").update({"status": "done", "updated_at": datetime.now(timezone.utc).isoformat()}).eq("id", session_id).execute()
        db.table("documents").update({"ocr_status": "done"}).eq("id", document_id).execute()

    except Exception as e:
        print(f"[OCR ERROR] Exception caught in process_document: {e}", flush=True)
        set_doc_progress(document_id, "error", 0, "error", error=str(e))
        db.table("documents").update({"ocr_status": "failed"}).eq("id", document_id).execute()
        db.table("sessions").update({"status": "error"}).eq("id", session_id).execute()
        traceback.print_exc()
        raise
