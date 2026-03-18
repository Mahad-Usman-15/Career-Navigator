---
id: PHR-014
title: Analyze And Fix Artifacts
stage: misc
date: 2026-03-16
surface: claude-code
model: claude-sonnet-4-6
feature: 2-guidance-dashboard
branch: main
user: N/A
command: /sp.analyze
labels: [analyze, fix, spec, tasks, consistency, cross-user-isolation]
links:
  spec: specs/2-guidance-dashboard/spec.md
  ticket: N/A
  adr: N/A
  pr: N/A
files:
  - specs/2-guidance-dashboard/spec.md
  - specs/2-guidance-dashboard/tasks.md
tests:
  - N/A
---

## Prompt

/sp.analyze — Also fix all the issues.

## Response snapshot

7 findings identified (2 HIGH, 3 MEDIUM, 2 LOW). All fixed immediately per user instruction.

Findings:
- F1 (HIGH): FR-F01 "one database round-trip" inaccurate — 3 parallel queries via Promise.all, not a single SQL round-trip. Fixed: "parallel queries in a single server request."
- F2 (HIGH): FR-011 cross-user isolation (GET guidance) had no test coverage. Fixed: added T035 cross-user isolation test for GET /api/generateguidance.
- F3 (MEDIUM): Terminology drift — "compatibility score" used for career-path match score in spec (FR-004, US1 body, US1 scenario 1) but data model and contracts use `matchScore`. `compatibilityScore` already taken by skill-gap analysis. Fixed: standardized FR-004, US1 body, US1 scenario 1 to "match score".
- F4 (MEDIUM): T026 cookie forwarding underspecified. Fixed: updated T027 (renumbered) to specify `import { cookies } from 'next/headers'` and `cookies().toString()`.
- F5 (MEDIUM): GET /api/dashboard had no cross-user isolation test. Fixed: added T021.
- F6 (LOW): SC-001/SC-002 performance criteria had zero task coverage. Fixed: added T048 manual timing validation task.
- F7 (LOW): SC-003 used "Unauthorized" for webhook which returns 400 for missing headers. Fixed: updated SC-003 to "Unauthorized (401) or rejected (400)".

Tasks count: 46 → 49 (added T021, T035, T048; renumbered downstream).

## Outcome

- ✅ Impact: All 7 findings resolved; FR coverage 25/25 (100%); SC coverage 8/8 (100%)
- ✅ Tests: 2 new cross-user isolation test tasks added (T021, T035)
- ✅ Files: spec.md (5 edits), tasks.md (full rewrite with renumbering)
- ✅ Next prompts: /sp.implement
- ✅ Reflection: The cross-user isolation gap (F2) was the most important fix — FR-011 explicitly requires it and Phase 0+1 established the pattern; it would have been caught during code review but better caught now.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): 7/7 findings fixed; all 49 task IDs sequential; format valid
- Prompt variant (if applicable): User requested fixes inline with analysis (not separate approval step)
- Next experiment (smallest change to try): Run /sp.implement to begin T001
