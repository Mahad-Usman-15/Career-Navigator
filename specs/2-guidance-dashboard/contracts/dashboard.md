# API Contract: Dashboard

**Route**: `GET /api/dashboard`
**Auth**: Clerk session required

---

## GET /api/dashboard

### Purpose
Aggregate the latest record from all three data tables (`career_assessments`, `career_guidance`, `skill_gaps`) in a single request and return a unified response shaped for direct dashboard consumption.

### Request
```
GET /api/dashboard
Authorization: Clerk session cookie
```

### Responses

#### 200 OK — success (all sections populated)
```json
{
  "assessment": {
    "mbtiType": "INTJ",
    "iqScore": 125,
    "iqCategory": "Superior",
    "qualification": "Intermediate",
    "skills": ["Python", "Data Analysis", "Problem Solving"]
  },
  "guidance": {
    "topCareers": [
      { "title": "Software Engineer", "matchScore": 87, "marketOutlook": "High demand in Karachi's tech sector..." },
      { "title": "Data Scientist", "matchScore": 82, "marketOutlook": "Growing field in Pakistan's fintech..." },
      { "title": "Systems Analyst", "matchScore": 74, "marketOutlook": "Steady demand in banking sector..." }
    ],
    "overallTimeline": {
      "shortTermGoal": "Secure an internship within 6 months",
      "longTermGoal": "Become a senior software engineer within 3-5 years"
    },
    "generatedAt": "2026-03-16T10:00:00.000Z"
  },
  "skillGap": {
    "compatibilityScore": 68,
    "missingSkills": ["Docker", "System Design", "SQL", "REST APIs", "Cloud (AWS/GCP)"],
    "matchingSkills": ["Python", "Problem Solving"],
    "analyzedAt": "2026-03-16T09:30:00.000Z"
  }
}
```

#### 200 OK — partial data (some sections null)
```json
{
  "assessment": {
    "mbtiType": "INTJ",
    "iqScore": 125,
    "iqCategory": "Superior",
    "qualification": "Intermediate",
    "skills": ["Python"]
  },
  "guidance": null,
  "skillGap": null
}
```

**Note**: `null` sections indicate no data exists — not an error. The UI shows "not completed" prompts.

#### 401 Unauthorized
```json
{ "error": "Unauthorized" }
```

#### 500 Internal Server Error — any table query threw
```json
{ "error": "Failed to load dashboard data. Please try again." }
```

**Note**: A 500 is returned if ANY of the three DB queries fails. No partial data is returned (FR-014b).

### Handler Logic
```
1. requireAuth() → userId (or throw 401)
2. try {
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
   } catch {
     return 500  // any query failure = entire dashboard fails
   }
3. Shape response:
   - assessment: assessment ? { mbtiType, iqScore, iqCategory, qualification, skills } : null
   - guidance: guidance ? {
       topCareers: guidance.recommendations.slice(0, 3).map(c => ({ title, matchScore, marketOutlook })),
       overallTimeline: guidance.overallTimeline,
       generatedAt: guidance.generatedAt
     } : null
   - skillGap: skillGap ? {
       compatibilityScore: skillGap.analysis.compatibilityScore,
       missingSkills: skillGap.analysis.missingSkills.slice(0, 5),
       matchingSkills: skillGap.analysis.matchingSkills,
       analyzedAt: skillGap.createdAt
     } : null
4. return 200 { assessment, guidance, skillGap }
```

### Response Shaping Notes
- `topCareers`: max 3 (`.slice(0, 3)`) — dashboard shows top 3 career paths
- `missingSkills`: max 5 (`.slice(0, 5)`) — dashboard shows top missing skills
- All array slicing happens server-side; UI receives pre-shaped data (FR-015)
- `assessment.skills` is the full skills array (small in practice)
- `mbtiType` extracted from `assessment.personality.mbtiType` (JSONB field)
- `iqScore` and `iqCategory` extracted from `assessment.iq.score` and `assessment.iq.category` (JSONB fields)
