# Contract: POST /api/skillgap

**Route**: `app/api/skillgap/route.ts` (converted from `.js`)
**Change type**: JS→TS conversion + Gemini replaced by SkillAnalyzerAgent + response shape fix + scanned PDF guard

---

## Request

**Method**: POST
**Auth**: Required (Clerk session — 401 if absent)
**Content-Type**: `multipart/form-data`

**FormData fields**:

| Field | Type | Required | Notes |
|---|---|---|---|
| `jobDescription` | string | Yes | The job posting text |
| `resume` | File (PDF) | Conditional | Required if `resumeText` absent |
| `resumeText` | string | Conditional | Required if `resume` absent |

---

## Response

### 201 — Success

```json
{
  "success": true,
  "analysis": {
    "missingSkills": ["Docker", "Kubernetes"],
    "matchingSkills": ["Python", "SQL"],
    "recommendations": "Focus on containerization to bridge the gap.",
    "compatibilityScore": 72,
    "suggestedRoadmap": [
      { "step": "Learn Docker basics", "resource": "docker.com/get-started" }
    ]
  }
}
```

**Note**: Response key changed from `data` to `analysis` (bug fix — client reads `response.analysis`).

### 400 — Missing Input

```json
{ "error": "Missing job description" }
```

```json
{ "error": "Missing resume or job description" }
```

### 400 — Scanned PDF

```json
{ "error": "This appears to be a scanned PDF. Please use a text-based PDF or fill the form manually." }
```

Triggered when: `extractedText.trim().length < 50` after `pdf-parse` processing.

### 401 — Unauthenticated

```json
{ "error": "Unauthorized" }
```

### 503 — All AI Providers Failed

```json
{ "error": "AI service unavailable. Please try again later." }
```

### 500 — Internal Error

```json
{ "error": "Failed to process analysis" }
```

---

## Behavior Changes in This Milestone

1. **Scanned PDF guard**: `extractedText.trim().length < 50` → 400 (was: empty `extractedText` string check only, which misses partial-extraction cases)
2. **Agent swap**: Replaces direct Gemini call with `analyzeSkillGap()` from `lib/agents/SkillAnalyzerAgent.ts`
3. **Input sanitization**: `extractedText` and `jobDescription` passed through `sanitizeInput()` before agent call
4. **Response key fix**: Returns `{ success: true, analysis: validation.data }` (was `{ success: true, data: record }`)
5. **JS→TS**: File converted to TypeScript with full types

---

## GET /api/skillgap (unchanged)

Returns all skill gap records for the session user. No changes in this milestone.
