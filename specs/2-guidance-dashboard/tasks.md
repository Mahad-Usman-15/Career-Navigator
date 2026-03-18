# Tasks: Career Guidance, Dashboard & User Provisioning

**Input**: Design documents from `specs/2-guidance-dashboard/`
**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/ ✅ quickstart.md ✅

**Tests**: Included — SC-007 explicitly requires a full test suite runnable without live DB or AI.

**Organization**: Tasks grouped by user story. US1 (guidance POST) and US3 (guidance GET) share the same route file — US3 is a separate phase since it has P2 priority and can be deferred.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Maps to user stories from spec.md (US1–US4)

---

## Phase 1: Setup

**Purpose**: Install new dependency, extend DB schema, regenerate Prisma client.

**⚠️ CRITICAL**: Must complete before any user story work begins.

- [X] T001 Install svix package — `npm install svix`
- [X] T002 Add `users` model to `prisma/schema.prisma` (fields: id cuid PK, clerkId unique, name default "", email default "", createdAt default now, @@index clerkId)
- [X] T003 Run `npx prisma generate` to regenerate Prisma client with `users` model types
- [X] T004 Create `users` table in Supabase SQL Editor (see `quickstart.md` Step 3 for exact SQL — `prisma db push` is blocked by PgBouncer)

**Checkpoint**: `prisma.users` is accessible in TypeScript; `users` table visible in Supabase Table Editor.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Schema tightening and route protection verification before any handler is written.

**⚠️ CRITICAL**: Must complete before Phase 3+.

- [X] T005 Tighten `CareerGuidanceSchema` in `lib/schemas.ts` — change `.min(1)` to `.min(3)` on the `recommendations` array (FR-004: must be 3–5 career paths)
- [X] T006 [P] Audit `proxy.js` — confirm `/api/webhooks/clerk` is NOT in `isProtectedApiRoute`; confirm `/api/generateguidance` and `/api/dashboard` ARE protected (add if missing)

**Checkpoint**: `CareerGuidanceSchema` rejects arrays with fewer than 3 items; webhook route is publicly reachable.

---

## Phase 3: User Story 1 — Guidance Generation (Priority: P1) 🎯 MVP

**Goal**: A signed-in student with a completed assessment can POST to generate AI career guidance. The AI response is validated and persisted. The endpoint is independently testable without the dashboard.

**Independent Test**: `POST /api/generateguidance` with a signed-in session returns 201 with 3–5 career paths. `GET /api/generateguidance` can retrieve the saved record (US3, separate phase). No dashboard page needed.

### Tests for User Story 1

> Write ALL test cases before implementation. Confirm each fails (red) before making it pass.

- [X] T007 [P] [US1] Write POST 401 test (no session → Unauthorized) in `__tests__/generateguidance.test.ts` — mock `requireAuth` to throw 401
- [X] T008 [P] [US1] Write POST 400 test (no assessment record → "assessment required") in `__tests__/generateguidance.test.ts` — mock `prisma.career_assessments.findUnique` returning null
- [X] T009 [P] [US1] Write POST 503 test (Gemini throws → service unavailable, no DB write) in `__tests__/generateguidance.test.ts` — mock Gemini fetch to reject
- [X] T010 [P] [US1] Write POST 503 test (Gemini returns malformed JSON → schema validation fails, no DB write) in `__tests__/generateguidance.test.ts` — mock Gemini response with missing fields
- [X] T011 [P] [US1] Write POST 500 test (DB write fails after valid AI response) in `__tests__/generateguidance.test.ts` — mock `prisma.career_guidance.create` to throw
- [X] T012 [P] [US1] Write POST 201 test (happy path: assessment exists, AI valid, DB write succeeds) in `__tests__/generateguidance.test.ts` — mock assessment record + valid Gemini response + successful create

### Implementation for User Story 1

- [X] T013 [US1] Create `app/api/generateguidance/route.ts` with POST handler skeleton — `requireAuth()` as first call, try/catch with `instanceof NextResponse` check
- [X] T014 [US1] Implement assessment prerequisite check in `app/api/generateguidance/route.ts` — `prisma.career_assessments.findUnique({ where: { clerkId: userId } })` → 400 if null
- [X] T015 [US1] Implement Gemini prompt builder in `app/api/generateguidance/route.ts` — construct prompt from `assessment.personality`, `assessment.iq`, `assessment.qualification`, `assessment.skills`; include Pakistan market context; call with `responseMimeType: "application/json"`; return 503 on failure
- [X] T016 [US1] Implement `CareerGuidanceSchema.safeParse` validation in `app/api/generateguidance/route.ts` — return 503 if `!result.success` (no DB write)
- [X] T017 [US1] Implement `prisma.career_guidance.create` in `app/api/generateguidance/route.ts` — fields: clerkId, assessmentId, assessmentSnapshot `{mbtiType, iqScore, qualification, skills}`, recommendations, overallTimeline; return 500 if create throws; return 201 with created record

