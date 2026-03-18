---
id: PHR-012
title: Phase2 Phase3 Plan Created
stage: plan
date: 2026-03-16
surface: claude-code
model: claude-sonnet-4-6
feature: 2-guidance-dashboard
branch: main
user: N/A
command: /sp.plan
labels: [plan, guidance, dashboard, webhook, users-table, svix]
links:
  spec: specs/2-guidance-dashboard/spec.md
  ticket: N/A
  adr: N/A
  pr: N/A
files:
  - specs/2-guidance-dashboard/plan.md
  - specs/2-guidance-dashboard/research.md
  - specs/2-guidance-dashboard/data-model.md
  - specs/2-guidance-dashboard/quickstart.md
  - specs/2-guidance-dashboard/contracts/generateguidance.md
  - specs/2-guidance-dashboard/contracts/dashboard.md
  - specs/2-guidance-dashboard/contracts/webhooks-clerk.md
tests:
  - N/A (plan stage)
---

## Prompt

/sp.plan (no arguments — plan specs/2-guidance-dashboard/spec.md)

## Response snapshot

All Phase 0+1 plan artifacts created for 2-guidance-dashboard.

**research.md**: 8 research decisions — Gemini prompt design (Pakistan market context), assessmentSnapshot pattern, Promise.all dashboard aggregation, Svix webhook verification, upsert idempotency, server component dashboard page, users table manual SQL, svix as only new package.

**data-model.md**: Full entity reference for all 4 tables — career_assessments, career_guidance, skill_gaps (existing, unchanged), users (new). Dashboard read model typed. CareerGuidanceSchema tightening noted (.min(1) → .min(3)). Manual Supabase SQL for users table.

**contracts/**: 3 endpoint contracts:
- generateguidance.md: POST (201/400/401/503/500) + GET (200/401/404) with full handler logic
- dashboard.md: GET (200/401/500) with Promise.all pattern; null sections; pre-shaped response
- webhooks-clerk.md: POST (200/401/400/500) with Svix verification, upsert idempotency, proxy.js exclusion note

**quickstart.md**: Step-by-step from install → schema → Supabase SQL → env vars → implement → test → manual smoke tests + verify checklist.

**plan.md**: Constitution check (all 7 principles pass), source layout, Phase 0/1 decision tables, 3-day execution order (Stream A: guidance, Stream B: dashboard + webhook, Stream D: page), risk & mitigations table.

## Outcome

- ✅ Impact: Complete implementation plan for Phase 2+3 — all 4 endpoints + dashboard UI fully designed
- ✅ Tests: N/A (plan stage)
- ✅ Files: 7 artifacts created under specs/2-guidance-dashboard/
- ✅ Next prompts: /sp.tasks
- ✅ Reflection: The webhook route being excluded from requireAuth() + proxy.js is the most error-prone gotcha — documented in both research.md and the contract. The Promise.all all-or-nothing pattern for dashboard is the key architectural decision that keeps FR-014b clean.

## Evaluation notes (flywheel)

- Failure modes observed: agent context script could not auto-detect feature dir (script looks for stale feature env); skipped non-blocking
- Graders run and results (PASS/FAIL): Constitution check 7/7 PASS; all NEEDS CLARIFICATION resolved
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Run /sp.tasks to generate tasks.md then proceed to implementation
