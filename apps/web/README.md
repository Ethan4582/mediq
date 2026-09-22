# MediQ web application

Frontend web interface for the MediQ medical document intelligence platform.

## Architecture

- **Framework**: Next.js 16 (App Router) with React 19 and TypeScript.
- **Design system**: Astryx Design System combined with Tailwind CSS.
- **Database access**: Drizzle ORM 0.45 via Supabase connection pooler with Server Actions.
- **Realtime updates**: Supabase Realtime channel for live message synchronization.
- **Testing**: Vitest with dependency injection seams.

## Core features

- **Clinical chat**: Direct interface for reviewing patient records, invoking agent runs, and asking follow-up questions.
- **Artifact panel**: Interactive side panel presenting structured discharge summaries, OCR document viewers, conflict alerts, and draft version history.
- **Folder and session management**: Organize patient sessions with custom folders, pinning, and inline renaming.
- **BYOK key management**: Manage encrypted API keys for OCR and reasoning providers.

## Scripts

```bash
# Start development server
pnpm dev

# Run production build
pnpm build

# Run Vitest test suite
pnpm test

# Generate Drizzle migration files
pnpm db:generate

# Push schema changes to database
pnpm db:push
```