**Checkpoint**: All 6 POST tests pass. `POST /api/generateguidance` is fully functional and independently verified.

---

## Phase 4: User Story 2 — Career Dashboard (Priority: P1)

**Goal**: A signed-in student opens `/dashboard` and sees their complete career profile — MBTI type, IQ score, top 3 career paths with match bars, top missing skills, and quick-action buttons. All data arrives in one server-rendered request. Sections with no data show a prompt, not an error.

**Independent Test**: `GET /api/dashboard` returns `{ assessment, guidance, skillGap }` with each section either populated or `null`. The `/dashboard` page renders without client-side loading spinners, redirects unauthenticated users to `/sign-in`, and shows "not completed" prompts for null sections.

### Tests for User Story 2 — Dashboard API

- [X] T018 [P] [US2] Write GET 401 test (no session) in `__tests__/dashboard.test.ts`
- [X] T019 [P] [US2] Write GET 200 test (all 3 sections populated) in `__tests__/dashboard.test.ts` — mock all 3 Prisma queries returning data; verify topCareers is sliced to 3, missingSkills sliced to 5
- [X] T020 [P] [US2] Write GET 200 test (all sections null — student has no data yet) in `__tests__/dashboard.test.ts` — mock all 3 queries returning null
- [X] T021 [P] [US2] Write GET cross-user isolation test in `__tests__/dashboard.test.ts` — mock all 3 queries scoped to user A's clerkId; assert that a request authenticated as user B receives `{ assessment: null, guidance: null, skillGap: null }`, never user A's data (SC-003)
- [X] T022 [P] [US2] Write GET 500 test (one table query throws — entire response is 500) in `__tests__/dashboard.test.ts` — mock `Promise.all` where career_guidance query throws

### Implementation for User Story 2 — Dashboard API

- [X] T023 [US2] Create `app/api/dashboard/route.ts` with GET handler — `requireAuth()` first, then `Promise.all` for all 3 table queries inside try/catch; return 500 if any query throws
- [X] T024 [US2] Implement response shaping in `app/api/dashboard/route.ts`:
  - `assessment`: map `personality.mbtiType`, `iq.score`, `iq.category`, `qualification`, `skills` from JSONB; null if no record
  - `guidance`: map `recommendations.slice(0, 3)` picking `{title, matchScore, marketOutlook}`, `overallTimeline`, `generatedAt`; null if no record
  - `skillGap`: map `analysis.compatibilityScore`, `analysis.missingSkills.slice(0, 5)`, `analysis.matchingSkills`, `createdAt`; null if no record

### Implementation for User Story 2 — Dashboard Page

- [X] T025 [P] [US2] Install required shadcn components via CLI — `npx shadcn@latest add card progress badge` (add only what the page actually needs per VI. Lean Components)
- [X] T026 [US2] Create `app/dashboard/page.tsx` as a server component — `auth()` check at top; `redirect('/sign-in')` if no `userId`; `currentUser()` for display name
- [X] T027 [US2] Implement server-side data fetch in `app/dashboard/page.tsx` — use `import { cookies } from 'next/headers'` to forward the Clerk session; call `fetch(process.env.NEXT_PUBLIC_APP_URL + '/api/dashboard', { headers: { Cookie: cookies().toString() } })` inside the server component
- [X] T028 [US2] Implement welcome banner and assessment section in `app/dashboard/page.tsx` — display `user.firstName`, MBTI type card, IQ score card, qualification, skills list; show "Complete your assessment" CTA if `data.assessment` is null
- [X] T029 [US2] Implement guidance section in `app/dashboard/page.tsx` — top 3 career paths with title, `matchScore` progress bars; `marketOutlook` text; show "Generate career guidance" CTA if `data.guidance` is null
- [X] T030 [US2] Implement skill gap section in `app/dashboard/page.tsx` — compatibility score display, top missing skills list, matching skills; show "Run skill gap scan" CTA if `data.skillGap` is null
- [X] T031 [US2] Implement quick-action buttons in `app/dashboard/page.tsx` — "Retake Assessment" links to `/careercounselling`, "New Skill Gap Scan" links to `/skillgapanalyzer`

**Checkpoint**: All 5 dashboard API tests pass. Dashboard page server-renders with all sections; redirects when signed out; null sections show prompts not errors.

---

## Phase 5: User Story 3 — Guidance Retrieval (Priority: P2)

**Goal**: A signed-in student can GET their most recently generated guidance at any time without triggering a new AI call.

