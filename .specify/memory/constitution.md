<!--
SYNC IMPACT REPORT
==================
Version change: 0.0.0 (template) → 1.0.0
Modified principles: All (first population — template placeholders replaced)
Added sections:
  - I. Security-First
  - II. Session-Driven Identity
  - III. AI Reliability & Structured Responses
  - IV. Data Privacy & Minimal Storage
  - V. Language Consistency
  - VI. Lean Components & YAGNI
  - VII. Progressive Feature Delivery
  - Tech Stack Constraints
  - Development Workflow
  - Governance
Removed sections: None (template populated, not restructured)
Templates requiring updates:
  ✅ .specify/memory/constitution.md — this file
  ✅ .specify/templates/plan-template.md — Constitution Check gate references updated
  ⚠  .specify/templates/spec-template.md — no structural changes required
  ⚠  .specify/templates/tasks-template.md — no structural changes required
Follow-up TODOs:
  - RATIFICATION_DATE confirmed as 2026-03-13 (first writing of constitution)
  - Jobs & Internships service deferred — no principle needed until feature begins
-->

# Career Navigator Constitution

## Core Principles

### I. Security-First (NON-NEGOTIABLE)

Every protected route and API endpoint MUST enforce authentication through two independent layers:
1. Clerk middleware (`proxy.js`) at the edge — blocks unauthenticated requests before they reach application code.
2. Server-side `auth()` call inside every protected page and API handler — returns HTTP 401 if no valid session exists.

Neither layer may be omitted or bypassed. A route secured only at the edge (middleware) with no server-side check is considered insecure. A route with only server-side auth and no middleware guard is also non-compliant.

**Rationale**: The target audience is students in Pakistan where public/shared device usage is common. A leaked session or forged request must be stopped before DB queries execute.

### II. Session-Driven Identity (NON-NEGOTIABLE)

The `userId` used in every database query MUST be sourced exclusively from the server-side Clerk `auth()` session object. It MUST NOT be read from `req.body`, query parameters, path parameters, or any client-supplied value.

```
✅  const { userId } = await auth();  →  db.query({ where: { clerkId: userId } })
❌  const { clerkId } = req.body;     →  db.query({ where: { clerkId } })
```

**Rationale**: Client-supplied identity allows horizontal privilege escalation — any user could access any other user's assessment, guidance, or skill-gap data by simply passing a different ID.

### III. AI Reliability & Structured Responses

All AI calls (`@openai/agents` SDK via Groq primary, Gemini 1.5 Flash fallback) MUST:
- Use `Agent` + `run()` from the `@openai/agents` npm package for Groq-backed calls; use `responseMimeType: "application/json"` via `@google/generative-ai` for the Gemini fallback.
- Validate the parsed response against the expected Zod schema before writing to the database.
- Return a structured error (not a raw AI error string) to the client on AI failure.
- Never expose raw AI provider error messages, API keys, or prompt text in HTTP responses.

**"OpenAI Agents SDK"** in this constitution refers exclusively to the **`@openai/agents`** npm package (the Agent/Runner abstraction), pointed at Groq's OpenAI-compatible endpoint (`https://api.groq.com/openai/v1`) via a custom OpenAI client. It does NOT refer to the raw `openai` npm package used with direct `chat.completions.create()` calls.

Primary AI layer: `@openai/agents` → Groq (`llama-3.3-70b-versatile` → `llama-3.1-8b-instant` fallback). Secondary layer: `@google/generative-ai` → Gemini 1.5 Flash. If all providers fail, the endpoint MUST return HTTP 503 with a human-readable message — not a 500 stack trace.

**Rationale**: Groq free tier provides 14,400 req/day with low latency. The `@openai/agents` Agent/Runner abstraction provides a consistent layer for structured outputs and model swapping. Unvalidated AI JSON silently corrupts JSONB columns; structured errors protect vendor key confidentiality.

### IV. Data Privacy & Minimal Storage

Raw PDF binary MUST never be stored in the database or logged. The extraction pipeline is:

```
PDF upload → pdf-parse (server-side only) → extracted text string → DB (resumeContent column)
```

If the original PDF file must be retained, it goes to the Supabase Storage bucket and only the public/signed URL is stored in the DB. No PII beyond what Clerk already holds (name, email) may be stored without a documented reason in the relevant spec.

**Rationale**: Storing binary blobs in PostgreSQL inflates DB size on the free tier and creates GDPR/data-minimization obligations for a student-facing platform.

### V. Language Consistency

- **Existing files** (`.js` / `.jsx`): MUST NOT be converted to TypeScript during unrelated changes. Refactor only if a spec explicitly scopes it.
- **New files**: MUST be written in TypeScript (`.ts` / `.tsx`). This applies to new API routes, Prisma schema files, agent wrappers, and utility modules.
- Next.js mixed JS/TS compilation is intentional and supported — do not add a `// @ts-nocheck` escape to new TS files.

**Rationale**: Forced migration would introduce churn across 40+ existing pages with no immediate user value. New TS files gain type safety where it matters most (API contracts, AI response schemas, Prisma queries).

### VI. Lean Components & YAGNI

The `components/` directory MUST remain minimal. The permitted baseline set is:
`navbar`, `footer`, `PersonalityCard`, `emailtemplate`, `gradientbutton`, `data/personalityTypes`, `ui/accordion`.

