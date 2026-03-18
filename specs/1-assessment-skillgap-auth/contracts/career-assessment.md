# API Contract: Career Assessment

**Route**: `/api/career-assessment`
**Auth**: Required (Clerk session) on all methods

---

## POST /api/career-assessment

Submit or re-submit a career assessment. Replaces any existing record for the authenticated user (upsert).

### Request

**Content-Type**: `application/json`

```ts
{
  name: string,                  // required
  age: number,                   // required, positive integer
  current_qualification: string, // required: "School" | "College" | "Under Graduate"
  mbtiAnswers: {                 // required, all 20 dimension keys
    ei1: number, ei2: number, ei3: number, ei4: number, ei5: number,
    sn1: number, sn2: number, sn3: number, sn4: number, sn5: number,
    tf1: number, tf2: number, tf3: number, tf4: number, tf5: number,
    jp1: number, jp2: number, jp3: number, jp4: number, jp5: number
  },
  iqAnswers: Record<string, string>,  // required: { "1": "42", "2": "True", ... }
  email?: string,
  skills?: string,               // comma-separated: "Python, React, SQL"
  strengths?: string,
  aspirations?: string
}
```

### Responses

**201 Created** — Assessment saved successfully
```ts
{
  success: true,
  data: {
    id: string,
    mbtiType: string,     // e.g. "INTJ"
    iqScore: number,      // e.g. 112
    completedAt: string   // ISO date
  }
}
```

**400 Bad Request** — Missing required fields
```ts
{ error: "Missing required fields: name, age, qualification" }
```

**401 Unauthorized** — No valid session
```ts
{ error: "Unauthorized" }
```

**500 Internal Server Error** — DB write failed
```ts
{ error: "Failed to save assessment" }
```

---

## GET /api/career-assessment

Retrieve the authenticated user's current assessment.

### Request

No body or query parameters. Identity from session only.

### Responses

**200 OK** — Assessment found
```ts
{
  success: true,
  data: {
    id: string,
    clerkId: string,
    name: string,
    email: string | null,
    age: number,
    qualification: string,
    personality: {
      type: string,
      dimensions: { EI: string, SN: string, TF: string, JP: string },
      scores: { E: number, I: number, S: number, N: number, T: number, F: number, J: number, P: number }
    },
    iq: {
      iq_score: number,
      rawScore: number,
      correctAnswers: number
    },
    skills: {
      skills: string[],
      interests: string[],
      strengths: string,
      aspirations: string
    },
    isComplete: boolean,
    createdAt: string,
    updatedAt: string
  }
}
```

**401 Unauthorized** — No valid session
```ts
{ error: "Unauthorized" }
```

**404 Not Found** — No assessment submitted yet
```ts
{ error: "No assessment found" }
```
