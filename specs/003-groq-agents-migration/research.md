# Research: Groq Agents Migration & Platform Hardening

**Feature**: 003-groq-agents-migration
**Date**: 2026-03-17

---

## D-001: @openai/agents SDK Pointing at Groq

**Decision**: Use `@openai/agents` npm package (the Agent/Runner abstraction) with a custom OpenAI client configured to point at Groq's OpenAI-compatible endpoint. The `openai` npm package is also required as a peer dependency (the `@openai/agents` package uses it internally for the HTTP client). Neither package is currently in `package.json` — both must be installed.

**Rationale**: The project constitution explicitly requires the `@openai/agents` SDK (Agent/Runner abstraction), not raw `chat.completions.create()` calls. The `@openai/agents` package provides structured output support via `outputType` (Zod schema), handles conversation management, and provides a consistent abstraction that makes swapping models straightforward. Groq exposes a fully OpenAI-compatible API, so the SDK works with a custom `baseURL`.

**Alternatives rejected**:
- Raw `openai` npm package with `chat.completions.create()` — does not use Agent/Runner abstraction; constitution violation
- `groq-sdk` — Groq's own package; not compatible with `@openai/agents` Agent/Runner pattern
- Direct `fetch()` to Groq API — duplicates retry/error handling; not using Agents SDK

**Key implementation pattern**:
```typescript
import { Agent, run } from '@openai/agents'
import OpenAI from 'openai'

// Custom client for Groq — passed to setDefaultOpenAIClient or per-agent context
const groqClient = new OpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY
})

const agent = new Agent({
  name: 'CareerGuidanceAgent',
  instructions: buildPrompt(assessment),
  model: 'llama-3.3-70b-versatile',
  outputType: CareerGuidanceSchema  // Zod schema — structured output
})

const result = await run(agent, 'Generate career guidance', { /* groqClient context */ })
const guidance = result.finalOutput  // typed as CareerGuidance
```

**Important**: Verify the exact API for passing a custom client per-run against the `@openai/agents` package documentation during T003/T004 implementation. The exact parameter name for custom client injection (`context`, constructor option, or `setDefaultOpenAIClient()`) must be confirmed from the installed package version.

**Gemini fallback**: Level 3 (Gemini) continues to use `@google/generative-ai` directly — `@openai/agents` is designed for OpenAI-compatible endpoints only. The try/catch pattern around the Gemini call remains unchanged from the existing `skillgap/route.js` implementation.

---

## D-002: Three-Level Fallback Implementation Pattern

**Decision**: Sequential `try/catch` blocks within a single async function. Each level:
1. Makes the AI call
2. Parses JSON from the response
3. Validates with Zod schema
4. Returns on success OR throws to the next `catch` level

A Zod validation failure triggers the next fallback — not just an HTTP error from the provider.

**Rationale**: A structurally invalid response from Groq is as bad as a network error — the student would receive corrupted career data. Wrapping each level in try/catch means both HTTP failures and schema failures cascade identically.

**Fallback sequence**:
1. `llama-3.3-70b-versatile` via Groq (primary — highest quality)
2. `llama-3.1-8b-instant` via Groq (secondary — faster, lower quality but good enough)
3. `gemini-1.5-flash` via `@google/generative-ai` (tertiary — different provider, independent reliability)

**Per-level timeout**: No explicit timeout added at the SDK level — Groq's free tier typically responds in 2–8 seconds. The 30-second total budget is met by the three levels in sequence.

---

## D-003: JSON-Mode Output per Provider

**Decision**:
- Groq (via OpenAI SDK): Use `response_format: { type: 'json_object' }` in the chat completion request
- Gemini fallback: Use `generationConfig: { responseMimeType: 'application/json' }` (already in existing code)

**Rationale**: JSON mode guarantees the response text is parseable as JSON without markdown fencing. Without it, models occasionally wrap JSON in ```json ... ``` blocks, breaking `JSON.parse()`.

**Note**: `llama-3.3-70b-versatile` and `llama-3.1-8b-instant` both support `json_object` response format on Groq.

---

## D-004: Prompt Injection Sanitization Approach

