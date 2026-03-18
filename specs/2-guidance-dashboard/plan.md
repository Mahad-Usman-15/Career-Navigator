# Implementation Plan: Career Guidance, Dashboard & User Provisioning

**Branch**: `main` | **Date**: 2026-03-16 | **Spec**: [spec.md](spec.md)
**Input**: Phase 2 (POST/GET /api/generateguidance, GET /api/dashboard, POST /api/webhooks/clerk) + Phase 3 (/dashboard server-rendered page)

---

## Summary

Build the four remaining API endpoints plus the student dashboard UI. The Gemini AI call pattern, Prisma query pattern, and `requireAuth()` guard are all established from Phase 0+1 — this phase extends the same patterns to guidance generation, dashboard aggregation, and user provisioning via Clerk webhook. One new table (`users`) is added for the webhook. One new package (`svix`) is needed for webhook signature verification.

---

## Technical Context

**Language/Version**: JavaScript (existing route files stay `.js`) + TypeScript (new route files `.ts`, page `.tsx`)
**Primary Dependencies**:
- Existing: `@clerk/nextjs`, `@google/generative-ai`, `zod`, `@prisma/client` (v5.10.0), `next`, `react`
- New: `svix` (Clerk webhook signature verification)

**Storage**: Supabase (PostgreSQL + JSONB) via Prisma ORM v5.10.0
**Testing**: Vitest + `vi.mock()` for Prisma + MSW v2 for Gemini API (same setup as Phase 0+1)
**Target Platform**: Vercel (Next.js 16 App Router)
**Project Type**: Web application (Next.js monorepo)
**Performance Goals**: Guidance generation ≤ 15s p90; dashboard page load ≤ 3s p95
**Constraints**: `userId` exclusively from `auth()` session; new files in `.ts`/`.tsx`; webhook route NOT in `requireAuth()` pattern; `users` table created manually in Supabase
**Scale/Scope**: Pre-launch Karachi student cohort; ~100s of concurrent users initially

---

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Security-First | ✅ PASS | `requireAuth()` applied to all 3 API endpoints; webhook uses Svix signature instead (correct — no Clerk session for server-to-server calls) |
| II. Session-Driven Identity | ✅ PASS | All DB queries in guidance/dashboard routes use `userId` from `auth()`; webhook uses Clerk event `data.id` not client input |
| III. AI Reliability | ✅ PASS | `CareerGuidanceSchema` (Zod safeParse) validates Gemini response before DB write; 503 on AI failure; 500 if DB write fails after valid AI response |
| IV. Data Privacy | ✅ PASS | No PDF handling in this phase; no new PII fields beyond what spec requires |
| V. Language Consistency | ✅ PASS | New route files in `.ts`; new page in `.tsx`; existing `.js` routes untouched |
| VI. Lean Components | ✅ PASS | Dashboard UI uses shadcn components added on-demand only; no speculative additions |
| VII. Progressive Delivery | ✅ PASS | Phase 2+3 follows Phase 0+1; jobs service deferred |

**No violations. Gate passed.**

---

## Project Structure

### Documentation (this feature)

```text
specs/2-guidance-dashboard/
├── plan.md              <- this file
├── research.md          <- Phase 0 output
├── data-model.md        <- Phase 1 output
├── quickstart.md        <- Phase 1 output
├── contracts/
│   ├── generateguidance.md
│   ├── dashboard.md
│   └── webhooks-clerk.md
└── tasks.md             <- Phase 2 output (/sp.tasks — NOT created by /sp.plan)
```

### Source Code

```text
# New files (TypeScript)
app/api/generateguidance/
└── route.ts             <- POST + GET handlers

app/api/dashboard/
└── route.ts             <- GET handler (aggregates 3 tables)

app/api/webhooks/clerk/
└── route.ts             <- POST handler (Svix + users upsert)

app/dashboard/
└── page.tsx             <- server component; auth redirect + fetch /api/dashboard

# Schema update
prisma/schema.prisma     <- add users model

# Existing (no changes needed)
lib/db.ts
lib/auth-guard.ts
lib/schemas.ts           <- CareerGuidanceSchema already defined (tighten .min(1) -> .min(3))

# Test files (TypeScript — new)
__tests__/
├── generateguidance.test.ts
├── dashboard.test.ts
└── webhooks-clerk.test.ts
```

---

## Phase 0: Research Findings → research.md

See [research.md](research.md) for full findings. Key decisions:

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Guidance AI prompt | Single structured prompt with Pakistan market context | Reuses Gemini JSON-mode; Pakistan context baked in (not user input) |
| Dashboard query | `Promise.all()` — 3 parallel queries | Single round-trip; null on missing section; 500 if any throws |
| Webhook auth | `svix` Webhook.verify() with raw body | Official Clerk approach; CLERK_WEBHOOK_SECRET in env |
| Idempotency | `upsert({ update: {} })` | No-op on duplicate event; atomic at DB level |
| Dashboard page | Server component calling GET /api/dashboard | Keeps API testable; no direct Prisma in page |
| Users table | Manual Supabase SQL + prisma generate | prisma db push blocked by PgBouncer; same workaround as Phase 0+1 |

---

## Phase 1: Design

