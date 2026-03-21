# Career Navigator

> AI-powered career guidance for students and fresh graduates in Pakistan. Take a personality + IQ assessment, receive a personalized career roadmap, and identify the skill gaps holding your CV back.

---

## What It Does

Most students pick careers without real self-awareness, and most freshers get rejected not because they lack potential — but because their CVs have skill gaps no one ever pointed out. Career Navigator fixes both problems.

1. **Know yourself** — Complete an MBTI personality test and timed IQ assessment
2. **Get your roadmap** — AI generates 3–5 career paths tailored to your profile with step-by-step timelines
3. **Fix your CV** — Upload your resume + paste a job description → get a detailed skill gap report with an upskilling plan
4. **Track progress** — Personal dashboard aggregates all results in one place

---

## Features

- **Career Assessment** — Multi-step MBTI personality test + timed IQ quiz, scored server-side and stored per user
- **AI Career Guidance** — Gemini 1.5 Flash analyzes your assessment and generates personalized career paths with roadmaps
- **Skill Gap Analyzer** — Upload a PDF resume or paste text, add a job description, and receive missing skills, matching skills, compatibility score, and an upskilling roadmap
- **Personal Dashboard** — Unified view of your MBTI type, IQ score, career paths, and skill gap summary
- **16 Personality Types** — Browse all MBTI types with detailed career compatibility breakdowns
- **Authentication** — Secure sign-up/sign-in via Clerk with protected routes

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js (App Router) + React |
| Styling | Tailwind CSS + Framer Motion |
| Authentication | Clerk |
| Database | Supabase (PostgreSQL + JSONB) via Prisma ORM |
| AI | Google Gemini 1.5 Flash + Groq (llama-3.3-70b) |
| Email | Resend |
| Deployment | Vercel |

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/career-assessment` | Submit MBTI + IQ answers, calculate and store scores |
| `GET` | `/api/career-assessment` | Fetch the authenticated user's assessment results |
| `POST` | `/api/skillgap` | Submit resume (PDF/text) + job description for AI analysis |
| `GET` | `/api/skillgap` | Fetch the user's most recent skill gap report |
| `POST` | `/api/generateguidance` | Generate AI career paths from assessment results |
| `GET` | `/api/generateguidance` | Fetch the user's generated career guidance |
| `GET` | `/api/dashboard` | Aggregated endpoint — assessment + guidance + skill gap |
| `POST` | `/api/contact` | Send a contact form message via Resend |
| `POST` | `/api/webhooks/clerk` | Sync user records on Clerk sign-up events |

All endpoints require authentication. The user ID is always sourced from the session — never from request parameters.

---

## Project Structure

```
app/
├── api/                        # Next.js API routes
├── careercounselling/          # MBTI + IQ assessment (protected)
├── skillgapanalyzer/           # Resume + job description analysis (protected)
├── dashboard/                  # Personal results hub (protected)
├── home/                       # Landing page
├── about/                      # About page with creator info
├── personalitytypes/           # Browse all 16 MBTI types
├── faqs/                       # Frequently asked questions
└── contact/                    # Contact form

components/
├── navbar.jsx                  # Site navigation
├── footer.jsx                  # Site footer with social links
├── PersonalityCard.jsx         # MBTI type card component
├── emailtemplate.jsx           # Resend email template
├── gradientbutton.jsx          # Reusable CTA button
├── data/personalityTypes.js    # MBTI type definitions and descriptions
└── ui/accordion.jsx            # Accordion used in FAQs

lib/
├── agents/
│   ├── CareerGuidanceAgent.ts  # AI agent for career path generation
│   └── SkillAnalyzerAgent.ts   # AI agent for skill gap analysis
└── db.js                       # Supabase/Prisma client
```

---

## Database Schema

Three tables in Supabase (PostgreSQL). Nested data stored as JSONB.

**`career_assessments`**
Stores MBTI answers, personality result, IQ score, and user metadata.

**`career_guidance`**
Stores AI-generated career path recommendations and roadmaps, linked to an assessment.

**`skill_gaps`**
Stores resume content, job description, and AI analysis output (missing skills, matching skills, compatibility score, upskilling roadmap).

---

## Local Setup

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Clerk](https://clerk.dev) application
- API keys for Gemini, Groq, and Resend

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/Mahad-Usman-15/Career-Navigator.git
cd Career-Navigator

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.local.example .env.local
# Fill in the keys (see below)

# 4. Push the database schema
npx prisma generate
npx prisma db push

# 5. Start the development server
npm run dev
```

### Environment Variables

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=

# Database (Supabase PostgreSQL)
DATABASE_URL=

# AI
GEMINI_API_KEY=
GROQ_API_KEY=

# Email
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Creator

Built by **Mahad Usman** — AI Enthusiast from Karachi, Pakistan.

- LinkedIn: [mahad-usman-45497a353](https://www.linkedin.com/in/mahad-usman-45497a353)
- GitHub: [Mahad-Usman-15](https://github.com/Mahad-Usman-15)
- X: [@MahadUsmns](https://x.com/MahadUsmns)
- Email: mahadusman2008@gmail.com

---

## License

MIT
