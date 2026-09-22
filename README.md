# MediQ

MediQ is an AI-powered clinical documentation platform that transforms unstructured medical records—such as handwritten clinician notes, scanned admission documents, medication charts, and lab reports—into structured, verifiable discharge summary drafts.

---

## Overview

MediQ accelerates clinical workflows by combining optical character recognition (OCR), semantic search, and agentic multi-step reasoning to extract, synthesize, and reconcile clinical information while highlighting potential documentation conflicts.

```
┌─────────────────────────────────┐
│     Clinical Document Upload    │ (PDFs, Scans, Handwritten Notes)
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│   Mistral OCR & Chunk Embed     │
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│  LangGraph Clinical Agent Flow  │ ──► Diagnoses, Course, Medications
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│    Interactive Review Panel     │ (Conflict Alerts, Source Grounding, Export)
└─────────────────────────────────┘
```

---

## Key Features

- **Agentic Discharge Summaries**: Generates principal diagnoses, secondary diagnoses, hospital course narratives, and reconciled discharge medication plans.
- **Clinical Conflict Detection**: Flags contradictions between multidisciplinary clinician notes, lab results, and medication orders.
- **Source Grounding & OCR Inspection**: Direct access to raw extracted text and original source document pages alongside generated summaries.
- **Version History & Restoration**: Tracks draft iterations across clinical runs with one-click revision restoration.
- **Multimodal Chat Workspace**: Split-pane interface featuring inline artifact cards, slash commands (`/summarize`, `/reconcile`), and mention triggers.
- **Multi-Provider BYOK**: Support for OpenAI, Anthropic, Gemini, Mistral, and Groq reasoning backends with encrypted key management.

---

## Monorepo Architecture

```
mediq/
├── apps/
│   ├── web/        # Next.js 16 (App Router), React 19, Astryx UI, Drizzle ORM, Supabase
│   └── api/        # FastAPI, LangGraph, Mistral OCR, pgvector, Celery / Redis
└── tools/          # anti-slop rules, linters, and repository configs
```

### Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 16, React 19, TypeScript, Astryx Design System, Tailwind CSS |
| **Data & ORM** | Supabase (PostgreSQL), Drizzle ORM, pgvector |
| **Backend & Agents** | Python 3.12, FastAPI, LangGraph, Mistral OCR |
| **Task Queue & Cache** | Celery, Upstash Redis, Cloudflare R2 |

---

## Quickstart

### Prerequisites

- **Node.js**: `v20+` and **pnpm**: `v9+`
- **Python**: `3.12+`
- **Supabase** instance (PostgreSQL with `pgvector` enabled)

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/your-org/mediq.git
cd mediq

# Install frontend dependencies
pnpm install
```

### 2. Environment Setup

Configure environment variables in `apps/web/.env`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
NEXT_PUBLIC_API_URL=http://localhost:8000
DATABASE_URL=postgresql://postgres.<project-ref>:<password>@<pooler-host>:6543/postgres?sslmode=require
DIRECT_URL=postgresql://postgres.<project-ref>:<password>@<direct-host>:5432/postgres?sslmode=require
```

Configure environment variables in `apps/api/.env`:

```env
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
CLOUDFLARE_R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
CLOUDFLARE_R2_ACCESS_KEY=<access-key>
CLOUDFLARE_R2_SECRET_KEY=<secret-key>
CLOUDFLARE_R2_BUCKET=mediq-documents
UPSTASH_REDIS_URL=rediss://default:<token>@<host>:6379
ENCRYPTION_KEY=<fernet-encryption-key>
MISTRAL_API_KEY=<mistral-key>
```

### 3. Run Development Servers

```bash
# Start Next.js frontend (http://localhost:3000)
pnpm --filter web dev

# Start FastAPI backend (http://localhost:8000)
cd apps/api
python -m venv .venv
# Windows: .venv\Scripts\activate | Unix: source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

---

## Testing & Linting

```bash
# Run frontend unit & integration tests
pnpm --filter web test

# Run ESLint & type checking
pnpm --filter web lint
pnpm --filter web build
```

---

## Security & Privacy

- Client components communicate with the database exclusively via authenticated Server Actions.
- Patient health identifiers (PHI) and third-party API keys are encrypted at rest.
- Designed with HIPAA compliance guardrails and deterministic clinical extraction boundaries.
