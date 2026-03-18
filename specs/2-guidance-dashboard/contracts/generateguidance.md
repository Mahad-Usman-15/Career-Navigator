# API Contract: Career Guidance

**Routes**: `POST /api/generateguidance` | `GET /api/generateguidance`
**Auth**: Clerk session required (both methods)

---

## POST /api/generateguidance

### Purpose
Generate AI career guidance for the authenticated student, validate the AI response, persist it, and return it.

### Request
```
POST /api/generateguidance
Authorization: Clerk session cookie (handled by middleware)
Content-Type: application/json (no body needed — user data loaded from DB by session)
Body: {} (empty — or omit)
```

No user input required in the request body. The handler fetches the student's assessment from the DB using `userId` from the session.

### Responses

#### 201 Created — success
```json
{
  "guidance": {
    "id": "clx1abc...",
    "clerkId": "user_2abc...",
    "assessmentId": "clx2def...",
    "recommendations": [
      {
        "title": "Software Engineer",
        "matchScore": 87,
        "reasoning": "Your INTJ personality and high IQ score...",
        "marketOutlook": "High demand in Karachi's growing tech sector...",
        "roadmap": [
          {
            "title": "Learn Python fundamentals",
            "description": "Complete a beginner Python course",
            "duration": "2 months",
            "resources": [{"name": "CS50P", "type": "online", "link": "https://cs50.harvard.edu/python"}]
          }
        ]
      }
    ],
    "overallTimeline": {
      "shortTermGoal": "Secure an internship within 6 months",
      "longTermGoal": "Become a senior software engineer within 3-5 years"
    },
    "generatedAt": "2026-03-16T10:00:00.000Z"
  }
}
```

#### 400 Bad Request — no assessment
```json
{ "error": "Assessment required before generating guidance. Please complete your career assessment first." }
```

#### 401 Unauthorized — no session
```json
{ "error": "Unauthorized" }
```

#### 503 Service Unavailable — AI failure or malformed AI response
```json
{ "error": "AI service unavailable. Please try again later." }
```

#### 500 Internal Server Error — DB write failed after successful AI call
```json
{ "error": "Failed to save guidance. Please try again." }
```

### Handler Logic
```
1. requireAuth() → userId (or throw 401)
2. prisma.career_assessments.findUnique({ where: { clerkId: userId } })
   → if null: return 400 "assessment required"
3. Build Gemini prompt from assessment fields (personality, iq, qualification, skills)
4. Call Gemini 1.5 Flash with responseMimeType: "application/json"
   → if throws: return 503
5. CareerGuidanceSchema.safeParse(parsedResponse)
   → if !success: return 503 (no DB write)
6. prisma.career_guidance.create({
     data: {
       clerkId: userId,
       assessmentId: assessment.id,
       assessmentSnapshot: { mbtiType, iqScore, qualification, skills },
       recommendations: validatedData.recommendations,
       overallTimeline: validatedData.overallTimeline
     }
   })
   → if throws: return 500 (AI response is lost — student must retry)
7. return 201 { guidance: createdRecord }
```

---

## GET /api/generateguidance

### Purpose
Retrieve the most recently generated guidance for the authenticated student.

### Request
```
GET /api/generateguidance
Authorization: Clerk session cookie
```

### Responses

#### 200 OK — guidance found
Same shape as POST 201 response body above.

#### 401 Unauthorized
```json
{ "error": "Unauthorized" }
```

#### 404 Not Found — no guidance generated yet
```json
{ "error": "No guidance found. Generate guidance first." }
```

### Handler Logic
```
1. requireAuth() → userId (or throw 401)
2. prisma.career_guidance.findFirst({
     where: { clerkId: userId },
     orderBy: { generatedAt: 'desc' }
   })
   → if null: return 404
3. return 200 { guidance: record }
```
