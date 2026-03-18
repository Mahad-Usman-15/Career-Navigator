# Product Requirements Document — Career Navigator

## Project Name

Career Navigator

---

## Problem Statement

Students and recent graduates often face significant challenges in career decision-making due to a lack of self-awareness, limited exposure to job market realities, and unclear pathways to professional success. Key issues include:

**Uncertainty in Career Selection:** Many students (from school to undergraduate levels) struggle to align their personality, IQ, skills, interests, and qualifications with suitable careers, leading to mismatched choices, wasted time, and potential career pivots.

**Skill Gaps in the Job Market:** Fresh graduates possess theoretical knowledge but often lack "micro-skills" (e.g., specific tools, soft skills, or industry certifications) demanded by employers. Identifying gaps between a resume and a dream job description is manual, time-consuming, and prone to oversight, resulting in rejected applications and underemployment.

**Lack of Personalized Guidance:** Traditional counseling is generic, expensive, or inaccessible, especially for students in resource-limited regions like Karachi, Pakistan.

**Data Overload Without Actionable Insights:** Without structured tools, students cannot translate personal assessments into concrete roadmaps, perpetuating indecision and frustration.

These problems contribute to higher dropout rates, job dissatisfaction, and economic inefficiencies, particularly in competitive fields like technology and engineering.

---

## Proposed Solution

A web-based platform that uses AI-driven analysis to provide tailored career recommendations and skill gap insights. Users input personal data, complete assessments, and receive customized outputs stored securely in a database. The platform will:

- Collect user data via interactive forms and tests.
- Employ AI agents to process inputs, match them against career databases, and generate recommendations with detailed roadmaps.
- Offer a skill gap analyzer that compares user resumes against job descriptions to highlight deficiencies and suggest upskilling paths.
- Ensure privacy, accessibility, and scalability through a modern tech stack.

---

## Core Features

### 1. User Profile Creation and Assessments
- Input forms for personal info (name, age), qualifications, skills, and interests.
- Built-in personality test (MBTI-based — Myers-Briggs types like ISTJ/ESTJ) using interactive quizzes.
- IQ assessment via timed questions (pattern recognition and logic puzzles).
- Secure storage of all assessment data per authenticated user.

### 2. AI-Powered Career Recommendation Engine
- Analyzes aggregated user data to suggest 3–5 relevant career paths (e.g., Software Engineer, Data Analyst).
- Generates detailed roadmaps per path including education steps, certifications, internships, and timelines.

### 3. Skill Gap Analyzer
- Upload resume (PDF) or paste resume text, plus a target job description.
- AI compares them to identify gaps (e.g., "Missing React.js proficiency", "Needs AWS certification").
- Provides actionable recommendations: online courses, projects, and certifications to bridge gaps.
- Returns compatibility score and upskilling roadmap.

### 4. Dashboard and Reporting
- Personalized dashboard showing MBTI type, IQ score, career recommendations, skill match %, and top missing skills.
- Quick actions: retake assessment, new skill gap scan, view personality types.

### 5. Additional Enhancements
- Email notifications via Resend for assessment completion and new recommendations.
- Contact form for user support.

---

## Target Users

**Primary:** School and college students (ages 15–25) seeking career guidance, including undergraduate programs like Computer Science.

**Secondary:** Fresh graduates and young professionals transitioning careers or upskilling.

**Demographics:** Tech-savvy users in urban areas (Karachi, Pakistan) with internet access; expandable to global audiences.

**Pain Points Addressed:** Affordable, on-demand guidance for underserved groups — low-income students or those without access to career counselors.

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| **Framework** | Next.js 16 (App Router) + React 19 | Interactive UIs, forms, quizzes, dashboards; SSR + server components |
| **Styling** | Tailwind CSS v4 + Framer Motion | Utility-first design system with animations |
| **Authentication** | Clerk | Sign-up/sign-in, session management, protected routes via middleware |
| **Database** | Supabase (PostgreSQL + JSONB) | Replaces MongoDB Atlas (dropped due to IP/port issues in Pakistan); JSONB columns store nested data (MBTI answers, roadmap arrays, skill lists) |
| **ORM** | Prisma | Type-safe DB queries; replaces Mongoose |
| **AI — Primary** | Google Gemini 1.5 Flash (`@google/generative-ai`) | JSON-mode output (`responseMimeType: "application/json"`); career path + skill gap analysis |
| **AI — Fallback** | OpenAI Agents SDK → Groq (`llama-3.3-70b-versatile`) | Groq free tier: 14,400 req/day; `base_url` override to point SDK at Groq |
| **PDF Parsing** | `pdf-parse` (server-side only) | Extracts text from resume PDFs; raw binary never stored in DB |
| **Email** | Resend | Contact form + future notification emails |
| **Deployment** | Vercel | Native Next.js deployment target |

### Language Policy
- Existing files: `.js` / `.jsx` — not converted
- New files (API routes, agents, utilities): `.ts` / `.tsx`

### Environment Variables

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=
DATABASE_URL=                    # Supabase PostgreSQL connection string
GEMINI_API_KEY=
GROQ_API_KEY=                    # OpenAI Agents SDK via Groq
RESEND_API_KEY=
NEXT_PUBLIC_APP_URL=
```

---

## API Endpoints

| Status | Method | Route | Purpose |
|--------|--------|-------|---------|
| ✅ | POST | `/api/career-assessment` | Submit MBTI + IQ, calculate scores server-side, save |
| ✅ | GET | `/api/career-assessment` | Fetch user's assessment results |
| ⚠️ | POST | `/api/skillgap` | Resume (PDF/text) + JD → AI analysis → save (PDF handling in progress) |
| ❌ | GET | `/api/skillgap` | Fetch user's previous analyses |
| ❌ | POST | `/api/generateguidance` | Trigger AI career path generation |
| ❌ | GET | `/api/generateguidance` | Fetch generated career guidance |
| ❌ | GET | `/api/dashboard` | Aggregated: assessment + guidance + skill gap |
| ✅ | POST | `/api/contact` | Contact form → Resend email |
| ❌ | POST | `/api/webhooks/clerk` | Sync user record on sign-up/delete |

**Build priority:** `POST /api/generateguidance` → `GET /api/dashboard` → `GET /api/skillgap` → `GET /api/generateguidance` → `POST /api/webhooks/clerk`

---

## Data Models

### `career_assessments`
`clerkId`, `name`, `email`, `age`, `qualification`, `personality` (jsonb), `iq` (jsonb), `skills` (jsonb), `isComplete`, timestamps

### `career_guidance`
`clerkId`, `assessmentId` (FK), `recommendations` (jsonb — array of career paths with roadmaps), `overallTimeline` (jsonb), `generatedAt`

### `skill_gaps`
`clerkId`, `name`, `resumeSource` (pdf|text), `resumeContent` (text), `jobDescription`, `analysis` (jsonb: missingSkills, matchingSkills, compatibilityScore, suggestedRoadmap), timestamps

---

## Security Model

All protected routes use two independent layers:
1. **Clerk middleware** (`proxy.js`) — blocks unauthenticated requests at the edge.
2. **Server-side `auth()`** — every API route verifies the session; uses `userId` from the session, never from request params or body.

Protected routes: `/careercounselling`, `/skillgapanalyzer`, `/dashboard`

---

## Out of Scope (Deferred)

**Jobs & Internships Service** — Not building until all core features are complete. Planned integrations: JSearch API (LinkedIn/Indeed/Glassdoor), Adzuna, Rozee.pk (Pakistan-specific), with AI-powered matching via OpenAI Agents SDK and a `job_cache` table (6 hr TTL).
