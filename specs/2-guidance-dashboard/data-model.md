# Data Model: Career Guidance, Dashboard & User Provisioning

**Feature**: 2-guidance-dashboard | **Date**: 2026-03-16

---

## Existing Tables (unchanged)

### `career_assessments`
| Column | Type | Notes |
|--------|------|-------|
| id | TEXT (cuid) | PK |
| clerkId | TEXT | UNIQUE — one assessment per user |
| name | TEXT | |
| email | TEXT? | nullable |
| age | INT | |
| qualification | TEXT | |
| personality | JSONB | `{ mbtiType, answers, ... }` |
| iq | JSONB | `{ score, category }` |
| skills | JSONB | `string[]` |
| isComplete | BOOLEAN | default true |
| createdAt | TIMESTAMP | |
| updatedAt | TIMESTAMP | |

**Relations**: has many `career_guidance` records (1:N via `assessmentId` FK)

---

### `career_guidance`
| Column | Type | Notes |
|--------|------|-------|
| id | TEXT (cuid) | PK |
| clerkId | TEXT | indexed |
| assessmentId | TEXT | FK → career_assessments.id (cascade delete) |
| assessmentSnapshot | JSONB | `{ mbtiType, iqScore, qualification, skills }` |
| recommendations | JSONB | array of CareerPath objects (3–5) |
| overallTimeline | JSONB | `{ shortTermGoal, longTermGoal }` |
| generatedAt | TIMESTAMP | default now() — used for "most recent" ordering |
| createdAt | TIMESTAMP | |
| updatedAt | TIMESTAMP | |

**Notes**:
- Multiple records per user are allowed (re-generation creates new rows)
- GET and dashboard always ORDER BY `generatedAt DESC` and take the first

**JSONB shape for `recommendations`**:
```json
[
  {
    "title": "Software Engineer",
    "matchScore": 87,
    "reasoning": "Your INTJ personality...",
    "marketOutlook": "High demand in Karachi tech sector...",
    "roadmap": [
      {
        "title": "Learn Python",
        "description": "Complete beginner Python course",
        "duration": "2 months",
        "resources": [{"name": "CS50P", "type": "online", "link": "https://cs50.harvard.edu/python"}]
      }
    ]
  }
]
```

**JSONB shape for `overallTimeline`**:
```json
{
  "shortTermGoal": "Complete Python fundamentals and land an internship within 6 months",
  "longTermGoal": "Become a senior software engineer at a product company within 3–5 years"
}
```

---

### `skill_gaps`
| Column | Type | Notes |
|--------|------|-------|
| id | TEXT (cuid) | PK |
| clerkId | TEXT | indexed |
| resumeSource | TEXT | `'pdf'` or `'text'` |
| resumeContent | TEXT | extracted text |
| jobDescription | TEXT | |
| analysis | JSONB | SkillGapAnalysis shape |
| createdAt | TIMESTAMP | |
| updatedAt | TIMESTAMP | |

---

## New Table: `users`

### Purpose
Provisioned by the Clerk `user.created` webhook. Creates a lightweight user anchor in the DB so all other routes always have a valid user record. Separate from assessment data.

### Schema (Prisma)
```prisma
model users {
  id        String   @id @default(cuid())
  clerkId   String   @unique
  name      String   @default("")
  email     String   @default("")
  createdAt DateTime @default(now())

  @@index([clerkId])
}
```

### Supabase SQL (manual creation — `prisma db push` blocked by PgBouncer)
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  "clerkId" TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX users_clerk_id_idx ON users("clerkId");
```

### Fields
| Column | Type | Notes |
|--------|------|-------|
| id | TEXT (cuid) | PK — populated by Prisma at insert time |
| clerkId | TEXT | UNIQUE — Clerk user ID (e.g. `user_2abc...`) |
| name | TEXT | `first_name + ' ' + last_name` from webhook payload |
| email | TEXT | Primary email address from webhook payload |
| createdAt | TIMESTAMP | Auto-set on insert |

### Idempotency
`upsert({ where: { clerkId }, update: {}, create: {...} })` — the empty `update: {}` makes re-processing the same webhook event a no-op.

---

## Read Models (not persisted)

### Dashboard Response
Assembled on every `GET /api/dashboard` request. Not stored.

```ts
type DashboardResponse = {
  assessment: {
    mbtiType: string
    iqScore: number
    iqCategory: string
    qualification: string
    skills: string[]
  } | null

  guidance: {
    topCareers: Array<{
      title: string
      matchScore: number
      marketOutlook: string
    }>  // top 3 only
    overallTimeline: {
      shortTermGoal: string
      longTermGoal: string
    }
    generatedAt: string  // ISO timestamp
  } | null

  skillGap: {
    compatibilityScore: number
    missingSkills: string[]  // top 5 only
    matchingSkills: string[]
    analyzedAt: string  // ISO timestamp
  } | null
}
```

**Notes**:
- `assessment`, `guidance`, and `skillGap` are each `null` if no record exists for the user
- `topCareers` is limited to 3 entries (slice of `recommendations` array)
- `missingSkills` is limited to 5 entries (top missing skills for display)
- All arrays are pre-sliced server-side so the UI consumes directly (FR-015)

---

## Validation (Zod schemas in `lib/schemas.ts`)

### `CareerGuidanceSchema` (already defined in Phase 0+1)
```ts
export const CareerGuidanceSchema = z.object({
  recommendations: z.array(CareerPathSchema).min(3).max(5),
  overallTimeline: z.object({
    shortTermGoal: z.string(),
    longTermGoal: z.string()
  })
})
```

Update `.min(1)` → `.min(3)` per FR-004 (must be 3–5 career paths). The stub defined `min(1)` — tighten it during implementation.

---

## Entity Relationships

```
users (1) ←— created by Clerk webhook; no FK to other tables
  |
  (no DB relation — all tables share clerkId string key)

career_assessments (1) ←→ career_guidance (N)
  clerkId = clerkId            assessmentId FK

career_assessments (1)
  clerkId = clerkId ——→ skill_gaps (N)
```

**Design note**: `users` table holds no FK relations to other tables. All tables share the Clerk `clerkId` string as the logical user identifier. This avoids cascade complexity — user provisioning is independent of assessment data. If a user signs up but never takes an assessment, `career_assessments` has no row (not an error).
