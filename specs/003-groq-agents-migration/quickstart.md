# Quickstart: Groq Agents Migration & Platform Hardening

**Feature**: 003-groq-agents-migration
**Date**: 2026-03-17

---

## Prerequisites

```bash
# 1. Install @openai/agents and its peer dependency
npm install @openai/agents openai

# 2. Verify no Prisma upgrade happened
cat package.json | grep prisma   # should still show 5.10.0

# 3. Environment variables required (must exist in .env.local)
GROQ_API_KEY=gsk_...
GEMINI_API_KEY=AIza...
DATABASE_URL=postgresql://...
CLERK_SECRET_KEY=sk_...
```

---

## Implementation Order

Follow this sequence to minimize risk of breaking passing tests:

### Step 1 — Shared utility (no dependencies)

Create `lib/sanitize.ts`:
- Export `sanitizeInput(text: string, maxLength = 4000): string`
- Strip injection patterns (case-insensitive regex)
- Truncate to `maxLength` after stripping

### Step 2 — AI agents (depend on: openai installed, schemas.ts)

Create `lib/agents/CareerGuidanceAgent.ts`:
- Import `Agent`, `run` from `@openai/agents`; import `OpenAI` from `openai` (peer dep)
- Create Groq client: `new OpenAI({ baseURL: 'https://api.groq.com/openai/v1', apiKey: process.env.GROQ_API_KEY })`
- Level 1: `new Agent({ model: 'llama-3.3-70b-versatile', outputType: CareerGuidanceSchema, instructions: buildPrompt(assessment) })` → `run(agent, input, { /* groqClient */ })`
- Level 2: same Agent pattern with `llama-3.1-8b-instant`
- Level 3: Gemini 1.5 Flash via `@google/generative-ai` with `responseMimeType: 'application/json'`
- **Check installed `@openai/agents` docs** for exact custom client injection API before implementing
- Throw `Error('All AI providers failed')` if all three levels fail

Create `lib/agents/SkillAnalyzerAgent.ts` — same `@openai/agents` pattern with `SkillGapAnalysisSchema`.

### Step 3 — Bug fixes (isolated, low-risk)

Fix `app/api/dashboard/route.ts`:
- Line 32: `mbtiType: personality?.mbtiType` → `mbtiType: personality?.type`
- Line 33: `iqScore: iq?.score` → `iqScore: iq?.iq_score`
- Lines 34–35: Remove `iqCategory` field entirely

### Step 4 — Rewrite generateguidance route

Update `app/api/generateguidance/route.ts`:
- Fix prompt builder JSON paths (`personality.type`, `iq.iq_score`)
- Sanitize `skills` and `qualification` with `sanitizeInput()`
- Replace Gemini call with `generateCareerGuidance(assessment)`
- Add `deleteMany` before `create` for guidance regeneration

### Step 5 — Convert and rewrite skillgap route

Rename `app/api/skillgap/route.js` → `route.ts`:
- Add scanned PDF guard: `if (extractedText.trim().length < 50)`
- Sanitize `extractedText` and `jobDescription`
- Replace Gemini call with `analyzeSkillGap(resumeContent, jobDescription)`
- Fix response: return `{ success: true, analysis: validation.data }`
- Remove old `data: record` return

### Step 6 — Convert career-assessment route

Rename `app/api/career-assessment/route.js` → `route.ts`:
- Add TypeScript types to all function signatures and variables
- No logic changes

### Step 7 — Auth guard on skill gap analyzer

Convert `app/skillgapanalyzer/page.jsx`:
- Add server component wrapper that calls `auth()` and redirects if no session
- Move client form to `app/skillgapanalyzer/SkillGapAnalyzerClient.jsx`

### Step 8 — Wire guidance trigger in career counselling

Update `app/careercounselling/page.jsx`:
- After `POST /api/career-assessment` returns 201:
  - Show loading spinner: "Generating your career paths…"
  - Call `POST /api/generateguidance`
  - On success: show "Career paths generated! View on Dashboard" CTA
  - On failure (503/network): show non-blocking "Generate Career Guidance" button

### Step 9 — Retheme dashboard and personality types

Update `app/dashboard/page.jsx`:
- Replace `bg-background` → `bg-[#171717]`
- Replace shadcn Card usage → `div` with `bg-[#222222] rounded-2xl p-6`
- Replace `text-muted-foreground` → `text-white/60`
- Gradient headings: `style={{ background: 'linear-gradient(135deg, #1e3a8a, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}`

Update `app/personalitytypes/page.jsx`:
- Same dark theme treatment

---

## Verification

```bash
# TypeScript clean build
npx tsc --noEmit

# Full build
npm run build

# All existing tests pass
npx vitest run

# Manual checks
# - POST /api/generateguidance → returns career paths (not 503 "Unknown")
# - POST /api/skillgap (text) → returns analysis with analysis key at top level
# - GET /api/dashboard → mbtiType and iqScore not null
# - Upload scanned PDF → 400 with explanatory message
# - Visit /skillgapanalyzer while signed out → redirect to /sign-in
# - Submit assessment → spinner appears → career paths displayed
```

---

## Key Files Changed

| File | Change |
|---|---|
| `lib/sanitize.ts` | NEW |
| `lib/agents/CareerGuidanceAgent.ts` | NEW |
| `lib/agents/SkillAnalyzerAgent.ts` | NEW |
| `app/api/dashboard/route.ts` | JSON path bug fix |
| `app/api/generateguidance/route.ts` | Agent swap + path fix + regen |
| `app/api/skillgap/route.ts` | Converted from .js + agent swap + response fix |
| `app/api/career-assessment/route.ts` | Converted from .js (types only) |
| `app/skillgapanalyzer/page.jsx` | Auth guard wrapper |
| `app/skillgapanalyzer/SkillGapAnalyzerClient.jsx` | NEW — extracted client form |
| `app/careercounselling/page.jsx` | Guidance auto-trigger + loading state |
| `app/dashboard/page.jsx` | Dark theme restyle |
| `app/personalitytypes/page.jsx` | Dark theme restyle |
