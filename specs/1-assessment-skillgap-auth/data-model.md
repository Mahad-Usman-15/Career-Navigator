# Data Model: Foundation + Assessment & Skill Gap Auth

**Feature**: 1-assessment-skillgap-auth | **Date**: 2026-03-15

---

## Prisma Schema

File: `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model career_assessments {
  id                String   @id @default(cuid())
  clerkId           String   @unique          // One record per user — enforces upsert constraint
  name              String
  email             String?
  age               Int
  qualification     String                    // "School" | "College" | "Under Graduate"
  personality       Json                      // PersonalitySnapshot (see below)
  iq                Json                      // IQSnapshot (see below)
  skills            Json                      // SkillsSnapshot (see below)
  isComplete        Boolean  @default(true)   // Always true on save (no drafts)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  career_guidance   career_guidance[]         // FK target for Phase 2

  @@index([clerkId])
}

model career_guidance {
  id                 String              @id @default(cuid())
  clerkId            String
  assessmentId       String
  assessment         career_assessments  @relation(fields: [assessmentId], references: [id], onDelete: Cascade)
  assessmentSnapshot Json                // { iq_score, personalityType, qualification }
  recommendations    Json                // CareerPath[] — see CareerPathSchema
  overallTimeline    Json                // { shortTermGoal, longTermGoal }
  generatedAt        DateTime            @default(now())
  createdAt          DateTime            @default(now())
  updatedAt          DateTime            @updatedAt

  @@index([clerkId])
}

model skill_gaps {
  id             String   @id @default(cuid())
  clerkId        String
  resumeSource   String                  // "pdf" | "text"
  resumeContent  String                  // Extracted plain text — never raw binary
  jobDescription String
  analysis       Json                    // SkillGapAnalysis (see below)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@index([clerkId])
  @@index([clerkId, createdAt(sort: Desc)])  // Supports GET ordered by most recent
}
```

---

## JSONB Column Shapes

### `career_assessments.personality`

```ts
{
  type: "ISTJ" | "ISFJ" | "INFJ" | "INTJ" | "ISTP" | "ISFP" | "INFP" | "INTP"
       | "ESTP" | "ESFP" | "ENFP" | "ENTP" | "ESTJ" | "ESFJ" | "ENFJ" | "ENTJ",
  dimensions: { EI: "E"|"I", SN: "S"|"N", TF: "T"|"F", JP: "J"|"P" },
  scores: { E: number, I: number, S: number, N: number, T: number, F: number, J: number, P: number },
  mbtiAnswers: Record<string, number>,  // { ei1: 0, ei2: 1, ... }
  evaluatedAt: string                   // ISO date
}
```

### `career_assessments.iq`

```ts
{
  rawScore: number,         // 0–30 (correct answers out of 30)
  correctAnswers: number,
  mentalAge: number,
  chronologicalAge: number,
  iq_score: number,         // 70–130 normalised
  iqAnswers: Record<string, string>,  // { "1": "42", "2": "True", ... }
  assessedAt: string        // ISO date
}
```

### `career_assessments.skills`

```ts
{
  skills: string[],         // ["Python", "React", ...]
  interests: string[],      // ["Programming", ...]
  strengths: string,
  aspirations: string
}
```

### `skill_gaps.analysis`

```ts
// Matches SkillGapAnalysisSchema (Zod) in lib/schemas.ts
{
  missingSkills: string[],
  matchingSkills: string[],
  recommendations: string,  // AI-generated markdown advice
  compatibilityScore: number,  // 0–100
  suggestedRoadmap: Array<{ step: string, resource: string }>
}
```

### `career_guidance.recommendations` *(Phase 2 — schema defined now)*

```ts
// Matches CareerGuidanceSchema (Zod) in lib/schemas.ts
Array<{
  title: string,
  matchScore: number,     // 0–100
  reasoning: string,
  marketOutlook: string,
  roadmap: Array<{
    title: string,
    description?: string,
    duration?: string,
    resources?: Array<{ name: string, type: string, link?: string }>
  }>
}>
```

---

## Entity Relationships

```
career_assessments (clerkId UNIQUE)
  └── career_guidance[] (assessmentId FK, onDelete: Cascade)

skill_gaps (clerkId, no FK to career_assessments — independent feature)
```

- `career_assessments` is the root entity — one per Clerk user.
- `career_guidance` is child of `career_assessments` — cascades on assessment deletion.
- `skill_gaps` is independent — a user can submit skill gap analyses without completing a career assessment.
- All three tables are indexed on `clerkId` for fast per-user queries.

---

## Validation Rules (from spec)

| Field | Rule |
|-------|------|
| `career_assessments.clerkId` | Unique — enforces one-record-per-user upsert |
| `career_assessments.qualification` | Must be one of: "School", "College", "Under Graduate" |
| `career_assessments.isComplete` | Always `true` on save — no draft state |
| `skill_gaps.resumeSource` | Must be "pdf" or "text" |
| `skill_gaps.resumeContent` | Non-empty string — PDF extraction validated before save |
| `skill_gaps.analysis.compatibilityScore` | 0–100 (enforced by Zod before DB write) |

---

## Commands

```bash
# Initial setup (Phase 0, Day 1)
npx prisma db push           # Push schema to Supabase (dev)

# After any schema change
npx prisma generate          # Regenerate Prisma client
npx prisma db push           # Sync to DB

# Inspect DB (optional)
npx prisma studio
```
