# Data Model: Groq Agents Migration & Platform Hardening

**Feature**: 003-groq-agents-migration
**Date**: 2026-03-17

---

## Schema Changes

**None.** The Prisma schema (`prisma/schema.prisma`) is unchanged. All four tables remain as-is:
- `career_assessments` — unchanged structure
- `career_guidance` — unchanged structure; guidance regeneration handled via `deleteMany + create`
- `skill_gaps` — unchanged structure
- `users` — unchanged structure

---

## JSONB Field Inventory (Confirmed from source)

### `career_assessments.personality` (Json)
```json
{
  "type": "INTJ",
  "dimensions": { "EI": "I", "SN": "N", "TF": "T", "JP": "J" },
  "scores": { "E": 1, "I": 4, "S": 2, "N": 3, "T": 3, "F": 2, "J": 4, "P": 1 },
  "mbtiAnswers": { "ei1": 0, "ei2": 1, ... },
  "evaluatedAt": "2026-03-17T10:00:00.000Z"
}
```
**Read path**: `personality.type` (NOT `personality.mbtiType`)

### `career_assessments.iq` (Json)
```json
{
  "rawScore": 22,
  "correctAnswers": 22,
  "mentalAge": 28.5,
  "chronologicalAge": 20,
  "iq_score": 118,
  "iqAnswers": { "1": "42", "2": "True", ... },
  "assessedAt": "2026-03-17T10:00:00.000Z"
}
```
**Read path**: `iq.iq_score` (NOT `iq.score`; `iq.category` does NOT exist)

### `career_assessments.skills` (Json)
```json
{
  "skills": ["Python", "React", "SQL"],
  "interests": [],
  "strengths": "Problem solving",
  "aspirations": "Software engineer"
}
```

### `career_guidance.recommendations` (Json)
```json
[
  {
    "title": "Software Engineer",
    "matchScore": 88,
    "reasoning": "...",
    "marketOutlook": "...",
    "roadmap": [
      { "title": "...", "description": "...", "duration": "2 months", "resources": [...] }
    ]
  }
]
```

### `career_guidance.overallTimeline` (Json)
```json
{
  "shortTermGoal": "...",
  "longTermGoal": "..."
}
```

### `skill_gaps.analysis` (Json)
```json
{
  "missingSkills": ["Docker", "Kubernetes"],
  "matchingSkills": ["Python", "SQL"],
  "recommendations": "...",
  "compatibilityScore": 72,
  "suggestedRoadmap": [
    { "step": "Learn Docker", "resource": "docker.com/get-started" }
  ]
}
```

---

## New Source Files (no DB changes)

### `lib/sanitize.ts`
```typescript
export function sanitizeInput(text: string, maxLength = 4000): string
```
Pure function. No DB access. Input → cleaned + truncated string.

### `lib/agents/CareerGuidanceAgent.ts`
```typescript
export async function generateCareerGuidance(assessment: AssessmentInput): Promise<CareerGuidance>
```
Types:
```typescript
interface AssessmentInput {
  personality: { type: string; [key: string]: unknown }
  iq: { iq_score: number; [key: string]: unknown }
  qualification: string
  skills: { skills: string[]; strengths?: string; aspirations?: string }
}
```
Returns `CareerGuidance` (from `lib/schemas.ts`). Throws `Error` if all three fallback levels fail.

### `lib/agents/SkillAnalyzerAgent.ts`
```typescript
export async function analyzeSkillGap(
  resumeContent: string,
  jobDescription: string
): Promise<SkillGapAnalysis>
```
Returns `SkillGapAnalysis` (from `lib/schemas.ts`). Throws `Error` if all three fallback levels fail.

---

## Guidance Regeneration Flow

```
POST /api/career-assessment
  → upsert career_assessments (existing)
  → POST /api/generateguidance (auto-triggered from client after 201)
      → prisma.career_guidance.deleteMany({ where: { clerkId } })
      → generateCareerGuidance(assessment) → validated CareerGuidance
      → prisma.career_guidance.create({ data: { clerkId, assessmentId, ... } })
```

No schema change needed. deleteMany handles the "always regenerate" requirement without a unique constraint migration.

---

## Bug Fix Summary (read-path corrections only, no schema changes)

| Location | Wrong path | Correct path |
|---|---|---|
| `app/api/dashboard/route.ts` line 32 | `personality?.mbtiType` | `personality?.type` |
| `app/api/dashboard/route.ts` line 33 | `iq?.score` | `iq?.iq_score` |
| `app/api/dashboard/route.ts` line 34 | `iq?.category` | *(remove entirely)* |
| `app/api/generateguidance/route.ts` line 12 | `personality?.mbtiType` | `personality?.type` |
| `app/api/generateguidance/route.ts` line 13 | `iq?.score` | `iq?.iq_score` |
| `app/api/generateguidance/route.ts` line 14 | `iq?.category` | *(remove entirely)* |
