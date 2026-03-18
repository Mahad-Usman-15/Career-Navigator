---
id: PHR-011
title: Phase2 Phase3 Spec Clarified
stage: spec
date: 2026-03-16
surface: claude-code
model: claude-sonnet-4-6
feature: 2-guidance-dashboard
branch: main
user: N/A
command: /sp.clarify
labels: [clarify, spec, guidance, dashboard, webhook, users-table]
links:
  spec: specs/2-guidance-dashboard/spec.md
  ticket: N/A
  adr: N/A
  pr: N/A
files:
  - specs/2-guidance-dashboard/spec.md
tests:
  - N/A
---

## Prompt

/sp.clarify (no arguments — clarify specs/2-guidance-dashboard/spec.md)

## Response snapshot

4 questions asked and answered. All critical ambiguities resolved.

Q1: Webhook user record table → A: New dedicated `users` table (clerkId, name, email, createdAt). Separate from career_assessments.
Q2: Guidance DB write failure → A: Return 500, guidance lost, student retries.
Q3: Dashboard partial failure → A: Return 500 for entire dashboard — all or nothing.
Q4: Guidance re-generation → A: Freely allowed — each POST creates new record, GET/dashboard shows most recent.

Sections touched: Key Entities (added User entity), FR-005 (added FR-005b), FR-014 (added FR-014b), FR-020, Assumptions (updated #2), Edge Cases (resolved 2), Clarifications section created.

## Outcome

- ✅ Impact: 4 architectural decisions locked — users table, DB failure behavior, dashboard failure mode, re-generation policy
- ✅ Tests: N/A (spec stage)
- ✅ Files: specs/2-guidance-dashboard/spec.md updated
- ✅ Next prompts: /sp.plan
- ✅ Reflection: The users table decision (Q1) is the most architecturally significant — it adds a 4th table to the schema and affects the webhook implementation entirely.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): All 4 clarifications validated against spec sections
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Proceed directly to /sp.plan