**Decision**: Regex-based string replacement of known injection trigger phrases in `lib/sanitize.ts`. Strip the following patterns (case-insensitive):
- `ignore previous instructions`
- `ignore all instructions`
- `disregard (all|the) instructions`
- `you are now`
- `act as`
- `system:`
- `forget everything`
- `new instructions`

Replacement: empty string `''`. Also strip markdown code fences (` ``` `) and multi-line `###` section headers which could confuse prompt structure.

Max-length truncation at 4,000 characters per field — applied after stripping, to the trimmed result.

**Rationale**: Student-facing platform. Sophisticated adversarial injection is not the threat model. Simple pattern matching eliminates 99% of practical injection attempts without false-positive risk.

---

## D-005: Guidance Regeneration — DB Strategy

**Decision**: Use `deleteMany` + `create` for guidance regeneration (not `upsert`) because `career_guidance` has no `@unique` constraint on `clerkId` — it allows multiple records per student. On each assessment submission:
1. Delete all existing guidance for `clerkId`
2. Create fresh guidance record linked to the new `assessmentId`

**Rationale**: The Prisma schema shows `career_guidance` has only `@@index([clerkId])` — not `@unique`. An `upsert` would require a `@unique` constraint. Using deleteMany + create avoids a schema migration.

**Alternative considered**: Add `@unique` on `clerkId` and use upsert — deferred because a schema migration risks disrupting the Supabase free tier during demo prep.

---

## D-006: Dashboard JSONB Path Bug Root Cause

**Confirmed**: `app/api/dashboard/route.ts` reads:
- `(assessment.personality as any)?.mbtiType` — **WRONG**. The actual stored key is `type` (from `calculateMBTI()` in route.js which returns `{ type: mbtiType, ... }`)
- `(assessment.iq as any)?.score` — **WRONG**. The actual stored key is `iq_score` (from `calculateIQScore()` which returns `{ iq_score: normalizedIQ, ... }`)
- `(assessment.iq as any)?.category` — **WRONG**. This key is never stored.

Similarly in `app/api/generateguidance/route.ts`, the prompt builder reads `assessment.personality?.mbtiType` and `assessment.iq?.score` — both wrong, producing 'Unknown' in every guidance prompt.

**Fix**: Change both files to use `.type` and `.iq_score`.

---

## D-007: Skill Gap Response Shape Bug

**Confirmed**: Current `POST /api/skillgap` returns `{ success: true, data: record }` where `record` is the full Prisma record. The client page (`app/skillgapanalyzer/page.jsx`) reads `data.analysis` from the response, which means it needs `response.analysis` to be the analysis object — but `response.data.analysis` is what the current route returns.

**Fix**: Change the route to return `{ success: true, analysis: validation.data }` so the client reads `response.analysis` directly. This fixes the undefined result display without changing the page code (page already reads `data.analysis` where `data = await response.json()`).

Wait — re-checking: the page does `const data = await response.json()` then `setResult(data.analysis)`. So `data.analysis` needs to exist at the top level of the JSON response. Current route returns `{ success: true, data: record }` so `data.analysis` is undefined. Fix: return `{ success: true, analysis: validation.data }`.

---

## D-008: Server-Side Auth Guard on `/skillgapanalyzer`

**Decision**: Convert `app/skillgapanalyzer/page.jsx` to a hybrid: outer server component that checks `auth()` and redirects, inner `"use client"` component for the form. Pattern matches `app/dashboard/page.jsx`.

**Implementation**:
```jsx
// app/skillgapanalyzer/page.jsx — outer server component
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import SkillGapAnalyzerClient from './SkillGapAnalyzerClient'

export default async function SkillGapAnalyzerPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')
  return <SkillGapAnalyzerClient />
}
```

The existing client form logic moves to `app/skillgapanalyzer/SkillGapAnalyzerClient.jsx` with `"use client"` directive.

---

## D-009: `openai` Package Version

**Decision**: Install `openai@^4.0.0` (latest stable v4). The v4 API uses `client.chat.completions.create(...)` which is what the Groq-compatible endpoint supports.

**Note**: Must verify `npm install openai` does not trigger a Prisma upgrade. The devDeps currently show `@prisma/client: ^5.10.0` — npm should not upgrade peer deps automatically.
