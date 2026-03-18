# Career Navigator

AI-powered career guidance platform for students and fresh graduates. Users complete personality (MBTI) and IQ assessments, receive AI-generated career roadmaps, and analyze skill gaps against job descriptions.

## Features

- **Career Assessment** — Multi-step MBTI personality test + timed IQ quiz. Scores calculated server-side and stored per user.
- **AI Career Guidance** — Gemini 1.5 Flash analyzes assessment results and generates 3–5 career paths with detailed roadmaps.
- **Skill Gap Analyzer** — Upload resume (PDF or text) + paste job description → AI returns missing skills, matching skills, compatibility score, and upskilling roadmap.
- **Dashboard** — Aggregated view of assessment results, career paths, and latest skill gap report.
- **Authentication** — Clerk handles sign-up/sign-in. Protected routes: `/careercounselling`, `/skillgapanalyzer`, `/dashboard`.

## Tech Stack

| Layer | Tool |
|-------|------|
| Framework | Next.js 16 (App Router) + React 19 |
| Styling | Tailwind CSS v4 + Framer Motion |
| Auth | Clerk |
| Database | Supabase (PostgreSQL + JSONB) via Prisma ORM |
| AI | Google Gemini 1.5 Flash / OpenAI Agents SDK (Groq) |
| Email | Resend |
| Deployment | Vercel |

> **Note:** MongoDB Atlas was the original DB but was replaced with Supabase due to persistent network/IP whitelisting issues on the free tier. All nested data (MBTI answers, roadmap arrays) maps to JSONB columns.

## API Endpoints

| Method | Route | Purpose | Status |
|--------|-------|---------|--------|
| POST | `/api/career-assessment` | Submit MBTI + IQ, calculate scores, save | ✅ |
| GET | `/api/career-assessment` | Fetch user's assessment results | ✅ |
| POST | `/api/skillgap` | Resume (PDF/text) + JD → AI analysis → save | ⚠️ PDF handling in progress |
| GET | `/api/skillgap` | Fetch user's previous analyses | ❌ Pending |
| POST | `/api/generateguidance` | Trigger AI career path generation | ❌ Pending |
| GET | `/api/generateguidance` | Fetch generated career guidance | ❌ Pending |
| GET | `/api/dashboard` | Aggregated: assessment + guidance + skillgap | ❌ Pending |
| POST | `/api/contact` | Contact form → Resend email | ✅ |
| POST | `/api/webhooks/clerk` | Sync user on sign-up/delete | ❌ Pending |

## Project Structure

```
app/
├── api/                        # API routes (Next.js)
├── careercounselling/          # MBTI + IQ assessment (protected)
├── skillgapanalyzer/           # Resume analysis (protected)
├── dashboard/                  # User results hub (protected)
├── home/                       # Landing page
├── about/  faqs/  contact/     # Public pages
components/
├── navbar.jsx  footer.jsx      # Layout
├── PersonalityCard.jsx         # Used in /personalitytypes
├── emailtemplate.jsx           # Resend email template
├── gradientbutton.jsx          # Reusable CTA button
├── data/personalityTypes.js    # MBTI type definitions
└── ui/accordion.jsx            # Used in /faqs
lib/
├── db.js                       # Supabase/Prisma client
├── ai-agent.js                 # Gemini wrapper
└── utils.js
models/                         # Prisma schema (replacing Mongoose)
├── careerassesment.js
├── aigeneratedcareer.js
└── skillgap.js
proxy.js                        # Clerk middleware
```

## Environment Variables

```bash
# Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=

# Database
DATABASE_URL=                   # Supabase PostgreSQL connection string

# AI
GEMINI_API_KEY=
GROQ_API_KEY=                   # For OpenAI Agents SDK

# Email
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Setup

```bash
npm install
cp .env.local.example .env.local   # fill in keys
npx prisma generate
npx prisma db push
npm run dev
```

## PDF Resume Handling

When a user uploads a PDF resume, the server extracts plain text using `pdf-parse`. **Only the extracted text is stored in the database** — never the raw binary. If the original file needs to be stored, use Supabase Storage and save the URL.

```
PDF upload → pdf-parse (server) → extracted text → DB (resumeContent field)
```

## Security Model

All protected routes use two layers:
1. **Clerk middleware** (`proxy.js`) — blocks unauthenticated requests at the edge
2. **Server-side `auth()`** — every protected page and API route verifies the session and uses `userId` from the session, never from request params

## Future Services (Planned)

- **Jobs & Internships** — JSearch API (LinkedIn/Indeed), Adzuna, Rozee.pk aggregated with AI matching against user profile. Deferred until core features are complete.
