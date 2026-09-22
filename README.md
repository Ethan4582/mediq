# MediQ: clinical document intelligence

MediQ is an agentic clinical documentation platform that converts unstructured medical records (such as handwritten doctor notes, scanned admission records, medication charts, and lab reports) into structured discharge summary drafts for clinician review.

## System architecture

The application is structured as a monorepo containing a Next.js web application and a FastAPI agent service:

- **Web interface (`apps/web`)**: Next.js 16 with App Router, React 19, TypeScript, Astryx Design System, and Tailwind CSS.
- **Database layer (`apps/web/src/db`)**: Drizzle ORM 0.45 communicating with PostgreSQL through Supabase connection poolers. All database interactions occur server-side through Next.js Server Actions.
- **Agent engine (`apps/api`)**: Python 3.12, FastAPI, and LangGraph. Executes multi-step extraction, vector retrieval over document chunks, medication reconciliation, and conflict detection.
- **Document extraction**: Mistral OCR processes uploaded PDF and image documents into structured markdown.
- **Vector search**: pgvector with embeddings generated via Mistral Embed.
- **Asynchronous tasks**: Celery and Upstash Redis for asynchronous OCR extraction pipelines.

## Clinical result workflows

The result workflow is implemented across both the chat interface and the dedicated artifact drawer:

1. **Artifact inspection drawer (`ArtifactPanelAstryx.tsx`)**:
   - **Summary view**: Displays structured clinical sections including principal diagnosis, secondary diagnoses, hospital course, discharge medications with dosage and frequency, and follow-up directives.
   - **Conflict detection**: Highlights contradictions across multidisciplinary notes and lab findings using warning indicators.
   - **Source documents view**: Lists uploaded documents with page counts, status, and raw extracted OCR text.
   - **Historical versions**: Tracks past draft versions for a session, allowing clinicians to inspect and restore earlier summaries.
   - **Export actions**: Supports markdown copy, file download, and direct print formatting.

2. **In-stream summary cards (`ChatMessageItemAstryx.tsx`)**:
   - Renders interactive cards in the message timeline whenever a discharge summary draft is emitted.
   - Allows one-click expansion directly into the artifact panel.

3. **Responsive layout**:
   - On desktop, displays side-by-side with chat and resizable panel widths.
   - On mobile viewports, transitions automatically to a full-screen dialog overlay.

## Database schema and orm

All database operations use Drizzle ORM. Client components interact exclusively through server actions; no direct database clients or credentials run in the browser.

### Managed tables

- `profiles`: User profile data and preferences.
- `folders`: Organizational folders for grouping clinical patient sessions.
- `sessions`: Clinical consultation sessions linked to users and optional folders.
- `documents`: Uploaded clinical records and storage metadata.
- `chunks`: Embedded text segments with pgvector vector representations.
- `runs`: LangGraph agent execution states and progress records.
- `drafts`: Structured clinical discharge summaries and JSON payloads.
- `messages`: Chat message history between clinician and assistant.
- `api_keys`: Encrypted provider credentials for OCR and LLM services.

### Database indexes

Targeted indexes exist on relational join and ordering columns:

- `sessions_user_id_created_at_idx`: Fast session listing filtered by user.
- `sessions_folder_id_idx`: Folder navigation lookups.
- `folders_user_id_idx`: Folder retrieval per user.
- `documents_session_id_idx`: Document listing by session.
- `chunks_session_id_idx`: Chunk retrieval for session context.
- `drafts_session_id_created_at_idx`: Chronological draft history per patient.
- `messages_session_id_created_at_idx`: Chronological chat replay.
- `runs_session_id_idx`: Execution tracking per session.
- `api_keys_user_id_idx`: User credential lookups.

## Testing

The project uses Vitest for testing server actions and utility functions in `apps/web`.

Tests run without monkeypatching or module mocks. Instead, server actions support dependency injection seams (`MessageReader`, `SessionReader`), allowing deterministic tests that pass strict Oxlint anti-slop guidelines.

Run the test suite:

```bash
pnpm --filter web test
```

## Linting and validation

Code is verified against Oxlint with customized anti-slop rules, enforcing explicit type boundaries, readable spacing, and the removal of artificial AI writing patterns:

```bash
# Run oxlint on server actions and tests
pnpm exec oxlint apps/web/src/actions apps/web/src/lib/__tests__

# Run TypeScript type check across the web workspace
pnpm --filter web exec tsc --noEmit
```

## Getting started

### Environment variables

In `apps/web/.env`:

```env
DATABASE_URL=postgresql://postgres.<project-ref>:<password>@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?sslmode=require
DIRECT_URL=postgresql://postgres.<project-ref>:<password>@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres?sslmode=require
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
NEXT_PUBLIC_API_URL=http://localhost:8000
```

In `apps/api/.env`:

```env
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
CLOUDFLARE_R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
CLOUDFLARE_R2_ACCESS_KEY=<access-key>
CLOUDFLARE_R2_SECRET_KEY=<secret-key>
CLOUDFLARE_R2_BUCKET=mediq-documents
UPSTASH_REDIS_URL=rediss://default:<token>@<host>:6379
ENCRYPTION_KEY=<fernet-key>
```

### Local execution

```bash
# Install dependencies
pnpm install

# Start Next.js development server
pnpm --filter web dev

# Start FastAPI server
cd apps/api
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
