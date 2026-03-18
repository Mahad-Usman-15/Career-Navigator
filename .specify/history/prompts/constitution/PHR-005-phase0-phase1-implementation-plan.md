---
id: PHR-005
title: Phase0 Phase1 Implementation Plan
stage: plan
date: 2026-03-15
surface: claude-code
model: claude-sonnet-4-6
feature: 1-assessment-skillgap-auth
branch: main
user: N/A
command: /sp.plan
labels: [plan, phase-0, phase-1, prisma, supabase, vitest, pdf-parse]
links:
  spec: specs/1-assessment-skillgap-auth/spec.md
  ticket: N/A
  adr: N/A
  pr: N/A
files:
  - specs/1-assessment-skillgap-auth/plan.md
  - specs/1-assessment-skillgap-auth/research.md
  - specs/1-assessment-skillgap-auth/data-model.md
  - specs/1-assessment-skillgap-auth/quickstart.md
  - specs/1-assessment-skillgap-auth/contracts/career-assessment.md
  - specs/1-assessment-skillgap-auth/contracts/skillgap.md
tests:
  - N/A
---

## Prompt

/sp.plan (no additional arguments — generate implementation plan for 1-assessment-skillgap-auth)

## Response snapshot

Generated full Phase 0 + Phase 1 implementation plan with all artifacts.

**Phase 0 (Day 1 — blocking)**:
- New packages: prisma, @prisma/client, pdf-parse, vitest, @vitejs/plugin-react, msw
- New files: lib/db.ts (Prisma singleton), lib/auth-guard.ts (requireAuth), lib/schemas.ts (Zod schemas), prisma/schema.prisma (3 tables), vitest.config.ts

**Phase 1 — Two parallel streams (Days 2–3)**:
- Stream A: Full rewrite of app/api/career-assessment/route.js — auth + Prisma upsert + 404 on missing
- Stream B: Full rewrite of app/api/skillgap/route.js — auth + FormData + pdf-parse + Zod validation + GET handler

Constitution check: All 7 principles pass. No violations.

Key technical decisions from research.md:
- Prisma singleton with globalThis cache (prevents connection exhaustion in serverless)
- requireAuth() throws NextResponse (clean one-liner protection)
- Zod safeParse for AI validation (non-throwing, log before 503)
- pdf-parse with empty-string guard (image-only PDF fallback)
- Vitest + vi.mock + MSW (no live services in CI)

Artifacts generated: plan.md, research.md, data-model.md, quickstart.md, contracts/career-assessment.md, contracts/skillgap.md

## Outcome

- ✅ Impact: Complete implementation blueprint ready — /sp.tasks can now generate the task list
- 🧪 Tests: Test strategy defined in research.md and quickstart.md
- 📁 Files: 6 artifacts in specs/1-assessment-skillgap-auth/
- 🔁 Next prompts: /sp.tasks to generate the ordered task list for implementation
- 🧠 Reflection: setup-plan.ps1 and update-agent-context.ps1 scripts both referenced wrong branch (1-seo-optimization). Used direct paths throughout. Scripts need branch detection fix for main-branch workflows.

## Evaluation notes (flywheel)

- Failure modes observed: Both PS1 scripts hardcoded to wrong branch — setup-plan copied template to wrong dir, update-agent-context parsed wrong plan.md. Mitigated by working directly with correct paths.
- Graders run and results (PASS/FAIL): All constitution gates PASS
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Fix check-prerequisites.ps1 to detect specs/ dir by scanning for spec.md files rather than relying on git branch name
