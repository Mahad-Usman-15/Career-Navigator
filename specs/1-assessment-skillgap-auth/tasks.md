# Tasks: Foundation + Assessment & Skill Gap Auth

**Input**: Design documents from `specs/1-assessment-skillgap-auth/`
**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/ ✅ quickstart.md ✅

**Tests**: Included — Vitest suite covering all routes and edge cases.

**Phase mapping** (spec → tasks):
- Spec "Phase 0" (foundation) = Tasks Phase 2
- Spec "Phase 1 Stream A" (assessment) = Tasks Phase 3
- Spec "Phase 1 Stream B" (skill gap) = Tasks Phase 4

**Organization**:
- Phase 1: Setup (package install + config)
- Phase 2: Foundation / US0 — BLOCKING prerequisite for all streams
- Phase 3: User Story 1 — Career Assessment (Stream A)
- Phase 4: User Story 2 — Skill Gap (Stream B) — runs in parallel with Phase 3
- Phase 5: User Story 3 — Data Exclusivity (cross-cutting — covered by US1+US2 tests)
- Phase 6: Polish & final validation

**Note on US3 (Data Exclusivity)**: Enforced at the infrastructure level by `proxy.js` middleware (layer 1) and `requireAuth()` (layer 2). Tested as part of US1 and US2 test suites. No separate implementation phase needed.

---

## Phase 1: Setup

**Purpose**: Install new dependencies and configure test harness. T001, T002, T003 are all independent and can run in parallel.

- [x] T001 [P] Install production packages: `npm install @prisma/client pdf-parse`
- [x] T002 [P] Install dev packages: `npm install -D prisma vitest @vitejs/plugin-react @vitest/coverage-v8 msw@2 @types/pdf-parse` — pin `msw@2` explicitly; MSW v2 API (`http.post()` / `HttpResponse.json()`) is incompatible with v1 (`rest.post()` / `res(ctx.json(...))`))
- [x] T003 [P] Create `vitest.config.ts` at project root — configure environment: node, globals: true, path alias `@` → project root, plugin: @vitejs/plugin-react

---

## Phase 2: Foundation — US0 (Blocks ALL Streams)

**Purpose**: Shared infrastructure that every Phase 3+ task depends on. Must be 100% complete before any stream begins.

**⚠️ CRITICAL**: No stream work (Phase 3 or 4) can begin until this phase is complete and checkpoint passes.

**Goal**: Middleware blocks unauthenticated API calls, DB connected to Supabase, auth guard returning 401, Zod schemas validating AI responses, test harness runnable.

**Independent Test**: `curl http://localhost:3000/api/career-assessment` returns 401. `npx vitest run` exits 0.

- [x] T004 [P] Verify `proxy.js` middleware — confirm `isProtectedApiRoute` matcher covers `/api/career-assessment(.*)`, `/api/skillgap(.*)`, `/api/generateguidance(.*)`, `/api/dashboard(.*)`; confirm unauthenticated requests return JSON `{ error:'Unauthorized' }` with status 401 before reaching route handlers (constitution Principle I — layer 1). Note: proxy.js has been pre-updated; this task is a verification checkpoint.
- [x] T005 Create `prisma/schema.prisma` — define 3 models: `career_assessments` (clerkId UNIQUE, personality Json, iq Json, skills Json), `career_guidance` (clerkId, assessmentId FK → career_assessments with onDelete:Cascade, recommendations Json, overallTimeline Json), `skill_gaps` (clerkId, resumeSource, resumeContent, jobDescription, analysis Json — no `name` field) — see data-model.md for full schema
- [x] T006 Run `npx prisma generate && npx prisma db push` — generate done (client v5.10.0); tables created manually via Supabase SQL Editor (port 5432 blocked by ISP); all 3 tables verified via Prisma query — verify Supabase shows all 3 tables created (must run after T005)
- [x] T007 [P] Create `lib/db.ts` — Prisma singleton using `globalThis` cache; export named `prisma`; include inline comment referencing `?connection_limit=1` DATABASE_URL tip for serverless
- [x] T008 [P] Create `lib/auth-guard.ts` — export `requireAuth(): Promise<string>`; calls `auth()` from `@clerk/nextjs/server`; throws `NextResponse.json({ error: 'Unauthorized' }, { status: 401 })` if `!userId`; returns `userId` string (constitution Principle I — layer 2)
- [x] T009 [P] Create `lib/schemas.ts` — export `SkillGapAnalysisSchema` (Zod: missingSkills string[], matchingSkills string[], recommendations string, compatibilityScore number 0–100, suggestedRoadmap Array<{step:string, resource:string}>); export `CareerGuidanceSchema` stub (see research.md); export inferred TypeScript types
- [x] T010 Create `__tests__/foundation.test.ts` — test `requireAuth` throws NextResponse 401 when `auth()` returns null userId; test `SkillGapAnalysisSchema.safeParse` returns success:true on valid shape; test `SkillGapAnalysisSchema.safeParse` returns success:false on missing `compatibilityScore`

