---
id: PHR-001
title: implement-phase2-3-guidance-dashboard
stage: green
date: 2026-03-16
surface: claude-code
model: claude-sonnet-4-6
feature: 2-guidance-dashboard
branch: main
user: Techno
command: /sp.implement
labels: [green, implementation, guidance, dashboard, webhook, vitest]
links:
  spec: specs/2-guidance-dashboard/spec.md
  ticket: n/a
  adr: n/a
  pr: n/a
files:
  - app/api/generateguidance/route.ts
  - app/api/dashboard/route.ts
  - app/api/webhooks/clerk/route.ts
  - app/dashboard/page.jsx
  - lib/schemas.ts
  - prisma/schema.prisma
  - __tests__/generateguidance.test.ts
  - __tests__/dashboard.test.ts
  - __tests__/webhooks-clerk.test.ts
tests:
  - suite: generateguidance.test.ts (T007–T012, T032–T035)
  - suite: dashboard.test.ts (T018–T022)
  - suite: webhooks-clerk.test.ts (T037–T041)
  - total: 55 tests passing (33 Phase 0+1 baseline + 22 Phase 2+3 new)
---

## Prompt

/sp.implement

Execute the implementation plan defined in specs/2-guidance-dashboard/tasks.md.
Implement all Phase 2+3 tasks: guidance generation endpoint, dashboard aggregation API,
Clerk webhook user provisioning, and dashboard server-rendered page.

## Response snapshot

Implemented all 49 tasks across 6 phases:

**Phase 1 (Setup)**: Installed svix, added `users` model to prisma/schema.prisma, ran `npx prisma generate`. Users table created manually in Supabase SQL Editor (prisma db push blocked by PgBouncer Transaction mode).

**Phase 2 (Foundational)**: Tightened `CareerGuidanceSchema` `.min(1)` → `.min(3)`. Verified proxy.js protections.

**Phase 3 (US1 — Guidance POST)**: Wrote 6 tests (T007–T012), implemented `app/api/generateguidance/route.ts` POST handler with Gemini integration, Zod validation, Prisma create.

**Phase 4 (US2 — Dashboard)**: Wrote 5 tests (T018–T022), implemented `app/api/dashboard/route.ts` with Promise.all parallel queries and response shaping. Rewrote `app/dashboard/page.jsx` as server component with Card/Progress/Badge shadcn components, null-state CTAs, cookie forwarding for API call.

**Phase 5 (US3 — Guidance GET)**: Wrote 4 tests (T032–T035), added GET handler to route.ts.

**Phase 6 (US4 — Webhook)**: Wrote 5 tests (T037–T041), implemented `app/api/webhooks/clerk/route.ts` with Svix signature verification and idempotent users.upsert.

**Bugs fixed during test run**:
1. `POST is not a function` — deleted empty `app/api/generateguidance/route.js` stub that shadowed the `.ts` implementation
2. `() => ({...}) is not a constructor` — rewrote webhook test mock using `function` keyword (not arrow) for Vitest class constructor mocking

Final: `npx vitest run` → 55/55 passing.

## Outcome

- ✅ Impact: All 4 Phase 2+3 user stories implemented and tested. All 10 API endpoints now ✅ in CLAUDE.md. Dashboard renders server-side with full career profile data.
- 🧪 Tests: 55 tests passing (6 test files). Phase 0+1 baseline preserved. 22 new tests added.
- 📁 Files: 9 files created/modified. Deleted 1 empty stub (route.js). Added 3 shadcn components (card, progress, badge).
- 🔁 Next prompts: Manual smoke tests (POST /api/generateguidance, /dashboard page with live session). T004 user table SQL (if not done). Jobs service (deferred per CLAUDE.md).
- 🧠 Reflection: Arrow function vs function keyword for Vitest class mocks is a common gotcha. Route file extension conflicts (`.js` shadowing `.ts`) are a Next.js/Vitest resolution trap — always delete old stubs before creating TypeScript replacements.

## Evaluation notes (flywheel)

- The two-layer auth pattern (`proxy.js` + `requireAuth()`) with `instanceof NextResponse` catch is clean and consistent across all routes.
- Server component cookie forwarding for internal API calls (`cookies().toString()`) is the correct pattern for Next.js App Router — avoids client-side fetches on the dashboard.
- Idempotent upsert with `update: {}` is the right Clerk webhook pattern — prevents duplicate user rows on retry without needing distributed locking.
