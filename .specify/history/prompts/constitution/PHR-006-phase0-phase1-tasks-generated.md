---
id: PHR-006
title: Phase0 Phase1 Tasks Generated
stage: tasks
date: 2026-03-15
surface: claude-code
model: claude-sonnet-4-6
feature: 1-assessment-skillgap-auth
branch: main
user: N/A
command: /sp.tasks
labels: [tasks, phase-0, phase-1, vitest, prisma, pdf-parse]
links:
  spec: specs/1-assessment-skillgap-auth/spec.md
  ticket: N/A
  adr: N/A
  pr: N/A
files:
  - specs/1-assessment-skillgap-auth/tasks.md
tests:
  - __tests__/foundation.test.ts
  - __tests__/career-assessment.test.ts
  - __tests__/skillgap.test.ts
---

## Prompt

/sp.tasks (no additional arguments — generate task list from plan + spec for 1-assessment-skillgap-auth)

## Response snapshot

Generated 26 tasks across 6 phases in specs/1-assessment-skillgap-auth/tasks.md.

Phase breakdown:
- Phase 1 Setup: T001–T003 (3 tasks) — package install + vitest config
- Phase 2 Foundation/US0: T004–T009 (6 tasks) — Prisma schema, db push, db.ts, auth-guard.ts, schemas.ts, foundation tests
- Phase 3 US1 Assessment: T010–T013 (4 tasks) — test scaffold + POST rewrite + GET handler + fill tests
- Phase 4 US2 Skill Gap: T014–T017 (4 tasks) — test scaffold + POST rewrite + GET handler + fill tests
- Phase 5 US3 Security: T018–T020 (3 tasks) — auth-guard annotation + isolation assertions
- Phase 6 Polish: T021–T026 (6 tasks) — import cleanup, coverage run, quickstart validation

Key parallel opportunities:
- Phase 2: T006+T007+T008+T009 all parallel (different new files)
- Phase 3 + Phase 4: fully parallel (different files, different developers)
- Phase 5: T018+T019+T020 parallel
- Phase 6: T021+T022 parallel

## Outcome

- ✅ Impact: Fully executable task list — each task has file path, format validated, no vague descriptions
- 🧪 Tests: 21 test cases specified across 3 test files (foundation, career-assessment, skillgap)
- 📁 Files: specs/1-assessment-skillgap-auth/tasks.md
- 🔁 Next prompts: /sp.implement to execute tasks, or begin manually with T001
- 🧠 Reflection: US3 (data exclusivity) mapped cleanly as additions to US1+US2 test files rather than a separate implementation phase — correct because the enforcement is architectural (auth guard), not a separate feature.

## Evaluation notes (flywheel)

- Failure modes observed: check-prerequisites.ps1 referenced wrong branch again — used direct paths
- Graders run and results (PASS/FAIL): All 26 tasks follow checklist format with ID + labels + file paths
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