**Checkpoint**: All T004–T010 done. `npx vitest run __tests__/foundation.test.ts` passes. Supabase tables visible. 401 confirmed on unauthenticated API call (both middleware and server-side layers).

---

## Phase 3: User Story 1 — Career Assessment (Stream A)

**Goal**: Signed-in student can POST a complete assessment (upsert) and GET their saved assessment (404 if none).

**Independent Test**: POST returns 201 with mbtiType + iqScore. GET returns 200 for existing, 404 for new user. 401 on all operations without session. `npx vitest run __tests__/career-assessment.test.ts` passes.

**Can start**: After Phase 2 checkpoint passes.
**Runs in parallel with**: Phase 4 (different files — no conflicts).

### Tests for US1

- [x] T011 [P] [US1] Create `__tests__/career-assessment.test.ts` — set up Prisma mock (`vi.mock('@/lib/db')`) and Clerk auth mock (`vi.mock('@clerk/nextjs/server')`); scaffold test structure with describe blocks for POST and GET; write all test stubs before any implementation

### Implementation for US1

- [x] T012 [US1] Rewrite `app/api/career-assessment/route.js` POST handler — remove all Mongoose/dbConnect imports; add `requireAuth` from `lib/auth-guard.ts` and `prisma` from `lib/db.ts`; call `requireAuth()` first in try block; validate required fields (name, age, current_qualification, mbtiAnswers, iqAnswers) → return 400 if any missing; preserve existing `calculateMBTI()` and `calculateIQScore()` functions unchanged (note: ties resolve to first letter E/S/T/J via `>` operator — intentional default); replace `new CareerAssessment().save()` with `prisma.career_assessments.upsert({ where: { clerkId: userId }, update: {...}, create: {...} })`; return 201 `{ success:true, data:{ id, mbtiType, iqScore, completedAt } }`. **CRITICAL — catch block pattern**: `catch(error) { if (error instanceof NextResponse) return error; console.error(error); return NextResponse.json({ error:'Failed to save assessment' }, { status:500 }) }` — the `instanceof` check is mandatory; without it the 401 from `requireAuth()` becomes a 500
- [x] T013 [US1] Add GET handler to `app/api/career-assessment/route.js` — call `requireAuth()` first; query `prisma.career_assessments.findUnique({ where: { clerkId: userId } })`; return 404 `{ error:'No assessment found' }` if result is null; return 200 `{ success:true, data: record }` if found
- [x] T014 [US1] Fill test cases in `__tests__/career-assessment.test.ts` (11 cases total):
  - POST 401: mock auth returns null → expect 401 `{ error:'Unauthorized' }`
  - POST 400: missing `name` field → expect 400 with field error
  - POST 400: missing `mbtiAnswers` → expect 400
  - POST 201: valid full payload → expect 201 with mbtiType (e.g. 'INTJ') and numeric iqScore
  - POST upsert: call POST twice with same mock userId → verify `upsert` called both times (not `create`)
  - POST DB failure: mock `prisma.career_assessments.upsert` throws → expect 500 with no partial save
  - GET 401: mock auth returns null → expect 401
  - GET 404: `findUnique` returns null → expect 404 `{ error:'No assessment found' }`
  - GET 200: `findUnique` returns record → expect 200 with assessment data
  - GET identity: verify `findUnique` called with `{ where: { clerkId: userId } }` — NOT with any request param
  - GET DB failure: mock `prisma.career_assessments.findUnique` throws → expect 500

