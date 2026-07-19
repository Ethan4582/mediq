# MediQ — Medical Document Intelligence

![MediQ Banner](./docs/banner.png)



## What is MediQ?

MediQ is an agentic AI system that reads raw patient documents handwritten notes, scanned PDFs, drug charts, lab reports and produces structured discharge summary drafts for clinician review.

## Why not just ChatGPT with a PDF?

| ChatGPT + PDF                              | MediQ                                                                  |
|--------------------------------------------|------------------------------------------------------------------------|
| Single LLM call over raw text              | Multi-step agent that plans, retrieves, and re-plans                   |
| Fills missing fields with plausible values | Marks every unverifiable field as `MISSING — clinician review required`|
| No source traceability                     | Every field cites the exact document and chunk it came from            |
| No conflict detection                      | Flags contradictions between documents, never silently resolves them   |
| No medication reconciliation               | Diffs admission vs discharge meds, surfaces unexplained changes        |
| Black box reasoning                        | Full per-step agent reasoning trace emitted and viewable               |

MediQ is not a chatbot. It is a clinical drafting agent with hard safety guardrails.



## Agentic Features

- **Real agent loop** — Stateful LangGraph orchestrates planning, RAG retrieval, and re-planning (max 5 iterations).
- **No hallucination guardrail** — Outputs `MISSING` if unsupported by sources. Never guesses clinical values.
- **Medication reconciliation** — Compares admission/discharge meds and flags undocumented changes.
- **Conflict detection** — Surfaces and flags disagreements across documents without arbitrarily resolving them.
- **Mock clinical tools** — Uses mock drug interaction and lab checkers, designed for easy real-API swapping.
- **Full observability** — Emits a structured, UI-viewable trace for every reasoning step and tool call.



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

---

## Prerequisites

- Node.js 18+ and pnpm
- Python 3.12+
- Supabase account (free tier)
- Cloudflare R2 bucket
- Upstash Redis database
- Mistral API key (required — used for OCR and embeddings)
- At least one LLM provider key: Groq, OpenAI, Anthropic, or Mistral

---

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

---

## How It Works