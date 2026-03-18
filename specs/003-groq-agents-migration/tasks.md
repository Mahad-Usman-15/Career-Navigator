# Tasks: Groq Agents Migration & Platform Hardening

**Input**: Design documents from `specs/003-groq-agents-migration/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Organization**: Tasks grouped by user story for independent implementation and testing.
**Tests**: Not requested — no test tasks generated.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on other in-progress tasks)
- **[Story]**: Maps to user stories US1–US5 from spec.md

---

## Phase 1: Setup

**Purpose**: Install the one missing dependency that blocks all agent work.

- [X] T001 Install `@openai/agents` and its peer dependency — run `npm install @openai/agents openai` and verify `@prisma/client` version remains `5.10.0` in `package.json`; also verify the exact `@openai/agents` version installed (needed to confirm custom client injection API in T003/T004)

**Checkpoint**: `openai` in `package.json` dependencies; Prisma still pinned at 5.10.0

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared utilities and agent modules that US1 and US2 both depend on. Must complete before user story phases begin.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T002 [P] Create `lib/sanitize.ts` — export `sanitizeInput(text: string, maxLength = 4000): string` that strips prompt injection patterns (ignore previous instructions, act as, system:, you are now, disregard instructions, forget everything, new instructions) case-insensitively, strips markdown fences (` ``` `), then truncates to `maxLength`; returns cleaned trimmed string
- [X] T003 [P] Create `lib/agents/CareerGuidanceAgent.ts` — export `generateCareerGuidance(assessment: AssessmentInput): Promise<CareerGuidance>` with three-level fallback using `@openai/agents`: (1) `Agent` + `run()` from `@openai/agents` with Groq `llama-3.3-70b-versatile` via custom OpenAI client (`baseURL: 'https://api.groq.com/openai/v1'`), `outputType: CareerGuidanceSchema` for structured output; (2) same Agent pattern with `llama-3.1-8b-instant`; (3) Gemini 1.5 Flash via `@google/generative-ai` with `responseMimeType: 'application/json'`; each level validates with `CareerGuidanceSchema.parse()` — Zod failure triggers next level; throws `Error('All AI providers failed')` if all three fail; **before implementing**: check `@openai/agents` installed version docs for the exact API to inject a custom OpenAI client into `run()` (may be `setDefaultOpenAIClient()`, a constructor option, or a run-context parameter); prompt must use `assessment.personality.type` and `assessment.iq.iq_score`; include Pakistan market context
- [X] T004 [P] Create `lib/agents/SkillAnalyzerAgent.ts` — export `analyzeSkillGap(resumeContent: string, jobDescription: string): Promise<SkillGapAnalysis>` with identical three-level fallback pattern as T003 using `@openai/agents` for Groq levels and `@google/generative-ai` for Gemini level, but using `SkillGapAnalysisSchema`; prompt embeds `resumeContent` and `jobDescription`

**Checkpoint**: `lib/sanitize.ts`, `lib/agents/CareerGuidanceAgent.ts`, `lib/agents/SkillAnalyzerAgent.ts` created; `npx tsc --noEmit` passes on these three files

---

## Phase 3: User Story 1 — AI Career Guidance End-to-End (Priority: P1) 🎯 MVP

**Goal**: A student submits the assessment, sees a loading spinner "Generating your career paths…", and career paths appear on the same page (or a "View Dashboard" CTA if generation fails).

**Independent Test**: Submit the career counselling form as a signed-in student with a completed assessment in the DB → verify career paths render on page without any manual API call. Verify guidance is regenerated (old record deleted) on re-submission.