**Checkpoint**: All 11 test cases in career-assessment.test.ts pass (9 core + 2 DB-failure cases added per M1 fix). POST and GET routes work end-to-end per quickstart.md steps 5–8.

---

## Phase 4: User Story 2 — Skill Gap Analyzer (Stream B)

**Goal**: Signed-in student can POST a resume (PDF or text) + job description to receive AI analysis; GET their previous analyses ordered most-recent-first (empty array if none).

**Independent Test**: POST 201 with analysis containing missingSkills, matchingSkills, compatibilityScore 0–100, suggestedRoadmap. PDF extraction triggers 400 fallback on empty PDF. AI failure returns 503 with no DB write. GET 200 returns array. `npx vitest run __tests__/skillgap.test.ts` passes.

**Can start**: After Phase 2 checkpoint passes.
**Runs in parallel with**: Phase 3 (different files — no conflicts).

### Tests for US2

- [x] T015 [P] [US2] Create `__tests__/skillgap.test.ts` — set up Prisma mock, Clerk auth mock, and MSW server intercepting Gemini API `fetch` calls; scaffold describe blocks for POST (PDF path, text path, AI failure path, DB failure path) and GET; write all test stubs before implementation

### Implementation for US2

- [x] T016 [US2] Rewrite `app/api/skillgap/route.js` POST handler — remove all Mongoose/dbConnect imports and `clerkId`/`clerkData`/`name` from request body; import `requireAuth`, `prisma`, `SkillGapAnalysisSchema`; call `requireAuth()` first; parse `FormData` (not `req.json()`); branch on `resume` File vs `resumeText` string field vs neither (400); if PDF: `const buf = Buffer.from(await file.arrayBuffer()); const { text } = await pdfParse(buf)`; if `text.trim()` is empty return 400 `{ error:'Could not extract text from PDF. Please paste your resume as text instead.' }`; call Gemini `@google/generative-ai` with `responseMimeType:'application/json'` and prompt combining resumeContent + jobDescription; `SkillGapAnalysisSchema.safeParse(JSON.parse(aiText))` — if `!result.success` return 503 `{ error:'AI service unavailable. Please try again later.' }` (no DB write); `prisma.skill_gaps.create({ data:{ clerkId:userId, resumeSource, resumeContent:extractedText, jobDescription, analysis:result.data } })`; return 201. Note: no `name` field in create call — removed per H1 fix (name is redundant; clerkId identifies the user). **CRITICAL — catch block pattern**: `catch(error) { if (error instanceof NextResponse) return error; console.error(error); return NextResponse.json({ error:'Failed to process analysis' }, { status:500 }) }` — the `instanceof` check is mandatory; without it the 401 from `requireAuth()` becomes a 500
- [x] T017 [US2] Add GET handler to `app/api/skillgap/route.js` — `requireAuth()` first; `prisma.skill_gaps.findMany({ where:{ clerkId:userId }, orderBy:{ createdAt:'desc' }, select:{ id:true, resumeSource:true, jobDescription:true, analysis:true, createdAt:true } })`; return 200 `{ success:true, data:records }` (empty array if none — no 404)
- [x] T018 [US2] Fill test cases in `__tests__/skillgap.test.ts` (14 cases total):
  - POST 401: no session → 401
  - POST 400: FormData with no resume and no resumeText → 400 `{ error:'Missing resume or job description' }`
  - POST 400: FormData with no jobDescription → 400
  - POST 400: PDF file with empty extracted text → 400 fallback message
  - POST 201 (text path): resumeText + jobDescription → MSW returns valid Gemini JSON → 201 with analysis; verify `create` called with `resumeSource:'text'` and `clerkId` from session (not body); verify no `name` field in create call
  - POST 201 (PDF path): resume File + jobDescription → MSW returns valid Gemini JSON → 201 with analysis; verify `create` called with `resumeSource:'pdf'`
  - POST 503 (AI down): MSW returns network error → 503; verify Prisma `create` NOT called
  - POST 503 (bad shape): MSW returns valid JSON but missing `compatibilityScore` → 503; verify Prisma `create` NOT called
  - POST DB failure: AI returns valid JSON, `prisma.skill_gaps.create` throws → expect 500 with no partial save
  - GET 401: no session → 401
  - GET 200 with records: `findMany` returns 2 records → 200 array of 2, ordered by createdAt desc
  - GET 200 empty: `findMany` returns [] → 200 `{ success:true, data:[] }` (NOT 404)
  - GET identity: verify `findMany` called with `{ where:{ clerkId:userId } }` — NOT any body value
  - GET DB failure: `findMany` throws → expect 500