### Stream A — Guidance Route (`app/api/generateguidance/route.ts`)

**POST handler**:
1. `requireAuth()` → `userId`
2. `prisma.career_assessments.findUnique({ where: { clerkId: userId } })` → 400 if null
3. Build Gemini prompt (personality type, IQ score, qualification, skills; Pakistan market)
4. Call Gemini 1.5 Flash with `responseMimeType: "application/json"` → 503 on failure
5. `CareerGuidanceSchema.safeParse(parsed)` → 503 if !success (no DB write)
6. `prisma.career_guidance.create(...)` → 500 if DB write fails
7. Return 201 `{ guidance: record }`

**GET handler**:
1. `requireAuth()` → `userId`
2. `prisma.career_guidance.findFirst({ where: { clerkId: userId }, orderBy: { generatedAt: 'desc' } })` → 404 if null
3. Return 200 `{ guidance: record }`

**Schema tightening**: Update `CareerGuidanceSchema` in `lib/schemas.ts` — change `.min(1)` to `.min(3)` (spec FR-004: must be 3–5 career paths).

### Stream B — Dashboard Route (`app/api/dashboard/route.ts`)

**GET handler**:
1. `requireAuth()` → `userId`
2. `Promise.all([assessment query, guidance query, skillGap query])` — all inside a try/catch → 500 if any throws
3. Shape response: null sections for missing data; slice topCareers to 3; slice missingSkills to 5
4. Return 200 `{ assessment, guidance, skillGap }`

### Stream C — Webhook Route (`app/api/webhooks/clerk/route.ts`)

**POST handler**:
1. `req.text()` — raw body (not `req.json()`)
2. Check `svix-id`, `svix-timestamp`, `svix-signature` headers → 400 if missing
3. `new Webhook(CLERK_WEBHOOK_SECRET).verify(body, headers)` → 401 on failure
4. `JSON.parse(body)` → event
5. If `event.type !== 'user.created'`: return 200 (ignore other events)
6. `prisma.users.upsert({ where: { clerkId: event.data.id }, update: {}, create: {...} })`
7. Return 200 `{ received: true }`

**proxy.js**: Ensure `/api/webhooks/clerk` is NOT in `isProtectedApiRoute`.

### Stream D — Dashboard Page (`app/dashboard/page.tsx`)

**Server component**:
1. `const { userId } = await auth()` → `redirect('/sign-in')` if null
2. `const user = await currentUser()` — for display name
3. `fetch(process.env.NEXT_PUBLIC_APP_URL + '/api/dashboard', { headers: cookieHeader })` — single server-side fetch
4. Render sections:
   - Welcome banner: `user.firstName`
   - Assessment card: MBTI type, IQ score (show "Not completed" if null)
   - Top 3 career paths with match % progress bars (show "Generate guidance" CTA if null)
   - Skill gap summary: top missing skills (show "Run skill gap scan" CTA if null)
   - Quick action buttons: "Retake Assessment", "New Skill Gap Scan"

---

## Execution Order

```
Day 1 — Stream A (Guidance) + Schema update
├── tighten CareerGuidanceSchema: .min(1) -> .min(3)
├── add users model to prisma/schema.prisma
├── npx prisma generate
├── create users table in Supabase SQL Editor
├── implement app/api/generateguidance/route.ts (POST + GET)
└── __tests__/generateguidance.test.ts (POST: 401, 400 no assessment, 201 success, 503 AI failure, 503 bad schema, 500 DB failure; GET: 401, 404, 200)

Day 2 — Stream B (Dashboard API) + Stream C (Webhook)
├── implement app/api/dashboard/route.ts
├── __tests__/dashboard.test.ts (401, 200 all data, 200 null sections, 500 on any query failure)
├── implement app/api/webhooks/clerk/route.ts
├── verify proxy.js webhook route exclusion
└── __tests__/webhooks-clerk.test.ts (400 missing headers, 401 bad sig, 200 user.created, 200 duplicate idempotent, 200 ignore other events)

Day 3 — Stream D (Dashboard Page) + Integration
├── implement app/dashboard/page.tsx (server component)
├── add shadcn components as needed (npx shadcn@latest add ...)
├── verify redirect when signed out
├── verify full page load with all sections
└── npm test (all tests — Phase 0+1 + Phase 2+3)
```

---

## Risk & Mitigations

| Risk | Mitigation |
|------|-----------|
| Gemini returns 3–5 career paths inconsistently | `CareerGuidanceSchema.min(3).max(5)` rejects non-compliant responses; 503 returned |
| Webhook fires before `users` table exists | Create table in Supabase before deploying webhook endpoint |
| Server component can't forward Clerk session cookie to API | Use internal direct call: import API handler function directly in page (or use same-origin cookie forwarding) |
| `req.json()` called before `req.text()` in webhook handler | Research note: MUST call `req.text()` first — body stream is consumed after first read |
| Duplicate `svix` header values in test env | Mock Svix `Webhook.verify` in tests; do not test actual HMAC math |
| `users` table Prisma types not regenerated | Run `npx prisma generate` after adding model; CI step should validate this |
| Dashboard page breaks if API returns unexpected shape | Type the API response at the page level; handle null explicitly for every section |
