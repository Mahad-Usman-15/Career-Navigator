---
id: PHR-010
title: Phase2 Phase3 Spec Created
stage: spec
date: 2026-03-16
surface: claude-code
model: claude-sonnet-4-6
feature: 2-guidance-dashboard
branch: main
user: N/A
command: /sp.specify
labels: [spec, guidance, dashboard, webhook, phase2, phase3]
links:
  spec: specs/2-guidance-dashboard/spec.md
  ticket: N/A
  adr: N/A
  pr: N/A
files:
  - specs/2-guidance-dashboard/spec.md
  - specs/2-guidance-dashboard/checklists/requirements.md
tests:
  - N/A
---

## Prompt

/sp.specify Create a comprehensive spec for phase2+3. (main branch, no new branch)

## Response snapshot

Created specs/2-guidance-dashboard/spec.md with 4 user stories, 22 functional requirements, 8 success criteria, 7 assumptions, and an out-of-scope list.

User Stories:
- US1 (P1): Student generates AI career guidance (POST /api/generateguidance)
- US2 (P1): Student views complete career dashboard (/dashboard page + GET /api/dashboard)
- US3 (P2): Student retrieves previously generated guidance (GET /api/generateguidance)
- US4 (P2): New user account pre-provisioned on sign-up (POST /api/webhooks/clerk)

Functional Requirements: FR-F01-F03 (foundation), FR-001-007 (guidance POST), FR-008-011 (guidance GET), FR-012-015 (dashboard API), FR-016-018 (dashboard page), FR-019-022 (webhook)

Success Criteria: SC-001 (guidance <=15s p90), SC-002 (dashboard <=3s p95), SC-003-008 (auth, graceful failure, single-request, idempotent webhook, no live services in tests)

Checklist: 16/16 items pass. Ready for /sp.clarify or /sp.plan.

## Outcome

- ✅ Impact: Complete spec for Phase 2+3 covering all 4 remaining core endpoints + dashboard UI
- ✅ Tests: N/A (spec stage)
- ✅ Files: specs/2-guidance-dashboard/spec.md + checklists/requirements.md
- ✅ Next prompts: /sp.clarify then /sp.plan
- ✅ Reflection: Assessment-prerequisite for guidance and null-section dashboard behavior were the two most important design decisions encoded as assumptions.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Checklist 16/16 PASS
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Run /sp.clarify to surface any hidden ambiguities before planning