**Checkpoint**: All 14 test cases in skillgap.test.ts pass (12 core + 2 DB-failure cases per M1 fix). POST and GET routes work end-to-end per quickstart.md steps 9–13.

---

## Phase 5: User Story 3 — Data Exclusivity Validation

**Goal**: Confirm that cross-user data access is architecturally impossible through both middleware (layer 1) and auth guard + session-identity (layer 2). No new implementation needed — validated by review and targeted test additions.

**Independent Test**: Two Clerk accounts cannot see each other's data regardless of what request params are sent. Both auth layers active.

- [x] T019 [P] [US3] Review `lib/auth-guard.ts` — confirm `userId` from `auth()` is the sole identity source; add inline JSDoc comment: `// SECURITY: userId is exclusively from Clerk session — never from request input (constitution Principle II)`
- [x] T020 [P] [US3] Add cross-user isolation assertions to `__tests__/career-assessment.test.ts` — mock two different userIds (userA, userB); simulate GET as userA after userB's data exists in mock; assert `findUnique` called with userA's clerkId only
- [x] T021 [P] [US3] Add cross-user isolation assertions to `__tests__/skillgap.test.ts` — mock two different userIds; simulate GET as userA after userB submitted analyses; assert `findMany` called with userA's clerkId only

**Checkpoint**: US3 isolation tests pass. `grep -r "req.body.clerkId\|searchParams.get.*clerk\|params.clerkId" app/api/` returns 0 matches.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup, full test run, and end-to-end quickstart validation.

- [x] T022 [P] Run `grep -r "dbConnect\|mongoose\|mongodb" app/api/career-assessment/ app/api/skillgap/` — confirm 0 matches (old imports fully removed)
- [x] T023 [P] Run `npx vitest run --coverage` — confirm all tests pass and coverage report generated; no test should require live DB or live AI service
- [ ] T024 Run quickstart.md Phase 0 checkpoint (steps 1–4) against local dev server — DB synced, 401 confirmed on both middleware and server-side layers, vitest green
- [ ] T025 Run quickstart.md Phase 1 Stream A checkpoint (steps 5–8) — POST assessment, GET assessment, upsert verification, 404 for new user; record POST response time as SC-001 baseline (target ≤ 5s)
- [ ] T026 Run quickstart.md Phase 1 Stream B checkpoint (steps 9–13) — text submit, PDF submit, image PDF 400, GET list, empty GET; record skill gap POST response time as SC-002 baseline (target ≤ 10s)
- [ ] T027 Run quickstart.md security smoke test (steps 14–15) — cross-user isolation confirmed manually; confirm middleware 401 fires before route handler by checking response headers for Clerk middleware signature

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundation/US0)**: T005→T006 sequential (schema before push); T004/T007/T008/T009/T010 parallel — **phase BLOCKS all user story phases**
- **Phase 3 (US1 — Assessment)**: Depends on Phase 2 completion — can run in parallel with Phase 4
- **Phase 4 (US2 — Skill Gap)**: Depends on Phase 2 completion — can run in parallel with Phase 3
- **Phase 5 (US3 — Exclusivity)**: Depends on Phase 3 + Phase 4 completion
- **Phase 6 (Polish)**: Depends on all phases complete