New UI components MUST be added via `npx shadcn@latest add <component>` only when a page implementation actually requires them. Components MUST NOT be added speculatively or for future use. Unused components MUST be deleted — not commented out.

**Rationale**: 63 components were previously deleted to reduce bundle size and cognitive overhead. Re-accumulating unused components repeats the same mistake.

### VII. Progressive Feature Delivery

Features MUST be delivered in the priority order established in CLAUDE.md:

```
POST /api/generateguidance  →  GET /api/dashboard  →  GET /api/skillgap
→  GET /api/generateguidance  →  POST /api/webhooks/clerk
```

Deferred services (Jobs & Internships — JSearch, Adzuna, Rozee.pk, JobMatchAgent) MUST NOT be started until all core API endpoints above are complete and deployed. No scaffolding, stub routes, or placeholder DB tables for deferred features may be merged to `main`.

**Rationale**: Core career guidance (assessment → AI guidance → skill gap → dashboard) delivers the primary user value. Premature job-matching work competes for free-tier AI quota and DB connections.

## Tech Stack Constraints

These constraints are architectural decisions — changing them requires a documented ADR:

| Layer | Locked Choice | Reason |
|-------|--------------|--------|
| Framework | Next.js 16 App Router + React 19 | Existing codebase |
| Auth | Clerk | Middleware + server-side `auth()` pattern already integrated |
| Database | Supabase (PostgreSQL + JSONB) via Prisma ORM | MongoDB Atlas replaced due to IP/port issues in Pakistan |
| AI Primary | `@openai/agents` SDK → Groq (`llama-3.3-70b-versatile`) | 14,400 req/day free tier; Agent/Runner abstraction for structured outputs |
| AI Fallback | Google Gemini 1.5 Flash (`@google/generative-ai`) | Working JSON-mode output |
| Email | Resend | Already integrated (`/api/contact`) |
| Deployment | Vercel | Next.js native target |
| Styling | Tailwind CSS v4 + Framer Motion | Existing design system |

**Environment variables** required for every deployment (see CLAUDE.md for full list):
`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`,
`DATABASE_URL`, `GEMINI_API_KEY`, `GROQ_API_KEY`, `RESEND_API_KEY`, `NEXT_PUBLIC_APP_URL`.

A deployment is invalid if any of these variables is absent. CI MUST fail fast on missing env vars before any Prisma migration runs.

## Development Workflow

### API Route Checklist

Every new or modified API route MUST satisfy all of the following before merge:

- [ ] `const { userId } = await auth()` is the first non-import statement (or equivalent `requireAuth()` wrapper that internally calls `auth()` and throws a NextResponse 401 — catch blocks must check `if (error instanceof NextResponse) return error`)
- [ ] Returns `{ error: 'Unauthorized' }` with status 401 if `!userId`
- [ ] DB queries use `userId` from session — never from request input
- [ ] AI calls request JSON-mode output and validate the parsed result
- [ ] PDF handling uses `pdf-parse` server-side; no binary stored in DB
- [ ] FormData (not JSON body) used for file-upload endpoints

### Dashboard Page Requirements

The `/dashboard` page MUST be a Next.js **server component** using Clerk's `auth()` + `currentUser()`. It MUST redirect (not render) to `/sign-in` if no session is found. It MUST aggregate data from all three tables (`career_assessments`, `career_guidance`, `skill_gaps`) in a single `GET /api/dashboard` call — not via separate client-side fetches.

### Prisma & Database

- Schema changes MUST go through `prisma db push` (dev) or a migration file (prod).
- JSONB columns are the default for nested/array data — do not introduce new `TEXT` columns for structured data.
- Never query by `clerkId` received from the client — always derive from `auth()`.

### Code Review Gates

PRs MUST be blocked if they:
1. Read identity from `req.body` or query params for DB access.
2. Store raw PDF binary in any database column.
3. Add a new shadcn component without a corresponding page that requires it.
4. Introduce a deferred-feature stub route on the `main` branch.
5. Leave a new `.ts`/`.tsx` file with `// @ts-nocheck`.

## Governance

This constitution supersedes all other development practices documented in the repository. When a conflict exists between this document and any other guide, this document wins.

### Amendment Procedure

1. Open a PR that modifies this file with a clear description of the proposed change and the motivation.
2. Bump `CONSTITUTION_VERSION` according to semantic versioning:
   - **MAJOR** (X.0.0): A non-negotiable principle is removed, renamed with a behavior change, or its scope materially narrowed.
   - **MINOR** (x.Y.0): A new principle or section is added, or existing guidance is materially expanded.
   - **PATCH** (x.y.Z): Wording clarification, typo fixes, formatting, or non-semantic refinements.
3. Update `LAST_AMENDED_DATE` to the date of the PR merge.
4. Run the consistency propagation checklist (templates, CLAUDE.md) before merging.
5. A single approver is sufficient given the current team size.

### Compliance Review

Every sprint (or equivalent planning cycle) MUST include a check that:
- All merged API routes pass the API Route Checklist above.
- No deferred-feature code has landed on `main`.
- Component count in `components/` has not grown without a corresponding spec.

### Runtime Development Guidance

For agent-assisted development, refer to `CLAUDE.md` at the project root. That file contains the canonical API endpoint status table, data model definitions, build priority order, and environment variable list. Keep `CLAUDE.md` in sync with this constitution when either is amended.

---

**Version**: 1.2.0 | **Ratified**: 2026-03-13 | **Last Amended**: 2026-03-17