**Independent Test**: `GET /api/generateguidance` returns the stored record when guidance exists; returns 404 when no guidance has been generated. No new AI call is made. Only the requesting user's data is returned.

### Tests for User Story 3

- [X] T032 [P] [US3] Write GET 401 test in `__tests__/generateguidance.test.ts` — extend existing test file
- [X] T033 [P] [US3] Write GET 404 test (no guidance record) in `__tests__/generateguidance.test.ts` — mock `prisma.career_guidance.findFirst` returning null
- [X] T034 [P] [US3] Write GET 200 test (guidance exists — most recent returned) in `__tests__/generateguidance.test.ts` — mock `findFirst` returning a guidance record
- [X] T035 [P] [US3] Write GET cross-user isolation test in `__tests__/generateguidance.test.ts` — mock `findFirst` with `where: { clerkId: userA }`; authenticate request as userB; assert 404 is returned, not userA's guidance (FR-011, US3 acceptance scenario 3)

### Implementation for User Story 3

- [X] T036 [US3] Add GET handler to `app/api/generateguidance/route.ts` — `requireAuth()`, then `prisma.career_guidance.findFirst({ where: { clerkId: userId }, orderBy: { generatedAt: 'desc' } })`; return 404 if null; return 200 with record

**Checkpoint**: All 4 GET tests pass. `GET /api/generateguidance` retrieves stored guidance independently; cross-user isolation verified.

---

## Phase 6: User Story 4 — User Provisioning (Priority: P2)

**Goal**: When a new student creates a Clerk account, a `users` table record is automatically created. Duplicate webhook events do not create duplicate records.

**Independent Test**: `POST /api/webhooks/clerk` with a valid Svix signature and `user.created` payload creates a row in the `users` table. Sending the same event twice results in exactly one row (idempotent). Invalid signatures return 401.

### Tests for User Story 4

- [X] T037 [P] [US4] Write POST 400 test (missing Svix headers) in `__tests__/webhooks-clerk.test.ts`
- [X] T038 [P] [US4] Write POST 401 test (invalid signature) in `__tests__/webhooks-clerk.test.ts` — mock `Webhook.verify` to throw
- [X] T039 [P] [US4] Write POST 200 test (`user.created` event → `users.upsert` called with correct clerkId, name, email) in `__tests__/webhooks-clerk.test.ts` — mock `Webhook.verify` to succeed; mock `prisma.users.upsert`
- [X] T040 [P] [US4] Write POST 200 idempotency test (same `user.created` event sent twice → `upsert` called; no duplicate) in `__tests__/webhooks-clerk.test.ts` — verify `update: {}` pattern
- [X] T041 [P] [US4] Write POST 200 test (non-`user.created` event type → returns `{ received: true }` with no DB write) in `__tests__/webhooks-clerk.test.ts`

### Implementation for User Story 4

- [X] T042 [US4] Create `app/api/webhooks/clerk/route.ts` — read body as `req.text()` (not `req.json()`); extract `svix-id`, `svix-timestamp`, `svix-signature` headers; return 400 if any missing
- [X] T043 [US4] Implement Svix signature verification in `app/api/webhooks/clerk/route.ts` — `new Webhook(process.env.CLERK_WEBHOOK_SECRET!).verify(body, headers)`; return 401 on verification failure
- [X] T044 [US4] Implement `user.created` handler in `app/api/webhooks/clerk/route.ts` — parse event from raw body; if `event.type !== 'user.created'` return 200 immediately; extract `id`, `first_name`, `last_name`, `email_addresses[0].email_address`
- [X] T045 [US4] Implement `prisma.users.upsert` in `app/api/webhooks/clerk/route.ts` — `where: { clerkId: event.data.id }`, `update: {}` (idempotent no-op), `create: { clerkId, name, email }`; return 200 `{ received: true }`

**Checkpoint**: All 5 webhook tests pass. Clerk test event creates one user row; re-sending creates no duplicate.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [X] T046 Run full test suite — `npm test` — confirm all tests pass (Phase 0+1 baseline 33 + Phase 2+3 new tests)
- [X] T047 [P] Run quickstart.md verify checklist — confirm all items ticked (svix installed, prisma generate run, users table exists, CLERK_WEBHOOK_SECRET set, manual smoke tests pass)
- [X] T048 [P] Manually validate SC-001 and SC-002 during smoke testing — time `POST /api/generateguidance` end-to-end (must be < 15 s) and `/dashboard` page load (must be < 3 s on a standard connection); log results
- [X] T049 [P] Update `CLAUDE.md` API endpoint status table — mark `POST /api/generateguidance`, `GET /api/generateguidance`, `GET /api/dashboard`, `POST /api/webhooks/clerk` as ✅; mark `GET /api/skillgap` as ✅ (completed in Phase 0+1)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — blocks all user story phases
- **Phase 3 (US1 - Guidance POST)**: Depends on Phase 2
- **Phase 4 (US2 - Dashboard)**: Depends on Phase 2; Phase 3 not strictly required (dashboard works with null guidance section) but guidance data makes manual testing richer
- **Phase 5 (US3 - Guidance GET)**: Depends on Phase 3 (extends same route file)
- **Phase 6 (US4 - Webhook)**: Depends on Phase 1 (users table) — independent of Phase 3, 4, 5
- **Phase 7 (Polish)**: Depends on all desired user story phases complete

