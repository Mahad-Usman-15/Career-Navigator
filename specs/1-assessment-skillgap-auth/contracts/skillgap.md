# API Contract: Skill Gap Analyzer

**Route**: `/api/skillgap`
**Auth**: Required (Clerk session) on all methods

---

## POST /api/skillgap

Submit a resume (PDF or text) + job description for AI skill gap analysis.

### Request

**Content-Type**: `multipart/form-data`

```
FormData fields:
  resume        File (optional)    — PDF file upload
  resumeText    string (optional)  — Plain pasted resume text
  jobDescription string (required) — Target job description

At least one of `resume` or `resumeText` must be provided.
```

### Processing

1. Auth guard validates session → extract `userId`
2. If `resume` file present: extract text via `pdf-parse` server-side
   - If extracted text is empty → return 400 (image-only PDF)
3. If `resumeText` provided: use directly
4. Send `[extractedText, jobDescription]` to Gemini 1.5 Flash in JSON mode
5. Validate AI response against `SkillGapAnalysisSchema`
   - If invalid → return 503 (no DB write)
6. Save to `skill_gaps` table with `clerkId` from session

### Responses

**201 Created** — Analysis complete and saved
```ts
{
  success: true,
  data: {
    id: string,
    resumeSource: "pdf" | "text",
    analysis: {
      missingSkills: string[],
      matchingSkills: string[],
      recommendations: string,      // Markdown advice
      compatibilityScore: number,   // 0–100
      suggestedRoadmap: Array<{
        step: string,
        resource: string
      }>
    },
    createdAt: string
  }
}
```

**400 Bad Request** — Missing resume content
```ts
{ error: "Missing resume or job description" }
```

**400 Bad Request** — Image-only PDF (no extractable text)
```ts
{ error: "Could not extract text from PDF. Please paste your resume as text instead." }
```

**401 Unauthorized** — No valid session
```ts
{ error: "Unauthorized" }
```

**503 Service Unavailable** — AI service down or returned invalid structure
```ts
{ error: "AI service unavailable. Please try again later." }
```

---

## GET /api/skillgap

Retrieve the authenticated user's previous skill gap analyses, most recent first.

### Request

No body or query parameters. Identity from session only.

### Responses

**200 OK** — Records found (or empty array for new user)
```ts
{
  success: true,
  data: Array<{
    id: string,
    resumeSource: "pdf" | "text",
    jobDescription: string,
    analysis: {
      missingSkills: string[],
      matchingSkills: string[],
      compatibilityScore: number,
      suggestedRoadmap: Array<{ step: string, resource: string }>
    },
    createdAt: string
  }>
}
```

Note: `recommendations` (markdown text) is omitted from list response to reduce payload.
Full detail available from individual record if needed (out of scope for Phase 0+1).

**401 Unauthorized** — No valid session
```ts
{ error: "Unauthorized" }
```
