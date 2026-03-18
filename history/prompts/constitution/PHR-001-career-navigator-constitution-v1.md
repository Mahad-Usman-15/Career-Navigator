---
id: PHR-001
title: Career Navigator Constitution v1.0.0
stage: constitution
date: 2026-03-13
surface: claude-code
model: claude-sonnet-4-6
feature: N/A
branch: main
user: N/A
command: /sp.constitution
labels: [constitution, governance, security, architecture]
links:
  spec: N/A
  ticket: N/A
  adr: N/A
  pr: N/A
files:
  - .specify/memory/constitution.md
tests:
  - N/A
---

## Prompt

Based on the Claude.md and Readme.md Create comprehensive constitution for the project.

## Response snapshot

Created Career Navigator Constitution v1.0.0 at `.specify/memory/constitution.md`.

The constitution defines 7 core principles derived from CLAUDE.md and README.md:
1. Security-First — two-layer auth (Clerk middleware + server-side auth()) mandatory
2. Session-Driven Identity — userId always from auth() session, never from request input
3. AI Reliability & Structured Responses — JSON-mode AI calls, validated before DB write
4. Data Privacy & Minimal Storage — no raw PDF binary in DB, text extraction only
5. Language Consistency — existing JS/JSX stays, new files in TS/TSX
6. Lean Components & YAGNI — only 7 baseline components, shadcn via CLI when needed
7. Progressive Feature Delivery — strict build priority order; deferred jobs feature blocked until core is done

Also includes: Tech Stack Constraints table, Development Workflow with API Route Checklist, Dashboard requirements, Prisma guidelines, Code Review Gates, and full Governance section with amendment procedure and compliance review process.

## Outcome

- ✅ Impact: Project now has a formal constitution governing all development decisions for Career Navigator
- 🧪 Tests: N/A — documentation artifact
- 📁 Files: .specify/memory/constitution.md (written), .specify/history/prompts/constitution/PHR-001-career-navigator-constitution-v1.md (this file)
- 🔁 Next prompts: /sp.specify to create feature specs that reference this constitution; /sp.plan to generate plans with Constitution Check gates
- 🧠 Reflection: Constitution derived entirely from existing CLAUDE.md and README.md — no ambiguity requiring user clarification. Security and identity principles marked NON-NEGOTIABLE given the target audience (students in Pakistan on shared devices) and horizontal privilege escalation risk.

## Evaluation notes (flywheel)

- Failure modes observed: None — template was fully unpopulated (all placeholders), clean first population
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Add a PATCH version bump when any spec or plan references a principle by name incorrectly
