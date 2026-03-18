---
id: PHR-002
title: Phase 1 Assessment Skillgap Auth Spec
stage: spec
date: 2026-03-15
surface: claude-code
model: claude-sonnet-4-6
feature: 1-assessment-skillgap-auth
branch: main
user: N/A
command: /sp.specify
labels: [spec, phase-1, assessment, skillgap, auth, supabase-migration]
links:
  spec: .specify/specs/1-assessment-skillgap-auth/spec.md
  ticket: N/A
  adr: N/A
  pr: N/A
files:
  - .specify/specs/1-assessment-skillgap-auth/spec.md
  - .specify/specs/1-assessment-skillgap-auth/checklists/requirements.md
tests:
  - N/A
---

## Prompt

based on phase 1 create specification without creating any new branch work on main branch.

## Response snapshot

Created feature spec `1-assessment-skillgap-auth` at `.specify/specs/1-assessment-skillgap-auth/spec.md` on the `main` branch (no new branch created per user instruction).

Phase 1 covers two parallel streams:
- Stream A: Fix POST/GET `/api/career-assessment` — add auth guard, migrate from MongoDB/Mongoose to Supabase/Prisma, fix identity sourcing from session
- Stream B: Fix POST `/api/skillgap` + add GET `/api/skillgap` — add auth guard, switch to FormData+PDF extraction, migrate to Supabase/Prisma

Spec defines 3 user stories (all P1):
1. Student submits career assessment securely — 7 acceptance scenarios
2. Student uploads resume for skill gap analysis — 6 acceptance scenarios + edge cases
3. Student's data is exclusively theirs — security isolation guarantee

16 functional requirements (FR-001 to FR-016), 2 key entities, 6 success criteria, explicit assumptions and out-of-scope boundaries.

Validation checklist: all items pass. No NEEDS CLARIFICATION markers. Ready for `/sp.plan`.

## Outcome

- ✅ Impact: Phase 1 has a complete, validated, implementation-ready specification
- 🧪 Tests: N/A — specification artifact
- 📁 Files: .specify/specs/1-assessment-skillgap-auth/spec.md, .specify/specs/1-assessment-skillgap-auth/checklists/requirements.md
- 🔁 Next prompts: /sp.plan to generate implementation plan with design artifacts
- 🧠 Reflection: Framing a migration/security-fix task as user-facing outcomes worked well — all 16 FRs map directly to testable acceptance scenarios without leaking implementation details.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): All checklist items PASS
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Run /sp.clarify to stress-test the upsert assumption (one assessment per user) before planning
