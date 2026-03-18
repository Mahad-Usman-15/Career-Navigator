# Research: Career Guidance, Dashboard & User Provisioning

**Feature**: 2-guidance-dashboard | **Date**: 2026-03-16

---

## 1. Career Guidance — Gemini Prompt Design

**Decision**: Single structured prompt with explicit Pakistan market context, requesting JSON-mode output

**Rationale**: Gemini 1.5 Flash with `responseMimeType: "application/json"` already proven in skill-gap route. Reuse the same calling pattern. The prompt must explicitly request Pakistan-specific market outlook (constitution Assumption #5) — not a user input, baked into the system prompt.

**Prompt structure**:
```ts
const prompt = `You are a career counsellor specialising in the Pakistani job market.

A student has completed their career assessment with the following profile:
- MBTI personality type: ${assessment.personality.mbtiType}
- IQ score: ${assessment.iq.score} (${assessment.iq.category})
- Highest qualification: ${assessment.qualification}
- Skills: ${assessment.skills.join(', ')}

Generate 3 to 5 career path recommendations tailored to the Pakistani market.

Return ONLY valid JSON in this exact shape:
{
  "recommendations": [
    {
      "title": "Career title",
      "matchScore": 85,
      "reasoning": "Why this fits the student",
      "marketOutlook": "Pakistan-specific market context",
      "roadmap": [
        { "title": "Step title", "description": "What to do", "duration": "3 months", "resources": [{"name": "Course name", "type": "online", "link": "optional"}] }
      ]
    }
  ],
  "overallTimeline": {
    "shortTermGoal": "Goal for next 6-12 months",
    "longTermGoal": "Goal for next 3-5 years"
  }
}`
```

**Alternatives considered**:
- Groq fallback: available (GROQ_API_KEY in env) but adds complexity; keep as manual fallback, not automatic
- Separate AI calls per career path: more quota usage, harder to enforce 3-5 career count constraint

---

## 2. Guidance DB Write — assessmentSnapshot Pattern

**Decision**: Store a snapshot of the assessment data alongside the guidance record

**Rationale**: The `career_guidance` table already has `assessmentSnapshot Json` in the schema. This prevents the guidance record becoming meaningless if the assessment is later updated or deleted. The snapshot is a copy of the assessment fields used to generate the guidance — not the full assessment row.

**Snapshot shape**:
```ts
{
  mbtiType: string,
  iqScore: number,
  qualification: string,
  skills: string[]
}
```

**Alternatives considered**:
- Re-read assessment on every GET: adds a DB query; snapshot is read-once and fast
- Don't store snapshot: rejected (cascade delete risk; guidance becomes opaque)

---

## 3. Dashboard Aggregation — Single Query Strategy

**Decision**: Three parallel `Promise.all()` queries, one per table, inside a single API handler

**Rationale**: No cross-table JOIN needed — each table is queried by `clerkId` independently. `Promise.all()` fires all three simultaneously; total latency = max(t1, t2, t3) not sum. If any throws, `Promise.all()` rejects and we return 500 for the entire response (per FR-014b).

**Pattern**:
```ts
const [assessment, guidance, skillGap] = await Promise.all([
  prisma.career_assessments.findUnique({ where: { clerkId: userId } }),
  prisma.career_guidance.findFirst({
    where: { clerkId: userId },
    orderBy: { generatedAt: 'desc' }
  }),
  prisma.skill_gaps.findFirst({
    where: { clerkId: userId },
    orderBy: { createdAt: 'desc' }
  })
])
```

**Null handling**: `findUnique` / `findFirst` return `null` when no record exists — not an error. Each section maps `null` directly to `null` in the response shape (FR-014: null section = no data, not an error).

**Alternatives considered**:
- Sequential queries: simpler error isolation but 3x slower
- Single JOIN: would require raw SQL or Prisma `$queryRaw`; overkill when tables share only `clerkId`

---

## 4. Clerk Webhook Verification

**Decision**: `svix` library for signature verification with raw body access

**Rationale**: Clerk uses Svix to sign webhooks. The `svix` npm package provides a `Webhook.verify()` method that validates the `svix-id`, `svix-timestamp`, and `svix-signature` headers against the raw request body and the `CLERK_WEBHOOK_SECRET`. The body must be read as raw text — not parsed JSON — before verification.

**Pattern**:
```ts
import { Webhook } from 'svix'

export async function POST(req: Request) {
  const body = await req.text()  // raw text — must not use req.json()
  const svixId = req.headers.get('svix-id')
  const svixTs = req.headers.get('svix-timestamp')
  const svixSig = req.headers.get('svix-signature')

  if (!svixId || !svixTs || !svixSig) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 401 })
  }

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!)
  let event: WebhookEvent
  try {
    event = wh.verify(body, { 'svix-id': svixId, 'svix-timestamp': svixTs, 'svix-signature': svixSig }) as WebhookEvent
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  if (event.type === 'user.created') {
    const { id, first_name, last_name, email_addresses } = event.data
    await prisma.users.upsert({
      where: { clerkId: id },
      update: {},  // idempotent — no-op if exists
      create: {
        clerkId: id,
        name: `${first_name ?? ''} ${last_name ?? ''}`.trim(),
        email: email_addresses[0]?.email_address ?? ''
      }
    })
  }

  return NextResponse.json({ received: true })
}
```

**Critical**: The webhook route MUST be excluded from Clerk's `requireAuth()` — it is called by Clerk's servers, not by a signed-in user. It is also NOT a protected route in `proxy.js` — it must be publicly reachable.

**Alternatives considered**:
- Manual HMAC verification: possible but reinvents what `svix` does; rejected
- No verification: rejected per FR-019 and Constitution I

---

## 5. Idempotency — `upsert` with No-Op Update

**Decision**: `prisma.users.upsert({ where: { clerkId }, update: {}, create: {...} })`

**Rationale**: Setting `update: {}` makes the upsert a no-op if the user already exists — no fields are changed on duplicate. This satisfies FR-021 without custom duplicate-detection logic. PostgreSQL handles the unique constraint atomically.

**Alternatives considered**:
- `create` with try/catch on unique constraint error: works but requires error code inspection (`P2002`); upsert is cleaner
- `findUnique` then `create` if not found: two queries; race condition on concurrent duplicate events

---

## 6. Dashboard Page — Server Component with Clerk

**Decision**: Next.js server component using `auth()` + `currentUser()` from `@clerk/nextjs/server`, with `redirect()` for unauthenticated users

**Pattern**:
```tsx
// app/dashboard/page.tsx
import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const user = await currentUser()
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/dashboard`, {
    headers: { Cookie: /* forward session cookie */ }
  })
  const data = await res.json()
  // ...render
}
```

**Alternative — direct DB query in page**: Calling `prisma` directly in the page component bypasses `GET /api/dashboard` entirely. Acceptable but couples the page to the DB layer. Use the API call to keep the dashboard testable independently. The `GET /api/dashboard` is a separate endpoint that other clients (mobile app, etc.) could consume.

**Decision**: Call `GET /api/dashboard` from the server component (not `prisma` direct) — keeps API contract as the single source of truth.

---

## 7. `users` Table — 4th Prisma Model

**Decision**: Add `users` model to `prisma/schema.prisma` with manual Supabase SQL creation (same as Phase 0+1)

**Rationale**: `prisma db push` is blocked by PgBouncer Transaction mode on port 6543. Tables must be created manually via Supabase SQL Editor, then `prisma generate` regenerates the client.

**SQL**:
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  "clerkId" TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX users_clerk_id_idx ON users("clerkId");
```

**Note**: Prisma CUID default for `id` requires `@default(cuid())` in schema — Supabase creates the column as TEXT and Prisma populates it at insert time.

---

## 8. Packages to Install

```bash
# Production
npm install svix

# No other new packages needed:
# - @google/generative-ai: already installed (used in skillgap route)
# - @prisma/client: already installed (v5.10.0)
# - @clerk/nextjs: already installed
```

**Note**: `svix` is the only new package for Phase 2+3.
