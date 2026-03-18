---
id: PHR-006
title: c1-remediation-agents-sdk-clarification
stage: misc
date: 2026-03-17
surface: claude-code
model: claude-sonnet-4-6
feature: 003-groq-agents-migration
branch: main
user: Techno
command: /sp.analyze follow-up (C1 remediation — user confirmed Option B)
labels: [remediation, constitution, agents-sdk, c1-critical]
links:
  spec: specs/003-groq-agents-migration/spec.md
  ticket: ~
  adr: ~
  pr: ~
files:
  - .specify/memory/constitution.md
  - specs/003-groq-agents-migration/research.md
  - specs/003-groq-agents-migration/plan.md
  - specs/003-groq-agents-migration/tasks.md
  - specs/003-groq-agents-migration/quickstart.md
  - CLAUDE.md
tests:
  - n/a
---

## Prompt

User confirmed: "B" — meaning `@openai/agents` package (Agent/Runner abstraction), not raw `openai` npm package with `chat.completions.create()`. Applying C1 remediation across all affected artifacts.

## Response snapshot

Updated 6 files to replace `openai` npm package references with `@openai/agents`:

- **constitution.md** (v1.1.0 → v1.2.0): Principle III clarified — "OpenAI Agents SDK" now explicitly defined as `@openai/agents` npm package with Agent/Runner abstraction; Tech Stack table updated
- **research.md** D-001: Rewritten — new decision is `@openai/agents` + `openai` (peer dep); implementation pattern updated to show Agent/run() with outputType; note added to verify custom client injection API from installed package docs
- **plan.md**: Technical Context updated (primary dep now `@openai/agents`); Agent Architecture section rewritten to show Agent/run() pattern; research summary table updated
- **tasks.md**: T001 updated (install both packages); T003/T004 updated to describe @openai/agents pattern with instruction to check package docs for custom client injection
- **quickstart.md**: Step 2 install command updated; Step 2 agent creation updated
- **CLAUDE.md**: AI section updated with clarification note

## Outcome

- ✅ Impact: C1 critical issue resolved — all artifacts now consistently use `@openai/agents` terminology and pattern
- 🧪 Tests: n/a
- 📁 Files: 6 files updated
- 🔁 Next prompts: /sp.implement
- 🧠 Reflection: The C1 finding was the highest-value finding from /sp.analyze. If not caught, T003/T004 would have been implemented with the wrong SDK, requiring a complete rewrite mid-implementation.

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results: C1 resolved; HIGH issues (C2, U1, I1) remain for implementer awareness but do not block /sp.implement
- Prompt variant (if applicable): ~
- Next experiment: /sp.implement
