---
id: PHR-013
title: Phase2 Phase3 Tasks Generated
stage: tasks
date: 2026-03-16
surface: claude-code
model: claude-sonnet-4-6
feature: 2-guidance-dashboard
branch: main
user: N/A
command: /sp.tasks
labels: [tasks, guidance, dashboard, webhook, vitest, tdd]
links:
  spec: specs/2-guidance-dashboard/spec.md
  ticket: N/A
  adr: N/A
  pr: N/A
files:
  - specs/2-guidance-dashboard/tasks.md
tests:
  - N/A (tasks stage)
---

## Prompt

/sp.tasks (no arguments — generate tasks for specs/2-guidance-dashboard/)

## Response snapshot

Generated specs/2-guidance-dashboard/tasks.md with 46 tasks across 7 phases.

Phase breakdown:
- Phase 1 Setup (T001–T004): install svix, add users model, prisma generate, Supabase SQL
- Phase 2 Foundational (T005–T006): tighten CareerGuidanceSchema .min(3), audit proxy.js
- Phase 3 US1 P1 (T007–T017): 6 POST guidance tests + 5 implementation tasks
- Phase 4 US2 P1 (T018–T030): 4 dashboard API tests + 2 API impl + 7 page impl tasks
- Phase 5 US3 P2 (T031–T034): 3 GET guidance tests + 1 impl task
- Phase 6 US4 P2 (T035–T043): 5 webhook tests + 4 impl tasks
- Phase 7 Polish (T044–T046): npm test, quickstart validation, CLAUDE.md update

Total: 46 tasks, 20 new test cases, 24 parallelizable tasks, 7 source files.
MVP scope: T001–T017 (17 tasks — guidance POST end-to-end).

## Outcome

- ✅ Impact: Fully executable task list — each task specifies exact file path, labels, and ordering
- ✅ Tests: 20 new test cases mapped to specs (SC-007 requires full test suite without live services)
- ✅ Files: specs/2-guidance-dashboard/tasks.md
- ✅ Next prompts: /sp.implement
- ✅ Reflection: US3 (guidance GET) deliberately placed after US1 (guidance POST) since they share the same route.ts file — ordering prevents merge conflicts. US4 (webhook) is independent and can run in parallel with US1/US2 after Phase 1.

## Evaluation notes (flywheel)

- Failure modes observed: SPECIFY_FEATURE env var stale (pointed to 1-seo-optimization); overridden via shell env for script invocation
- Graders run and results (PASS/FAIL): All 46 tasks have checkbox, ID, labels, file paths — format valid
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Run /sp.implement to begin Phase 1 (T001–T004)
