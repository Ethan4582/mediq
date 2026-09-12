# MediQ - Medical Document Intelligence

![MediQ Banner](/docs/image.png)


MediQ is an agentic AI system that reads raw patient documents handwritten notes, scanned PDFs, drug charts, lab reports and produces structured discharge summary drafts for clinician review.

## Why not just ChatGPT with a PDF?

| ChatGPT + PDF | MediQ |
|---|---|
| Single LLM call over raw text | Multi-step agent that plans, retrieves, and re-plans |
| Fills missing fields with plausible values | Marks every unverifiable field as `MISSING — clinician review required` |
| No source traceability | Every field cites the exact document and chunk it came from |
| No conflict detection | Flags contradictions between documents, never silently resolves them |
| No medication reconciliation | Diffs admission vs discharge meds, surfaces unexplained changes |
| Black box reasoning | Full per-step agent reasoning trace emitted and viewable |

MediQ is not a chatbot. It is a clinical drafting agent with hard safety guardrails.



## Agentic Features

**Real agent loop**  LangGraph orchestrates a stateful graph that plans which clinical sections to extract, retrieves relevant chunks via RAG, re-plans based on what tools return, and enforces a hard iteration cap of 5.

**No hallucination guardrail** - if no source document supports a field, the output is `MISSING — clinician review required`. The system never fills a gap with a plausible clinical value.

**Medication reconciliation** - compares admission medications against discharge medications and flags every addition, removal, or dose change that has no documented reason.

**Conflict detection** - cross-references extracted fields across all uploaded documents. If two notes disagree on a diagnosis or medication, both values are surfaced and flagged - never arbitrarily resolved.

**Mock clinical tools** — the agent decides when to call a drug interaction checker, a critical value escalation trigger, and a pending lab checker. All are clearly documented as mocks with real-API swap points.

**Full observability** — every agent step emits a structured trace: reasoning → action chosen → inputs → result → next decision. Viewable in the UI.



## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, Tailwind CSS, shadcn/ui |
| Auth | Supabase Auth (Google + email) |
| API | FastAPI, Python 3.12 |
| Agent | LangGraph |
| OCR | Mistral OCR API (BYOK) |
| LLM | Groq / OpenAI / Anthropic / Mistral (BYOK) |
| Structured output | Instructor + Pydantic |
| Vector store | pgvector via Supabase |
| Embeddings | Mistral Embed |
| File storage | Cloudflare R2 |
| Async jobs | Celery + Upstash Redis |
| Database | Supabase Postgres |



## Prerequisites

- Node.js 18+ and pnpm
- Python 3.12+
- Supabase account (free tier)
- Cloudflare R2 bucket
- Upstash Redis database
- Mistral API key (required — used for OCR and embeddings)
- At least one LLM provider key: Groq, OpenAI, Anthropic, or Mistral


## Setup

### 1. Clone and install

```bash
git clone https://github.com/yourhandle/mediq.git
cd mediq
pnpm install
```

### 2. Frontend environment

Create `apps/web/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Backend environment

Create `apps/api/.env`:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
CLOUDFLARE_R2_ENDPOINT=https://your_account_id.r2.cloudflarestorage.com
CLOUDFLARE_R2_ACCESS_KEY=your_r2_access_key
CLOUDFLARE_R2_SECRET_KEY=your_r2_secret_key
CLOUDFLARE_R2_BUCKET=mediq-documents
UPSTASH_REDIS_URL=rediss://:token@host:6379
ENCRYPTION_KEY=your_fernet_key
```

Generate encryption key:
```bash
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

### 4. Database setup

Run the schema in your Supabase SQL editor:
```bash
# Schema file located at:
apps/api/schema.sql
```

Enable pgvector extension in Supabase dashboard → Database → Extensions → vector.

### 5. Run locally

```bash
# Terminal 1 — Frontend
cd apps/web && pnpm dev

# Terminal 2 — API
cd apps/api
python -m venv .venv && source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Terminal 3 — Celery worker
cd apps/api
source .venv/bin/activate
celery -A tasks.ocr worker --loglevel=info
```

Or with Docker:
```bash
docker-compose up
```

### 6. Add your API keys

1. Open `http://localhost:3000`
2. Sign up and go to **API Keys**
3. Add your Mistral key as OCR key (required)
4. Add at least one LLM provider key (Groq recommended — generous free tier)


## Safety Guarantees

- **No fabrication** - every output field is grounded in a source document chunk
- **Explicit missing data** - unverifiable fields are marked `MISSING — clinician review required`
- **No silent conflict resolution** - contradictions between documents are flagged, not resolved
- **Always a draft** - output is never auto-finalized; clinician review is always required
- **Hard iteration cap** - agent cannot loop indefinitely; stops at 5 iterations



## Important

All patient data used during development is synthetic. Do not upload real patient data to any third-party service. MediQ is a research and demonstration project it is not approved for clinical use.



## License

MIT