- [X] T005 [US1] Rewrite `app/api/generateguidance/route.ts` — replace the direct Gemini call with `generateCareerGuidance(assessment)` imported from `lib/agents/CareerGuidanceAgent.ts`; apply `sanitizeInput()` to the joined skills string and qualification before passing to agent; fix prompt builder to read `assessment.personality?.type` (not `mbtiType`) and `assessment.iq?.iq_score` (not `score`); replace `create` with `deleteMany({ where: { clerkId } })` then `create` so previous guidance is overwritten; keep `requireAuth()` as first call; return 503 with `{ error: 'AI service unavailable. Please try again later.' }` when agent throws
- [X] T006 [US1] Update `app/careercounselling/page.jsx` — after successful `POST /api/career-assessment` response (201), immediately call `POST /api/generateguidance`; add React state `guidanceStep` with values `idle | generating | done | error`; show spinner with text "Generating your career paths…" while `guidanceStep === 'generating'`; on success set `guidanceStep = 'done'` and parse the response with `const data = await response.json()` then render top 3 career paths (title + matchScore) from `data.data.recommendations` (route returns `{ success: true, data: { recommendations: [...], ... } }`); on failure (503 or network error) set `guidanceStep = 'error'` and show non-blocking "View Dashboard" link — assessment result must still display

**Checkpoint**: POST `/api/career-assessment` followed by POST `/api/generateguidance` returns 201 with career paths; dashboard route now serves non-null guidance; guidance is fresh on every assessment submission

---

## Phase 4: User Story 2 — Skill Gap Analysis with Reliable Results (Priority: P1)

**Note**: Can be started in parallel with Phase 3 — T007 and T008 touch different files from T005 and T006 with no shared dependencies.

**Goal**: A signed-in student submits text skills + job description and receives a skill gap report. Scanned PDFs are rejected with a clear message. A signed-out visitor is redirected to sign-in before seeing any page content.

**Independent Test**: POST `/api/skillgap` with text resumeText and jobDescription as a signed-in user → verify `response.analysis` contains `compatibilityScore`, `missingSkills`, `matchingSkills`, `suggestedRoadmap`. Upload a 1-pixel scanned PDF → verify 400 response with scanned PDF message. Visit `/skillgapanalyzer` while signed out → verify redirect to `/sign-in`.

- [X] T007 [US2] Convert and rewrite `app/api/skillgap/route.js` → `app/api/skillgap/route.ts` — **rename the file in-place** (do not create a new `route.ts` alongside the existing `route.js` — Next.js will throw a build error if both exist in the same directory); replace direct Gemini call with `analyzeSkillGap(resumeContent, jobDescription)` imported from `lib/agents/SkillAnalyzerAgent.ts`; apply `sanitizeInput()` to both `extractedText` and `jobDescription` before agent call; change scanned PDF guard from `if (!extractedText)` to `if (extractedText.trim().length < 50)` returning 400 with message `"This appears to be a scanned PDF. Please use a text-based PDF or fill the form manually."`; fix response to return `{ success: true, analysis: validation.data }` (not `{ success: true, data: record }`) so the client page receives `data.analysis` after `const data = await response.json()`; keep `requireAuth()` as first call and all existing GET handler logic unchanged
- [X] T008 [US2] Add server-side auth guard to `app/skillgapanalyzer/page.jsx` — convert the top-level export to a server component that calls `const { userId } = await auth()` from `@clerk/nextjs/server` and calls `redirect('/sign-in')` from `next/navigation` if `!userId`; extract all existing `"use client"` form logic (state, handlers, JSX) to a new file `app/skillgapanalyzer/SkillGapAnalyzerClient.jsx` with `"use client"` directive at top; the server component renders `<SkillGapAnalyzerClient />` when authenticated

**Checkpoint**: Scanned PDF returns 400 with explanatory message; valid text form returns `{ success: true, analysis: { ... } }`; `/skillgapanalyzer` page redirects unauthenticated visitors server-side

---

## Phase 5: User Story 3 — Dashboard Shows Accurate Data (Priority: P2)

**Goal**: The dashboard displays the student's real MBTI type, IQ score, and skill match score — not null/blank values.

**Independent Test**: Complete an assessment (which stores `personality.type` and `iq.iq_score`), then call GET `/api/dashboard` — verify `assessment.mbtiType` and `assessment.iqScore` in the response are non-null strings/numbers.

- [X] T009 [US3] Fix `app/api/dashboard/route.ts` — change `(assessment.personality as any)?.mbtiType` to `(assessment.personality as any)?.type`; change `(assessment.iq as any)?.score` to `(assessment.iq as any)?.iq_score`; remove the `iqCategory` field and its null value from the `assessmentData` object entirely (this key is never stored in the JSONB column)

