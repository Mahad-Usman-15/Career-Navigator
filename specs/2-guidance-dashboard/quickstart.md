# Quickstart: Career Guidance, Dashboard & User Provisioning

**Feature**: 2-guidance-dashboard | **Date**: 2026-03-16

---

## Prerequisites

Phase 0+1 must be complete:
- `lib/db.ts`, `lib/auth-guard.ts`, `lib/schemas.ts` all exist
- `prisma/schema.prisma` has `career_assessments`, `career_guidance`, `skill_gaps` models
- All 33 Phase 0+1 tests pass (`npm test`)
- Signed-in Clerk session available for manual testing

---

## Step 1 — Install new dependency

```bash
npm install svix
```

Only one new package is needed for Phase 2+3. All other dependencies (`@google/generative-ai`, `@prisma/client`, `@clerk/nextjs`) are already installed.

---

## Step 2 — Add `users` model to Prisma schema

Add to `prisma/schema.prisma`:

```prisma
model users {
  id        String   @id @default(cuid())
  clerkId   String   @unique
  name      String   @default("")
  email     String   @default("")
  createdAt DateTime @default(now())

  @@index([clerkId])
}
```

Then regenerate the Prisma client:

```bash
npx prisma generate
```

**Do NOT run `prisma db push`** — PgBouncer Transaction mode blocks DDL. Create the table manually in Supabase.

---

## Step 3 — Create `users` table in Supabase

1. Open Supabase dashboard → SQL Editor
2. Run:

```sql
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  "clerkId" TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS users_clerk_id_idx ON users("clerkId");
```

3. Verify: Table Editor should show `users` table with 5 columns.

---

## Step 4 — Add `CLERK_WEBHOOK_SECRET` to environment

1. Open Clerk dashboard → Webhooks → Add endpoint
2. URL: `https://<your-domain>/api/webhooks/clerk` (or ngrok URL for local testing)
3. Select event: `user.created`
4. Copy the signing secret
5. Add to `.env.local`:
```
CLERK_WEBHOOK_SECRET=whsec_...
```
6. Add the same to Vercel environment variables when deploying.

---

## Step 5 — Implement routes

Order follows Constitution VII (Progressive Feature Delivery):

1. `app/api/generateguidance/route.ts` — POST + GET
2. `app/api/dashboard/route.ts` — GET
3. `app/api/webhooks/clerk/route.ts` — POST
4. `app/dashboard/page.tsx` — server component UI

---

## Step 6 — Run tests

```bash
npm test
```

Phase 2+3 tests should pass alongside the 33 existing Phase 0+1 tests. No live DB or AI required — all isolated with `vi.mock` and MSW.

---

## Manual Smoke Tests

### Test guidance generation
```bash
# With a signed-in session (browser devtools → copy cookie)
curl -X POST http://localhost:3000/api/generateguidance \
  -H "Cookie: __session=<your-clerk-session-cookie>"
```

Expected: 201 with `{ guidance: { recommendations: [...], overallTimeline: {...} } }`

### Test dashboard aggregation
```bash
curl http://localhost:3000/api/dashboard \
  -H "Cookie: __session=<your-clerk-session-cookie>"
```

Expected: 200 with `{ assessment: {...}, guidance: {...}, skillGap: {...} }`
(Some sections may be `null` if not yet generated)

### Test dashboard page
1. Navigate to `http://localhost:3000/dashboard` while signed in
2. Expected: Server-rendered page with all sections populated
3. Navigate while signed out → should redirect to `/sign-in`

### Test webhook (local)
```bash
# Install ngrok if needed: npm install -g ngrok
ngrok http 3000
# Copy the ngrok URL to Clerk webhook endpoint
# Then trigger a test event from Clerk dashboard → Webhooks → Send test event
```

Expected: Supabase `users` table gets a new row; re-sending same event = no duplicate row.

---

## Verify Checklist

- [ ] `npm install svix` completed without errors
- [ ] `npx prisma generate` completed — `users` model visible in Prisma client types
- [ ] `users` table exists in Supabase with correct columns
- [ ] `CLERK_WEBHOOK_SECRET` set in `.env.local`
- [ ] `npm test` passes (all tests including new Phase 2+3 tests)
- [ ] `POST /api/generateguidance` returns 201 with valid recommendations
- [ ] `GET /api/generateguidance` returns 200 with stored guidance
- [ ] `GET /api/dashboard` returns 200 with aggregated data
- [ ] `/dashboard` page renders without client-side loading spinners
- [ ] `/dashboard` redirects unauthenticated users to `/sign-in`
- [ ] Webhook creates user record on sign-up; duplicate event = no duplicate row
