# Career Navigator — Architecture Reference

## Overview

AI-powered career guidance platform targeting students (school to undergraduate level) in Karachi, Pakistan. Users complete MBTI + IQ assessments and receive AI-generated career paths and skill gap analysis reports.

---

## Tech Stack Decisions

### Database: Supabase (PostgreSQL + JSONB)

Supabase replaced MongoDB Atlas due to network reliability issues on Atlas's free tier (IP whitelisting, auto-pausing, port 27017 blocks common in Pakistan). JSONB columns store nested data (MBTI answers, roadmap arrays, skill lists) with no schema redesign required. Prisma ORM is used for type-safe queries.

### AI: Groq (primary) + Gemini 1.5 Flash (fallback)

- **Primary:** `@openai/agents` SDK pointed at Groq's API (`llama-3.3-70b-versatile`) via a custom OpenAI client with a `baseURL` override. This gives a structured `Agent`/`run()` abstraction.
- **Fallback:** `@google/generative-ai` with `responseMimeType: "application/json"` for guaranteed JSON output from Gemini 1.5 Flash.
- Groq free tier: 14,400 req/day — sufficient for current scale.

### Language: JavaScript + TypeScript (mixed)

Existing pages remain in `.jsx`. New API routes, agents, and Prisma schema are written in `.ts`. Next.js handles the mixed setup natively — no forced migration.

### PDF Resume Handling

Raw PDF binaries are never stored in the database. The flow is:

```
PDF upload → pdf-parse (server-side) → extracted text string → stored as resumeContent
```

If the original file needs to be preserved, it goes to Supabase Storage and only the URL is saved.

---

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/career-assessment` | Calculate MBTI + IQ scores server-side and persist |
| `GET` | `/api/career-assessment` | Return the authenticated user's assessment |
| `POST` | `/api/skillgap` | Accept PDF/text resume + job description, run AI analysis, persist |
| `GET` | `/api/skillgap` | Return the user's most recent skill gap report |
| `POST` | `/api/generateguidance` | Generate AI career paths from assessment, Zod-validate, persist |
| `GET` | `/api/generateguidance` | Return the user's most recent career guidance |
| `GET` | `/api/dashboard` | Aggregate assessment + guidance + skill gap in one response |
| `POST` | `/api/contact` | Send contact form via Resend |
| `POST` | `/api/webhooks/clerk` | Upsert users table on Clerk `user.created` event (Svix-verified) |

---

## Database Schema

All tables live in Supabase. Nested/array data uses JSONB columns. Queries always use `clerkId` sourced from the session.

**`career_assessments`**
`clerkId, name, email, age, qualification, personality (jsonb), iq (jsonb), skills (jsonb), isComplete, timestamps`

**`career_guidance`**
`clerkId, assessmentId (fk), recommendations (jsonb), overallTimeline (jsonb), generatedAt`

**`skill_gaps`**
`clerkId, name, resumeSource (pdf|text), resumeContent (text), jobDescription, analysis (jsonb: missingSkills, matchingSkills, compatibilityScore, suggestedRoadmap), timestamps`

---

## Authentication & Security

- **Route protection:** Clerk middleware (`middleware.js`) blocks unauthenticated access to `/careercounselling`, `/skillgapanalyzer`, `/dashboard`
- **API protection:** Every API route calls `const { userId } = await auth()` and returns 401 if no session
- **DB queries:** Always use `userId` from the session — never from `req.body` or query params

---

## Components

Seven components in `components/`:

| File | Purpose |
|------|---------|
| `navbar.jsx` | Site navigation |
| `footer.jsx` | Footer with nav links + social links |
| `PersonalityCard.jsx` | MBTI type display card |
| `emailtemplate.jsx` | Resend HTML email template |
| `gradientbutton.jsx` | Reusable gradient CTA button |
| `data/personalityTypes.js` | MBTI type definitions and descriptions |
| `ui/accordion.jsx` | Used in the FAQs page |

Add new UI components via `npx shadcn@latest add <component>` only when a page actually needs them.

---

## Dashboard

Server component using Clerk's `auth()` + `currentUser()`, redirects if no session. Displays:

- Welcome banner (user name + avatar)
- MBTI type card
- IQ score card
- Skill match % (latest skill gap report)
- Top 3 career paths with match % bars
- Top missing skills summary
- Quick actions: retake assessment, new skill gap scan, view personality types

---

## Environment Variables

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
CLERK_WEBHOOK_SECRET
DATABASE_URL              # Supabase PostgreSQL connection string
GEMINI_API_KEY
GROQ_API_KEY
RESEND_API_KEY
NEXT_PUBLIC_APP_URL
```

---

## Coding Conventions

- Existing files: `.js` / `.jsx` — do not convert
- New files: `.ts` / `.tsx`
- API routes: verify `auth()` first, then query the DB
- Never use `req.body.clerkId` — always use session `userId`
- File uploads: use `FormData` (not JSON) for endpoints that accept PDFs
- PDF extraction: `pdf-parse` on the server only
