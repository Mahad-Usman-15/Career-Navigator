# Implementation Plan: Foundation + Assessment & Skill Gap Auth

**Branch**: `main` | **Date**: 2026-03-15 | **Spec**: [spec.md](spec.md)
**Input**: Phase 0 (shared infrastructure) + Phase 1 (career assessment + skill gap routes migrated to Supabase with auth)

---

## Summary

Replace the existing MongoDB/Mongoose career-assessment and skill-gap routes with Supabase/Prisma equivalents that enforce Clerk session authentication on every operation. Phase 0 lays blocking shared infrastructure (Prisma client, auth guard, Zod AI schemas, Vitest harness). Phase 1 runs two parallel streams: Stream A rewrites the career-assessment route, Stream B fixes and completes the skill-gap route.

---

## Technical Context

**Language/Version**: JavaScript (existing route files, `.js`) + TypeScript (all new lib files, `.ts`)
**Primary Dependencies**:
- Existing: `@clerk/nextjs`, `@google/generative-ai`, `zod`, `next`, `react`
- To install: `@prisma/client`, `prisma` (dev), `pdf-parse`, `vitest` (dev), `@vitest/coverage-v8` (dev), `msw` (dev — for mocking AI + DB in tests)

**Storage**: Supabase (PostgreSQL + JSONB) via Prisma ORM
**Testing**: Vitest + MSW (Mock Service Worker for AI calls) + Prisma mock
**Target Platform**: Vercel (Next.js 16 App Router)
**Project Type**: Web application (Next.js monorepo — no separate backend)
**Performance Goals**: Assessment submission ≤ 5s p95; skill gap analysis ≤ 10s p90
**Constraints**: No raw PDF binary in DB; `userId` exclusively from `auth()` session; new files in `.ts` only
**Scale/Scope**: Pre-launch — Karachi student cohort; ~100s of concurrent users initially

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Security-First | ✅ PASS | `requireAuth()` guard is the first deliverable in Phase 0; applied to all 4 route handlers |
| II. Session-Driven Identity | ✅ PASS | All DB queries use `userId` from `auth()` — `req.body.clerkId` pattern fully removed |
| III. AI Reliability | ✅ PASS | `SkillGapSchema` (Zod) validates AI response before any DB write; 503 on AI failure |
| IV. Data Privacy | ✅ PASS | `pdf-parse` extracts text server-side; raw binary never reaches DB |
| V. Language Consistency | ✅ PASS | Existing `.js` route files kept as-is; all new lib files (`db.ts`, `auth-guard.ts`, `schemas.ts`) in TypeScript |
| VI. Lean Components | ✅ PASS | No UI components added in this phase — backend only |
| VII. Progressive Delivery | ✅ PASS | Phase 0+1 precede Phase 2 (generateguidance, dashboard, webhook) |

**No violations. Gate passed.**

---

## Project Structure

### Documentation (this feature)

```text
specs/1-assessment-skillgap-auth/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── contracts/
│   ├── career-assessment.md
│   └── skillgap.md
└── tasks.md             ← Phase 2 output (/sp.tasks)
```

### Source Code

```text
# New files (TypeScript — Phase 0)
lib/
├── db.ts                    ← Prisma client singleton (replaces lib/mongodb.js)
├── auth-guard.ts            ← requireAuth() helper
└── schemas.ts               ← Zod schemas: SkillGapAnalysisSchema, CareerGuidanceSchema

prisma/
└── schema.prisma            ← 3 tables: career_assessments, career_guidance, skill_gaps

# Modified files (keep as .js — existing files)
app/api/career-assessment/
└── route.js                 ← Full rewrite: auth + Prisma + upsert (Stream A)

app/api/skillgap/
└── route.js                 ← Full rewrite: auth + FormData + pdf-parse + Prisma + GET (Stream B)

# Test files (TypeScript — new)
__tests__/
├── career-assessment.test.ts
└── skillgap.test.ts

# Config (new)
vitest.config.ts
```

---

## Phase 0: Research Findings → research.md

See [research.md](research.md) for full findings. Key decisions:

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Prisma client pattern | Singleton with global cache | Prevents connection pool exhaustion in Next.js dev hot-reload |
| Auth guard pattern | `requireAuth()` returns `userId` or throws `NextResponse` | Keeps route handlers clean — one line to protect a route |
| AI schema validation | Zod with `.safeParse()` | Non-throwing parse; lets us log schema errors before returning 503 |
| Test isolation | Vitest + `vi.mock()` for Prisma + MSW for AI | No live services needed in CI |
| PDF extraction | `pdf-parse` with empty-string check | Handles image-only PDFs gracefully with fallback message |