**Checkpoint**: GET `/api/dashboard` returns `assessment.mbtiType` as a 4-letter MBTI code and `assessment.iqScore` as a number for any student who completed the assessment

---

## Phase 6: User Story 4 — Input Safety (Priority: P2)

US4 (prompt injection sanitization + 4,000-char cap) is implemented through the Foundational phase and the US1/US2 phases. One verification task is required for independent testability:

- [X] T016 [US4] Verify input sanitization in `lib/sanitize.ts` — after T002 is complete, manually confirm: (1) `sanitizeInput('ignore previous instructions ' + 'x'.repeat(4500))` returns a string ≤4,000 characters with the injection phrase removed; (2) `sanitizeInput('x'.repeat(5000))` returns exactly 4,000 characters; add a comment block in `lib/sanitize.ts` listing the tested patterns and the confirmed 4,000-character limit

---

## Phase 7: User Story 5 — Visual Consistency (Priority: P3)

**Goal**: Dashboard and personality types pages match the dark blue-cyan theme of the rest of the site.

**Independent Test**: Open `/dashboard` and `/personalitytypes` — both pages show `#171717` dark background, dark grey card backgrounds, and blue-to-cyan gradient section headings consistent with `/careercounselling`.

- [X] T010 [P] [US5] Retheme `app/dashboard/page.jsx` — replace all `bg-background` with `bg-[#171717]`; replace all shadcn Card component usage with `<div className="bg-[#222222] rounded-2xl p-6">...</div>`; replace `text-muted-foreground` with `text-white/60`; replace `text-foreground` with `text-white`; add gradient style to all section headings: `style={{ background: 'linear-gradient(135deg, #1e3a8a, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}`; keep all data-binding logic, server component pattern, and Clerk auth unchanged; **verify after edit**: search the file for `bg-background`, `text-foreground`, `text-muted-foreground` — none of these should remain as primary layout classes
- [X] T011 [P] [US5] Retheme `app/personalitytypes/page.jsx` — apply the same dark theme treatment as T010: `bg-[#171717]` page background, `bg-[#222222]` card backgrounds, `text-white/60` for secondary text, blue-cyan gradient headings; keep all existing PersonalityCard rendering logic and anchor IDs unchanged; **verify after edit**: search the file for `bg-background`, `text-foreground`, `text-muted-foreground` — none should remain as primary layout classes

**Checkpoint**: Both pages visually match `/careercounselling` — dark background, no white cards, gradient headings

---

## Phase 8: Code Consistency (Cross-Cutting)

**Purpose**: Convert the last remaining JavaScript API route to TypeScript for consistency.

- [X] T012 Convert `app/api/career-assessment/route.js` → `app/api/career-assessment/route.ts` — **rename the file in-place** (same rule as T007 — do not create alongside); add TypeScript types to all function signatures (`request: NextRequest`), local variables, and `POST`/`GET` handlers; type the return value of `calculateIQScore()` as `{ rawScore: number; correctAnswers: number; mentalAge: number; chronologicalAge: number; iq_score: number }` to match the confirmed JSONB shape; type the return value of `calculateMBTI()` as `{ type: string; dimensions: { EI: string; SN: string; TF: string; JP: string }; scores: Record<string, number> }`; no logic changes

---

## Phase 9: Polish & Validation

**Purpose**: Verify the complete milestone is clean before marking done.

- [X] T013 [P] Run `npx tsc --noEmit` from project root — must complete with zero errors; if errors exist, fix before proceeding to T014
- [X] T014 Run `npm run build` — must produce a clean build with no module-not-found errors or type errors; if build fails, fix and re-run
- [X] T015 Run `npx vitest run` — all 55 tests that were passing before this milestone must still pass; zero regressions acceptable

