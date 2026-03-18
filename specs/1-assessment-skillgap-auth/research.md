# Research: Foundation + Assessment & Skill Gap Auth

**Feature**: 1-assessment-skillgap-auth | **Date**: 2026-03-15

---

## 1. Prisma Client Pattern in Next.js (Serverless)

**Decision**: Singleton with `globalThis` cache

**Rationale**: Next.js dev mode hot-reloads modules, which would create a new `PrismaClient` on every reload and exhaust the PostgreSQL connection pool. Caching on `globalThis` ensures one instance survives reloads. In production (Vercel serverless), each function invocation gets its own instance but with `connection_limit=1` in the connection string to prevent pool exhaustion across concurrent invocations.

**Pattern**:
```ts
// lib/db.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
export const prisma = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

**DATABASE_URL addendum**: Append `?connection_limit=1&pool_timeout=0` for Supabase serverless.

**Alternatives considered**:
- New instance per request: rejected (connection pool exhaustion)
- Connection pooling via PgBouncer: deferred (Supabase free tier includes it; configure if needed post-launch)

---

## 2. Auth Guard Pattern

**Decision**: `requireAuth()` helper that returns `userId` or throws a `NextResponse` 401

**Rationale**: Keeps route handlers at one line of auth boilerplate. The throw pattern means the route function returns immediately — no nested `if (!userId) return ...` blocks needed. TypeScript return type is `Promise<string>` which narrows `userId` to non-null after the call.

**Pattern**:
```ts
// lib/auth-guard.ts
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function requireAuth(): Promise<string> {
  const { userId } = await auth()
  if (!userId) throw NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return userId
}
```

**Usage in route**:
```ts
export async function POST(req: Request) {
  try {
    const userId = await requireAuth()
    // ... rest of handler
  } catch (e) {
    if (e instanceof NextResponse) return e  // auth failure
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
```

**Alternatives considered**:
- Inline `auth()` in every handler: rejected (repetition; easy to forget the check)
- Middleware-only protection: rejected (constitution requires two-layer auth)

---

## 3. Zod Schema for AI Skill Gap Response

**Decision**: Zod with `.safeParse()` — non-throwing validation

**Rationale**: `safeParse` returns `{ success, data, error }` without throwing. This lets us log the schema error for debugging before returning a 503 to the client. The schema is defined once in `lib/schemas.ts` and used by the skillgap route.

**Schema**:
```ts
// lib/schemas.ts
import { z } from 'zod'

export const RoadmapStepSchema = z.object({
  step: z.string(),
  resource: z.string()
})

export const SkillGapAnalysisSchema = z.object({
  missingSkills: z.array(z.string()),
  matchingSkills: z.array(z.string()),
  recommendations: z.string(),
  compatibilityScore: z.number().min(0).max(100),
  suggestedRoadmap: z.array(RoadmapStepSchema)
})

// Stub for Phase 2 — defined now so schema.prisma is stable
export const CareerPathSchema = z.object({
  title: z.string(),
  matchScore: z.number().min(0).max(100),
  reasoning: z.string(),
  marketOutlook: z.string(),
  roadmap: z.array(z.object({
    title: z.string(),
    description: z.string().optional(),
    duration: z.string().optional(),
    resources: z.array(z.object({ name: z.string(), type: z.string(), link: z.string().optional() })).optional()
  }))
})

export const CareerGuidanceSchema = z.object({
  recommendations: z.array(CareerPathSchema).min(1).max(5),
  overallTimeline: z.object({
    shortTermGoal: z.string(),
    longTermGoal: z.string()
  })
})

export type SkillGapAnalysis = z.infer<typeof SkillGapAnalysisSchema>
export type CareerGuidance = z.infer<typeof CareerGuidanceSchema>
```

**Alternatives considered**:
- Manual shape checking: rejected (fragile, verbose)
- `zod.parse()` with try/catch: viable but `safeParse` is cleaner for the 503 flow

---

## 4. PDF Text Extraction

**Decision**: `pdf-parse` npm package, server-side only, with empty-string guard

**Rationale**: `pdf-parse` is the established Node.js library for PDF text extraction. It handles multi-page PDFs and returns a `text` string. If the string is empty after trim (image-only PDF), return 400 with the paste-fallback message. The raw `Buffer` from FormData is never stored.

**Pattern**:
```ts
import pdfParse from 'pdf-parse'

const formData = await req.formData()
const resumeFile = formData.get('resume') as File | null
const resumeText = formData.get('resumeText') as string | null

let extractedText: string
let resumeSource: 'pdf' | 'text'

if (resumeFile) {
  const buffer = Buffer.from(await resumeFile.arrayBuffer())
  const parsed = await pdfParse(buffer)
  extractedText = parsed.text.trim()
  resumeSource = 'pdf'
  if (!extractedText) {
    return NextResponse.json(
      { error: 'Could not extract text from PDF. Please paste your resume as text instead.' },
      { status: 400 }
    )
  }
} else if (resumeText?.trim()) {
  extractedText = resumeText.trim()
  resumeSource = 'text'
} else {
  return NextResponse.json({ error: 'Missing resume content' }, { status: 400 })
}
```

**Alternatives considered**:
- `pdfjs-dist`: heavier, browser-oriented; rejected for server use
- Supabase Storage + URL: out of scope for Phase 0+1 (only needed if original PDF retention required)

---

## 5. Test Isolation Strategy

**Decision**: Vitest + `vi.mock()` for Prisma + MSW for Gemini API

**Rationale**:
- Vitest is fast, ESM-native, and integrates well with Next.js projects. No Babel transform needed.
- `vi.mock('@/lib/db')` allows per-test Prisma mock without hitting Supabase.
- MSW intercepts fetch calls to Gemini API at the network layer — more realistic than mocking the SDK.

**vitest.config.ts**:
```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    globals: true,
    alias: { '@': resolve(__dirname, '.') }
  }
})
```

**Alternatives considered**:
- Jest: ESM support is awkward with Next.js 16; rejected
- Real Supabase test DB: adds CI env complexity; deferred for integration tests post-launch

---

## 6. Existing `lib/ai-agent.js` — Disposition

**Decision**: Bypass in new skillgap route; do not delete yet

**Rationale**: `lib/ai-agent.js` currently calls Gemini and returns unvalidated JSON. The rewritten skillgap route will call Gemini directly (using `@google/generative-ai`) with the new Zod schema validation. `ai-agent.js` is not imported anywhere else — it can be deleted after Stream B is confirmed working.

**Alternatives considered**:
- Refactor `ai-agent.js` to use Zod: more work than value; the new route is a full rewrite anyway

---

## 7. Packages to Install

```bash
# Production
npm install @prisma/client pdf-parse

# Dev
npm install -D prisma vitest @vitejs/plugin-react @vitest/coverage-v8 msw @types/pdf-parse
```

No breaking changes to existing dependencies. `mongodb` and `mongoose` remain installed but unused after Phase 1 (removal is a separate cleanup task).
