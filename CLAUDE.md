# Claude Context — Career Navigator

## Project Summary
AI-powered career guidance platform for students (school to undergraduate level), primarily targeting Karachi, Pakistan. Users complete MBTI + IQ assessments and receive AI-generated career paths and skill gap analysis.

## Key Architectural Decisions

### Database: Supabase (PostgreSQL) — replaces MongoDB Atlas
MongoDB Atlas M0 free tier was dropped due to persistent network issues:
- IP whitelisting blocks dynamic IPs (common in Pakistan)
- Atlas M0 clusters auto-pause after 60 days inactivity
- Port 27017 blocked by some Pakistani ISPs
- DNS SRV resolution failures on `mongodb+srv://`

**Decision:** Migrate to Supabase (PostgreSQL + JSONB). JSONB columns store nested data (MBTI answers, roadmap arrays, skill lists) with near-zero schema redesign. Prisma ORM replaces Mongoose.

### AI: `@openai/agents` SDK via Groq (primary) + Gemini 1.5 Flash (fallback)
- Primary: `@openai/agents` npm package — `Agent`/`run()` abstraction pointed at Groq (`llama-3.3-70b-versatile` → `llama-3.1-8b-instant`) via custom OpenAI client with `baseURL` override
- Groq free tier: 14,400 req/day — sufficient for this scale
- Fallback: `@google/generative-ai` with `responseMimeType: "application/json"` — Gemini 1.5 Flash
- **"OpenAI Agents SDK"** = `@openai/agents` package specifically (NOT raw `openai` with `chat.completions.create`)

### Language: JavaScript (existing) + TypeScript (new files only)
Next.js supports mixed JS/TS. Existing pages stay in `.jsx`. New agent code, API routes, and Prisma schema written in `.ts`. No forced migration.

### PDF Resume Handling
Raw PDF binary is never stored in DB. Flow:
`PDF upload → pdf-parse (server-side) → extracted text string → stored as resumeContent`
Original file (if needed) goes to Supabase Storage bucket; only URL stored in DB.

## API Endpoints (10 total across 6 routes)

| Status | Method | Route | Notes |
|--------|--------|-------|-------|
| ✅ | POST | `/api/career-assessment` | Calculates MBTI + IQ server-side |
| ✅ | GET | `/api/career-assessment` | Returns by session userId |
| ✅ | POST | `/api/skillgap` | PDF + text input, Gemini analysis, Supabase persist |
| ✅ | GET | `/api/skillgap` | Returns most recent skill gap by session userId |
| ✅ | POST | `/api/generateguidance` | Gemini-generated career paths, Zod-validated, persisted |
| ✅ | GET | `/api/generateguidance` | Returns most recent guidance by session userId |
| ✅ | GET | `/api/dashboard` | Aggregates assessment + guidance + skillGap in one call |
| ✅ | POST | `/api/contact` | Sends via Resend |
| ✅ | POST | `/api/webhooks/clerk` | Upserts users table on user.created event (Svix verified) |

All 10 endpoints implemented. Build priority list completed.

## Data Models (3 collections → Supabase tables)

**career_assessments** — clerkId, name, email, age, qualification, personality (jsonb), iq (jsonb), skills (jsonb), isComplete, timestamps

**career_guidance** — clerkId, assessmentId (fk), recommendations (jsonb array of career paths with roadmaps), overallTimeline (jsonb), generatedAt

**skill_gaps** — clerkId, name, resumeSource (pdf|text), resumeContent (text), jobDescription, analysis (jsonb: missingSkills, matchingSkills, compatibilityScore, suggestedRoadmap), timestamps

JSONB columns store all nested/array data. Always query by `clerkId` from session — never from request params.

## Security Rules
1. `proxy.js` — Clerk middleware protects `/careercounselling`, `/skillgapanalyzer`, `/dashboard`
2. Every API route calls `const { userId } = await auth()` — returns 401 if no session
3. DB queries always use `userId` from session, never from `req.body` or query params
4. `/api/career-assessment` POST currently missing auth check — add `auth()` before DB write

## Components (keep lean)
Only 7 files in `components/` — everything else was deleted (63 files removed).
Kept: `navbar`, `footer`, `PersonalityCard`, `emailtemplate`, `gradientbutton`, `data/personalityTypes`, `ui/accordion`
Add UI components back via `npx shadcn@latest add <component>` only when needed.

## Dashboard — What to Show
- Welcome banner (Clerk user name + avatar)
- MBTI type card (from career_assessments)
- IQ score card (from career_assessments)
- Skill match % card (latest from skill_gaps)
- Top 3 career paths with match % bars (from career_guidance)
- Skill gap summary — top missing skills (from skill_gaps)
- Quick actions: retake assessment, new skill gap scan, view personality types

Dashboard page must be a **server component** using Clerk's `auth()` + `currentUser()` with a redirect if no session.

## Jobs Service — Deferred
Not building now. Plan when core features are complete:
- JSearch API (RapidAPI) — LinkedIn + Indeed + Glassdoor
- Adzuna API — global tech jobs
- Rozee.pk — Pakistan-specific
- OpenAI Agents SDK JobMatchAgent ranks results against user's assessment profile
- Cache results in Supabase `job_cache` table (6hr TTL) to avoid burning free API limits

## Environment Variables Required
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
CLERK_WEBHOOK_SECRET
DATABASE_URL              # Supabase PostgreSQL
GEMINI_API_KEY
GROQ_API_KEY              # OpenAI Agents SDK via Groq
RESEND_API_KEY
NEXT_PUBLIC_APP_URL
```

## Coding Conventions
- Existing files: `.js` / `.jsx` — do not convert
- New files: `.ts` / `.tsx` preferred
- API routes: always verify `auth()` first, then DB
- Never use `req.body.clerkId` for DB queries — use session `userId`
- `pdf-parse` for PDF text extraction (server-side only)
- FormData (not JSON) for endpoints that accept file uploads
- shadcn components: add via CLI only when a page actually needs them