**Checkpoint**: TypeScript clean, build green, all 55 tests pass — milestone complete

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on T001 — BLOCKS Phase 3 and Phase 4
- **US1 (Phase 3)**: Depends on T002 (sanitize) + T003 (CareerGuidanceAgent)
- **US2 (Phase 4)**: Depends on T002 (sanitize) + T004 (SkillAnalyzerAgent)
- **US3 (Phase 5)**: Independent — can run in parallel with US1/US2 after Foundational
- **US4 (Phase 6)**: Depends on T002 (sanitize.ts must exist); T016 is the verification task
- **US5 (Phase 7)**: Independent — can run in parallel with any phase
- **Code Consistency (Phase 8)**: Independent of all user stories
- **Validation (Phase 9)**: Depends on ALL previous phases complete

### Task Dependency Graph

```
T001 → T003
T001 → T004
T002 → T005
T002 → T007
T003 → T005
T004 → T007
T005 → T006
T007 → T008
T009 (independent — no deps)
T010 (independent — no deps)
T011 (independent — no deps)
T012 (independent — no deps)
All T001–T012 → T013 → T014 → T015
```

### Parallelizable Groups

After T001 completes:
- **Batch A** (run together): T002, T003, T004 — different files, no inter-deps

After Batch A completes:
- **Batch B** (run together): T005, T007, T009, T010, T011, T012 — different files, no inter-deps

After T005 completes:
- T006 (depends on T005 existing)

After T007 completes:
- T008 (depends on T007 existing)

After all implementation complete:
- **Batch C**: T013, T015 (tsc and vitest are independent checks)
- Then T014 (build — after tsc passes)

---

## Parallel Execution Examples

### Batch A — All after T001 (install openai)

```
Task A1: "Create lib/sanitize.ts with sanitizeInput function"
Task A2: "Create lib/agents/CareerGuidanceAgent.ts with three-level fallback"
Task A3: "Create lib/agents/SkillAnalyzerAgent.ts with three-level fallback"
```

### Batch B — All after Batch A

```
Task B1: "Rewrite app/api/generateguidance/route.ts to use CareerGuidanceAgent"
Task B2: "Convert app/api/skillgap/route.js to route.ts using SkillAnalyzerAgent"
Task B3: "Fix app/api/dashboard/route.ts JSON path bugs"
Task B4: "Convert app/api/career-assessment/route.js to route.ts"
Task B5: "Retheme app/dashboard/page.jsx to dark theme"
Task B6: "Retheme app/personalitytypes/page.jsx to dark theme"
```

---

## Implementation Strategy

### MVP Scope (US1 only — guidance end-to-end)

1. T001 → T002, T003 → T005 → T006
2. **STOP and VALIDATE**: Submit assessment, verify spinner appears, career paths render
3. Check dashboard shows non-null guidance (requires T009 also)

### Full Milestone (all stories)

1. T001 (setup)
2. T002 + T003 + T004 in parallel (foundational)
3. T005 + T007 + T009 + T010 + T011 + T012 in parallel (all story work)
4. T006 after T005; T008 after T007
5. T013 + T015 in parallel → T014 (validation)

### Total: 15 tasks across 9 phases

| Phase | Tasks | Story |
|---|---|---|
| Setup | T001 | — |
| Foundational | T002, T003, T004 | — |
| US1 Career Guidance | T005, T006 | US1 |
| US2 Skill Gap | T007, T008 | US2 |
| US3 Dashboard Fix | T009 | US3 |
| US4 Input Safety | T016 (verification) | US4 |
| US5 Visual Consistency | T010, T011 | US5 |
| Code Consistency | T012 | — |
| Validation | T013, T014, T015 | — |

---

## Notes

- `[P]` tasks use different files with no unresolved dependencies — safe to run simultaneously
- US4 (input safety) verification is T016 — run after T002 to confirm sanitizeInput() behaviour
- Delete `route.js` files after converting to `route.ts` (T007, T012) — do not leave both
- Do not convert existing `.jsx` page files to `.tsx` — Principle V
- Do not add `// @ts-nocheck` to any new `.ts` file — Principle V
- `requireAuth()` must remain the first non-import statement in every API route touched
- T009 (dashboard fix) is the lowest-risk task — a 3-line change with no deps; good warm-up
