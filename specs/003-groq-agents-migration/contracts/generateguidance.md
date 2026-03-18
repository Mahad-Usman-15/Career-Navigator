# Contract: POST /api/generateguidance

**Route**: `app/api/generateguidance/route.ts`
**Change type**: Internal rewrite — same request/response contract, Gemini call replaced by CareerGuidanceAgent

---

## Request

**Method**: POST
**Auth**: Required (Clerk session — 401 if absent)
**Body**: None — userId from session, assessment fetched from DB

---

## Response

### 201 — Success

```json
{
  "success": true,
  "data": {
    "id": "cuid",
    "clerkId": "clerk_xxx",
    "assessmentId": "cuid",
    "recommendations": [
      {
        "title": "Software Engineer",
        "matchScore": 88,
        "reasoning": "...",
        "marketOutlook": "Pakistan-specific demand context",
        "roadmap": [
          {
            "title": "Step title",
            "description": "What to do",
            "duration": "2 months",
            "resources": [{ "name": "Resource name", "type": "online", "link": "optional" }]
          }
        ]
      }
    ],
    "overallTimeline": {
      "shortTermGoal": "Goal for next 6–12 months",
      "longTermGoal": "Goal for next 3–5 years"
    },
    "generatedAt": "2026-03-17T10:00:00.000Z"
  }
}
```

### 400 — Missing Assessment

```json
{ "error": "Assessment required before generating guidance. Please complete your career assessment first." }
```

### 401 — Unauthenticated

```json
{ "error": "Unauthorized" }
```

### 503 — All AI Providers Failed

```json
{ "error": "AI service unavailable. Please try again later." }
```

### 500 — DB Error

```json
{ "error": "Failed to save career guidance." }
```

---

## Behavior Changes in This Milestone

1. **JSON path fix**: Prompt builder reads `personality.type` and `iq.iq_score` (was `mbtiType` / `score`)
2. **Agent swap**: Replaces direct Gemini call with `generateCareerGuidance()` from `lib/agents/CareerGuidanceAgent.ts`
3. **Input sanitization**: `assessment.skills.skills` joined and sanitized before prompt; `qualification` sanitized
4. **Guidance regeneration**: Calls `deleteMany({ where: { clerkId } })` before creating new record so previous guidance is replaced

---

## GET /api/generateguidance (unchanged)

Returns the most recent guidance for the session user. No changes in this milestone.