### User Story Dependencies

- **US1 (P1)**: After Phase 2 — no story dependencies
- **US2 (P1)**: After Phase 2 — Dashboard API independent; dashboard page benefits from US1 data being present but functions with null sections
- **US3 (P2)**: After US1 — extends the same `route.ts` file; must add GET handler after POST is stable
- **US4 (P2)**: After Phase 1 — `users` table must exist; fully independent of US1/US2/US3

### Within Each User Story

- Write tests first → confirm red → implement → confirm green
- Tests marked `[P]` within a story can all be written simultaneously (different `describe` blocks in the same test file)
- Implementation tasks within a story must follow the order listed (skeleton → prerequisite check → AI call → validation → DB write)

---

## Parallel Opportunities

### Phase 1 — Sequential (each step depends on previous)
```
T001 (npm install) → T002 (schema edit) → T003 (prisma generate) → T004 (Supabase SQL)
```

### Phase 3 — Tests all parallel, then implementation sequential
```
Parallel: T007, T008, T009, T010, T011, T012
Sequential after tests: T013 → T014 → T015 → T016 → T017
```

### Phase 4 — API tests parallel, then sequential; page tasks partially parallel
```
Parallel: T018, T019, T020, T021, T022
Sequential: T023 → T024

Parallel with API: T025 (shadcn install)
Sequential page: T026 → T027 → T028 → T029 → T030 → T031
```

### Phase 5 — Tests all parallel, then implementation
```
Parallel: T032, T033, T034, T035
Sequential after tests: T036
```

### Phase 6 — Tests all parallel, then implementation sequential
```
Parallel: T037, T038, T039, T040, T041
Sequential after tests: T042 → T043 → T044 → T045
```

### Cross-Story Parallel (if solo developer, do sequentially; if team, assign streams)
```
Developer A: Phase 3 (US1) → Phase 5 (US3)
Developer B: Phase 4 (US2 API) → Phase 4 (US2 Page)
Developer C: Phase 6 (US4 Webhook)
```

---

## Implementation Strategy

### MVP Scope (US1 only — guidance generation)

1. Complete Phase 1 (Setup)
2. Complete Phase 2 (Foundational)
3. Complete Phase 3 (US1 — Guidance POST)
4. **STOP and VALIDATE**: `POST /api/generateguidance` returns 201 with valid career paths
5. All 6 US1 tests green; no live DB or AI needed in CI

### Full Delivery (all 4 user stories)

1. Phase 1 → Phase 2 → Phase 3 (US1) → Phase 4 (US2) → Phase 5 (US3) → Phase 6 (US4)
2. Each phase adds independently testable value
3. After Phase 4: student has a fully working dashboard
4. After Phase 5 + 6: guidance retrieval and user provisioning complete

---

## Summary

| Phase | Story | Tasks | Files |
|-------|-------|-------|-------|
| 1 Setup | — | T001–T004 | `prisma/schema.prisma` |
| 2 Foundational | — | T005–T006 | `lib/schemas.ts`, `proxy.js` |
| 3 US1 Guidance POST | P1 | T007–T017 | `app/api/generateguidance/route.ts`, `__tests__/generateguidance.test.ts` |
| 4 US2 Dashboard | P1 | T018–T031 | `app/api/dashboard/route.ts`, `app/dashboard/page.tsx`, `__tests__/dashboard.test.ts` |
| 5 US3 Guidance GET | P2 | T032–T036 | `app/api/generateguidance/route.ts`, `__tests__/generateguidance.test.ts` |
| 6 US4 Webhook | P2 | T037–T045 | `app/api/webhooks/clerk/route.ts`, `__tests__/webhooks-clerk.test.ts` |
| 7 Polish | — | T046–T049 | — |
| **Total** | | **49 tasks** | **7 source files** |

**Parallel opportunities identified**: 27 tasks marked `[P]`.
**MVP scope**: T001–T017 (17 tasks) — guidance POST end-to-end.
**New test cases**: 22 (added cross-user isolation for dashboard T021, guidance GET T035; added performance validation T048).
