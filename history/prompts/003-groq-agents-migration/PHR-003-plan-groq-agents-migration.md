---
id: PHR-003
title: plan-groq-agents-migration
stage: plan
date: 2026-03-17
surface: claude-code
model: claude-sonnet-4-6
feature: 003-groq-agents-migration
branch: main
user: Techno
command: /sp.plan
labels: [plan, ai-agents, groq, fallback-chain, dashboard-fix, auth-guard, ui-retheme]
links:
  spec: specs/003-groq-agents-migration/spec.md
  ticket: ~
  adr: ~
  pr: ~
files:
  - specs/003-groq-agents-migration/plan.md
  - specs/003-groq-agents-migration/research.md
  - specs/003-groq-agents-migration/data-model.md
  - specs/003-groq-agents-migration/quickstart.md
  - specs/003-groq-agents-migration/contracts/generateguidance.md
  - specs/003-groq-agents-migration/contracts/skillgap.md
tests:
  - n/a (plan stage — no tests run)
---

## Prompt

/sp.plan (no arguments — run against 003-groq-agents-migration spec)

## Response snapshot

Generated full implementation plan for Milestone 3. Key research decisions:

- OpenAI SDK v4+ with baseURL override for Groq — `openai` package not yet installed
- Three-level fallback: llama-3.3-70b → llama-3.1-8b → Gemini; Zod failure triggers next level
- Dashboard bug root-cause confirmed: `personality.mbtiType` → `personality.type`, `iq.score` → `iq.iq_score`
- Skill gap response key bug confirmed: route returns `data.record`, client expects `analysis` key
- Guidance regeneration via deleteMany + create (avoids schema migration)
- Auth guard: server component wrapper + extracted SkillGapAnalyzerClient.jsx

Artifacts written:
- `plan.md` — full implementation plan with constitution check (all gates pass)
- `research.md` — 9 research decisions
- `data-model.md` — no schema changes; JSONB field inventory and bug fix table
- `quickstart.md` — step-by-step implementation guide in correct dependency order
- `contracts/generateguidance.md` — request/response contract with behavior change notes
- `contracts/skillgap.md` — request/response contract with scanned PDF guard and response fix

CLAUDE.md updated by agent context script.

## Outcome

- ✅ Impact: Plan complete — 15 tasks in dependency order; ready for /sp.tasks
- 🧪 Tests: n/a (plan stage)
- 📁 Files: 6 new artifacts in specs/003-groq-agents-migration/
- 🔁 Next prompts: /sp.tasks
- 🧠 Reflection: The data-model research was the most valuable — confirmed the exact wrong JSON path keys by reading the actual route.js source, not guessing. The response key bug in skillgap (data vs analysis) would have been invisible until manual testing.

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): constitution check — all 7 gates pass
- Prompt variant (if applicable): ~
- Next experiment (smallest change to try): run /sp.tasks immediately
