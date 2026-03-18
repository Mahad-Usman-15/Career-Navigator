---
id: PHR-004
title: tasks-groq-agents-migration
stage: tasks
date: 2026-03-17
surface: claude-code
model: claude-sonnet-4-6
feature: 003-groq-agents-migration
branch: main
user: Techno
command: /sp.tasks
labels: [tasks, ai-agents, groq, fallback-chain, dashboard-fix, skill-gap, ui-retheme]
links:
  spec: specs/003-groq-agents-migration/spec.md
  ticket: ~
  adr: ~
  pr: ~
files:
  - specs/003-groq-agents-migration/tasks.md
tests:
  - n/a (tasks stage — no tests generated; not requested in spec)
---

## Prompt

/sp.tasks (no arguments — run against 003-groq-agents-migration plan/spec)

## Response snapshot

Generated `specs/003-groq-agents-migration/tasks.md` with 15 tasks across 9 phases:

- **Phase 1 (Setup)**: T001 — install openai package
- **Phase 2 (Foundational)**: T002 sanitize.ts, T003 CareerGuidanceAgent.ts, T004 SkillAnalyzerAgent.ts — all parallelizable after T001
- **Phase 3 (US1)**: T005 rewrite generateguidance route, T006 careercounselling page guidance trigger
- **Phase 4 (US2)**: T007 convert skillgap route.js→ts + agent swap, T008 auth guard on skillgapanalyzer page
- **Phase 5 (US3)**: T009 fix dashboard route JSON paths (3-line change, no deps)
- **Phase 6 (US4)**: No tasks — input safety is cross-cutting, implemented via T002+T005+T007
- **Phase 7 (US5)**: T010+T011 parallel retheme of dashboard and personalitytypes pages
- **Phase 8 (Code Consistency)**: T012 convert career-assessment route.js→ts
- **Phase 9 (Validation)**: T013 tsc, T014 build, T015 vitest

Key parallel opportunity: after T001, Batch A (T002+T003+T004) runs fully parallel. After Batch A, Batch B (T005+T007+T009+T010+T011+T012) runs fully parallel.

## Outcome

- ✅ Impact: 15 immediately-executable tasks; MVP scope = T001→T002+T003→T005→T006+T009
- 🧪 Tests: not generated (not requested in spec)
- 📁 Files: specs/003-groq-agents-migration/tasks.md
- 🔁 Next prompts: /sp.implement
- 🧠 Reflection: US4 (input safety) having zero dedicated tasks is correct — it is a cross-cutting concern woven into the Foundational phase (sanitize.ts) and applied within US1/US2 route rewrites. This keeps the task count lean without losing traceability.

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): format check — all 15 tasks have checkbox + ID + description with file path
- Prompt variant (if applicable): ~
- Next experiment (smallest change to try): /sp.implement to execute tasks in dependency order
