---
id: PHR-008
title: Second-Pass Analysis Post-Remediation
stage: misc
date: 2026-03-15
surface: claude-code
model: claude-sonnet-4-6
feature: 1-assessment-skillgap-auth
branch: main
user: N/A
command: /sp.analyze
labels: [analyze, spec, plan, tasks, quality-gate, second-pass]
links:
  spec: specs/1-assessment-skillgap-auth/spec.md
  ticket: N/A
  adr: N/A
  pr: N/A
files:
  - specs/1-assessment-skillgap-auth/spec.md
  - specs/1-assessment-skillgap-auth/plan.md
  - specs/1-assessment-skillgap-auth/tasks.md
  - .specify/memory/constitution.md
tests:
  - N/A
---

## Prompt

/sp.analyze (second pass — post-remediation re-analysis after all 8 PHR-007 findings were resolved)

## Response snapshot

Read-only re-analysis of spec.md + plan.md + tasks.md against constitution.md. All 8 prior findings (H1, H2, M1, M2, M3, M4, L1, L2/L3) confirmed resolved. Found 4 new findings (0 critical, 0 high, 1 medium, 3 low).

Key findings:
- C1 (MEDIUM): `requireAuth()` throw pattern — route handler catch blocks must explicitly check `instanceof NextResponse` before generic 500 handler, or auth 401s become 500s
- C2 (LOW): Constitution API Route Checklist says `auth()` first; tasks use `requireAuth()` wrapper — spirit-compliant but letter-deviates; needs constitution PATCH note
- C3 (LOW): MSW installed without version pinning — MSW v2 API is completely different from v1; should specify `msw@2`
- F1 (LOW): MBTI tie-break undocumented — `calculateMBTI` uses `>` (ties → first letter E/S/T/J) but this is never written down

100% requirement coverage (21 FRs + 8 SCs = 29 requirements, all with ≥1 task). 27 tasks, 0 unmapped. 0 constitution violations. Safe to proceed to /sp.implement after addressing C1.

## Outcome

- ✅ Impact: Quality gate passed — no blockers, all prior remediation confirmed effective, 1 new medium finding (catch-block pattern) requires attention before T012/T016
- 🧪 Tests: N/A — read-only analysis
- 📁 Files: Read only — spec.md, plan.md, tasks.md, constitution.md
- 🔁 Next prompts: Address C1 catch-block pattern note in T012/T016, specify msw@2 in T002, then /sp.implement
- 🧠 Reflection: The `requireAuth()` throw-vs-return pattern (C1) is a Next.js App Router footgun — throwing a NextResponse works only if the catch block explicitly re-returns it. This is easy to get wrong and would cause all auth failures to become 500s. Worth documenting before implementation begins.

## Evaluation notes (flywheel)

- Failure modes observed: create-phr.sh not found — used native Write tool with template
- Graders run and results (PASS/FAIL): 4 findings, all validated against spec/plan/tasks text
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Address C1 before implement, or note it explicitly in T012/T016 task description