### User Story Dependencies

- **US0**: No dependencies — pure setup
- **US1**: Depends on US0 — independent of US2
- **US2**: Depends on US0 — independent of US1
- **US3**: Depends on US1 + US2 (adds assertions to existing test files)

### Within Each Phase

- T011 and T015 (test scaffolds) MUST be created before T012–T013 and T016–T017 (implementations)
- T006 (`prisma db push`) MUST run after T005 (`schema.prisma` created)
- T007, T008, T009, T010 can all run in parallel (different new files)
- T014 and T018 (fill test cases) run after implementation tasks are complete

### Parallel Opportunities

```bash
# Phase 1: T001 + T002 + T003 all parallel
npm install @prisma/client pdf-parse            # T001 (parallel)
npm install -D prisma vitest ...                # T002 (parallel)
# create vitest.config.ts                      # T003 (parallel)

# Phase 2:
# T004 (verify proxy.js) — parallel with T005 start
# T005 → T006 sequential (schema first, then push)
# T007 + T008 + T009 + T010 — all parallel after T004
npx prisma generate && npx prisma db push       # T006 (after T005)
# simultaneously:
# create lib/db.ts                              # T007
# create lib/auth-guard.ts                     # T008
# create lib/schemas.ts                        # T009
# create __tests__/foundation.test.ts          # T010

# Phase 3 + Phase 4 fully parallel (different files):
# Stream A (Developer 1):  T011 → T012 → T013 → T014
# Stream B (Developer 2):  T015 → T016 → T017 → T018

# Phase 5: T019 + T020 + T021 all parallel
# Phase 6: T022 + T023 parallel, then T024 → T025 → T026 → T027 sequential
```

---

## Implementation Strategy

### MVP First (US0 + US1 Only)

1. Complete Phase 1 (Setup)
2. Complete Phase 2 (Foundation) — checkpoint passes
3. Complete Phase 3 (US1 — Assessment)
4. **STOP and VALIDATE**: quickstart.md steps 1–8 pass, SC-001 baseline recorded
5. Assessment route is production-ready

### Incremental Delivery

1. Phase 1 + Phase 2 → Foundation ready (middleware + DB + auth guard)
2. Add Phase 3 (US1) → Assessment works end-to-end → ✅ Deploy
3. Add Phase 4 (US2) → Skill gap works end-to-end → ✅ Deploy
4. Phase 5 + Phase 6 → Security validated, full coverage → ✅ Final

### Parallel Team Strategy

**Developer 1** (after Phase 2 checkpoint):
- T011 → T012 → T013 → T014 (Assessment — Stream A)
- Then T019 → T020 (US3 assessment isolation)

**Developer 2** (after Phase 2 checkpoint):
- T015 → T016 → T017 → T018 (Skill Gap — Stream B)
- Then T021 (US3 skillgap isolation)

**Everyone together**: Phase 1, Phase 2, Phase 6

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [USn] label maps task to specific user story for traceability
- Tests are written BEFORE implementation (T011 before T012–T014; T015 before T016–T018)
- `lib/auth-guard.ts`, `lib/db.ts`, `lib/schemas.ts` are all TypeScript (new files — constitution Principle V)
- `app/api/career-assessment/route.js` and `app/api/skillgap/route.js` stay as `.js` (existing files — constitution Principle V)
- `lib/ai-agent.js` is bypassed by the new skillgap route — do not delete until Phase 4 is confirmed working
- `skill_gaps` table has no `name` field — removed as redundant (clerkId identifies the user; H1 fix)
- `proxy.js` already updated with API route protection — T004 is a verification task only
- DB failure test cases added to T014 and T018 (M1 fix — 2 extra cases each)
- Verify `grep` for old imports (T022) before marking Phase 6 complete