---

## Phase 1: Design

### Stream A — Career Assessment Route

**Approach**: Full rewrite of `app/api/career-assessment/route.js`. Auth guard first, then Prisma upsert. MBTI and IQ calculation logic is preserved from the existing file (already correct server-side logic).

**Key changes from current code:**
1. Remove `dbConnect()` + Mongoose — replace with `prisma` from `lib/db.ts`
2. Add `requireAuth()` as first call in both handlers
3. POST: `prisma.career_assessments.upsert({ where: { clerkId: userId }, ... })`
4. GET: `prisma.career_assessments.findUnique({ where: { clerkId: userId } })` → 404 if null
5. Fix broken `CareerAssessment` import (currently imported as `User` but referenced as `CareerAssessment`)

### Stream B — Skill Gap Route

**Approach**: Full rewrite of `app/api/skillgap/route.js`. Switch from JSON body to FormData, add `pdf-parse`, add GET handler, apply auth guard.

**Key changes from current code:**
1. Remove `dbConnect()` + Mongoose — replace with `prisma`
2. Add `requireAuth()` as first call
3. POST: Parse `FormData` instead of `req.json()`; detect `resume` file vs `resumeText` field
4. Extract PDF text via `pdf-parse`; return 400 if empty string
5. Validate AI response with `SkillGapAnalysisSchema.safeParse()`; return 503 on failure
6. Save via `prisma.skill_gaps.create()`
7. Add GET handler: `prisma.skill_gaps.findMany({ where: { clerkId: userId }, orderBy: { createdAt: 'desc' } })`
8. Remove `clerkId` + `clerkData` from body — identity from session only

---

## Execution Order

```
Day 1 (Mon)
└── Phase 0 — Foundation [BLOCKING — all of team]
    ├── Install packages: prisma, @prisma/client, pdf-parse, vitest, msw
    ├── Create prisma/schema.prisma (3 tables)
    ├── Run prisma db push → Supabase
    ├── lib/db.ts — Prisma singleton
    ├── lib/auth-guard.ts — requireAuth()
    ├── lib/schemas.ts — SkillGapAnalysisSchema + CareerGuidanceSchema (stub)
    └── vitest.config.ts — test harness setup
    CHECKPOINT: DB connects, auth guard returns 401, schema validates

Day 2–3 (Tue–Wed) — PARALLEL after Phase 0
├── Stream A: Career Assessment
│   ├── Rewrite app/api/career-assessment/route.js
│   ├── POST handler: auth + validate + MBTI/IQ calc + upsert
│   ├── GET handler: auth + findUnique + 404 on missing
│   └── __tests__/career-assessment.test.ts
│       ├── 401 no session (POST + GET)
│       ├── 400 missing fields
│       ├── 201 save + correct MBTI/IQ returned
│       ├── 200 GET existing record
│       ├── 404 GET no record
│       └── Upsert: second submit replaces first
└── Stream B: Skill Gap
    ├── Rewrite app/api/skillgap/route.js
    ├── POST handler: auth + FormData + pdf-parse + AI + schema validate + create
    ├── GET handler: auth + findMany (desc) + empty array if none
    └── __tests__/skillgap.test.ts
        ├── 401 no session (POST + GET)
        ├── 400 missing resume or JD
        ├── 400 empty PDF extraction
        ├── 201 PDF upload → analysis saved + returned
        ├── 201 text paste → analysis saved + returned
        ├── 503 AI service failure (no DB write)
        ├── 503 AI malformed response (no DB write)
        ├── 200 GET returns own records desc
        └── 200 GET returns [] for new user
```

---

## Risk & Mitigations

| Risk | Mitigation |
|------|-----------|
| `pdf-parse` returns empty on some valid PDFs | Log extraction length; return 400 with paste-fallback message |
| Prisma connection limits on Supabase free tier | Singleton pattern + `connection_limit=1` in `DATABASE_URL` for serverless |
| Gemini returns valid JSON but wrong shape | `SkillGapAnalysisSchema.safeParse()` — catches shape mismatches before DB write |
| Existing `ai-agent.js` still uses MongoDB pattern | `lib/ai-agent.js` is called by skillgap route — rewrite route will bypass it and call Gemini directly with new schema |
| Vitest incompatibility with Next.js App Router | Use `vitest` with `@vitejs/plugin-react`; mock `next/server` exports |
