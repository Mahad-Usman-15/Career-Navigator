---
id: PHR-001
title: groq-agents-migration-spec
stage: spec
date: 2026-03-17
surface: claude-code
model: claude-sonnet-4-6
feature: 003-groq-agents-migration
branch: main
user: Techno
command: /sp.specify
labels: [spec, ai-agents, platform-hardening, dashboard-fix, input-safety, ui-consistency]
links:
  spec: specs/003-groq-agents-migration/spec.md
  ticket: ~
  adr: ~
  pr: ~
files:
  - specs/003-groq-agents-migration/spec.md
  - specs/003-groq-agents-migration/checklists/requirements.md
tests:
  - n/a (spec stage — no tests run)
---

## Prompt

Create a comprehensive spec for the goal, constraints, success criteria, edge cases and target audience.

Context: Milestone 3 of the Career Navigator platform. The milestone goals are:
1. Replace direct Gemini calls with a three-level AI fallback chain (Groq llama-3.3-70b → llama-3.1-8b → Gemini 1.5 Flash) via the OpenAI Agents SDK
2. Wire the missing client flows — career guidance is never triggered from the frontend
3. Fix the dashboard — all cards show null due to wrong JSON path keys
4. Harden inputs — sanitize prompt injection, cap field lengths
5. Visual consistency — dashboard and personality types pages don't match the dark theme

## Response snapshot

Wrote `specs/003-groq-agents-migration/spec.md` with:
- 5 prioritised user stories (P1: guidance end-to-end, P1: skill gap reliability, P2: dashboard accuracy, P2: input safety, P3: visual consistency)
- 8 edge cases covering scanned PDFs, all providers failing, prompt injection, oversized inputs, unauthenticated access
- 17 functional requirements across 6 areas (AI reliability, dashboard data, input safety, access control, scanned PDF handling, visual consistency)
- 8 measurable, technology-agnostic success criteria
- 7 explicit assumptions (including 4,000-char cap, 50-char scanned PDF threshold, auto-trigger guidance)
- Clear out-of-scope section (jobs service, CMS for hardcoded data, adversarial protection)

Checklist created at `checklists/requirements.md` — all 16 items pass.

## Outcome

- ✅ Impact: Spec ready for /sp.plan — all user flows, requirements, and success criteria defined
- 🧪 Tests: n/a (spec stage)
- 📁 Files: specs/003-groq-agents-migration/spec.md, checklists/requirements.md
- 🔁 Next prompts: /sp.plan, /sp.clarify (optional — no clarification items remain)
- 🧠 Reflection: Spec correctly avoids all implementation details (no mention of OpenAI SDK, Groq, Gemini, TypeScript, Prisma). Business-readable throughout. All five milestone goals mapped to user stories.

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): checklist validation — all 16 items PASS
- Prompt variant (if applicable): ~
- Next experiment (smallest change to try): run /sp.clarify to probe whether "auto-trigger vs CTA button" for guidance needs stakeholder confirmation
