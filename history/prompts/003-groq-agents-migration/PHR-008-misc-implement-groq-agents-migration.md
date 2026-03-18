---
id: PHR-008
title: implement-groq-agents-migration
stage: misc
date: 2026-03-17
surface: claude-code
model: claude-sonnet-4-6
feature: 003-groq-agents-migration
branch: main
user: Techno
command: /sp.implement also convert /api/careerassessment to ts for ensuring consistency.
labels: [implement, groq, agents, migration, typescript, all-tasks]
links:
  spec: specs/003-groq-agents-migration/spec.md
  ticket: ~
  adr: ~
  pr: ~
files:
  - lib/sanitize.ts
  - lib/agents/CareerGuidanceAgent.ts
  - lib/agents/SkillAnalyzerAgent.ts
  - app/api/generateguidance/route.ts
  - app/api/skillgap/route.ts
  - app/api/career-assessment/route.ts
  - app/api/dashboard/route.ts
  - app/careercounselling/page.jsx
  - app/skillgapanalyzer/page.jsx
  - app/skillgapanalyzer/SkillGapAnalyzerClient.jsx
  - app/dashboard/page.jsx
  - app/personalitytypes/page.jsx
  - __tests__/dashboard.test.ts
  - __tests__/generateguidance.test.ts
  - __tests__/skillgap.test.ts
tests:
  - npx tsc --noEmit → 0 errors
  - npm run build → clean build (18 routes)
  - npx vitest run → 55/55 pass
---

## Prompt

User: `/sp.implement also convert /api/careerassessment to ts for ensuring consistency.`
Execute all 16 tasks from tasks.md for feature 003-groq-agents-migration. Also convert /api/career-assessment/route.js to TypeScript.

## Response snapshot

Implemented all 16 tasks across 9 phases. Key discoveries and fixes during implementation:

**Phase 2 (T002–T004) — Foundational:**
- `lib/sanitize.ts`: exports `sanitizeInput(text, maxLength=4000)` stripping 8 injection patterns + markdown fences
- `lib/agents/CareerGuidanceAgent.ts`: 3-level fallback (Groq llama-3.3-70b → llama-3.1-8b → Gemini 1.5 Flash) using `Runner({ modelProvider: new OpenAIProvider({ openAIClient: groqClient }) })`
- `lib/agents/SkillAnalyzerAgent.ts`: identical fallback pattern with `SkillGapAnalysisSchema`
- Discovery: `modelProvider` must be passed via `new Runner({ modelProvider })` constructor — NOT via `run()` options (type error); resolved by checking `@openai/agents-core` run.d.ts

**Phase 3 (T005–T006) — US1 Career Guidance:**
- `app/api/generateguidance/route.ts`: agent swap, `deleteMany+create` for regeneration, fixed JSON paths (`personality.type`, `iq.iq_score`), response now `{ success: true, data: { recommendations, overallTimeline } }`
- `app/careercounselling/page.jsx`: added `guidanceStep` state (idle/generating/done/error), auto-trigger after assessment save, spinner UI, career paths display, "View Dashboard" fallback CTA

**Phase 4 (T007–T008) — US2 Skill Gap:**
- `app/api/skillgap/route.ts`: converted from JS, agent swap, scanned PDF guard (`< 50 chars`), response key fixed to `{ success: true, analysis }`, sanitizeInput applied
- Discovery: pdf-parse v2.4.5 API completely changed — no default export; now `new PDFParse({ data: buffer }).getText()` → `TextResult.text`; fixed in route
- `app/skillgapanalyzer/page.jsx` + `SkillGapAnalyzerClient.jsx`: server component auth guard with `auth()` + `redirect('/sign-in')`, client form extracted to separate file

**Phase 5 (T009) — US3 Dashboard:**
- `app/api/dashboard/route.ts`: `personality?.mbtiType` → `personality?.type`, `iq?.score` → `iq?.iq_score`, removed `iqCategory` field

**Phase 7 (T010–T011) — US5 Visual:**
- Dashboard: replaced shadcn Cards with `bg-[#222222] rounded-2xl p-6` divs, inline gradient progress bars, gradient headings
- PersonalityTypes: replaced `page-container`/`gradient-text` CSS classes with explicit `#171717` background and gradient heading styles

**Phase 8 (T012) — Code Consistency:**
- `app/api/career-assessment/route.ts`: full TypeScript conversion, typed `calculateIQScore()` return as `{ rawScore, correctAnswers, mentalAge, chronologicalAge, iq_score }`, typed `calculateMBTI()` return, `NextRequest`/`NextResponse` types on handlers

**Phase 9 — Validation:**
- tsc: 0 errors (after fixing `modelProvider` in agents, pdf-parse import)
- Build: clean, 18 routes
- Tests: 3 test files needed updates (mock data field name changes for dashboard, agent mocks replacing Gemini MSW mocks, PDFParse constructor mock using `vi.hoisted`)

## Outcome

- ✅ Impact: All 16 tasks complete. Full milestone 3 implemented — AI agent abstraction with 3-level fallback, dashboard bugs fixed, input sanitization, scanned PDF guard, server-side auth guard, visual consistency, TypeScript consistency
- 🧪 Tests: 55/55 passing — 0 regressions; 3 test files updated to use agent mocks
- 📁 Files: 15 files created/modified
- 🔁 Next prompts: manual verification (submit assessment → spinner → career paths), deploy to Vercel
- 🧠 Reflection: Two significant API discoveries: (1) `@openai/agents` `run()` does NOT accept `modelProvider` in options — must use `new Runner({ modelProvider })` constructor instead; (2) pdf-parse v2.4.5 completely changed API from default function to `PDFParse` class with `new PDFParse({ data }).getText()`. Both would have caused hard-to-diagnose runtime errors.

## Evaluation notes (flywheel)

- Failure modes observed: SDK API mismatch (modelProvider not in run options), pdf-parse v2 API change
- Graders run and results: tsc ✅, build ✅, vitest 55/55 ✅
- Prompt variant (if applicable): ~
- Next experiment: manual end-to-end test in browser
