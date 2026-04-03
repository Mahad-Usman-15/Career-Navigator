import { NextRequest, NextResponse } from 'next/server'
import { checkDemoRateLimit } from '@/lib/rate-limit'
import { analyzeSkillGap } from '@/lib/agents/SkillAnalyzerAgent'
import { validateJobDescription, InputGuardrailTripwireTriggered } from '@/lib/agents/JDGuardrailAgent'
import { sanitizeInput } from '@/lib/sanitize'
import { z } from 'zod'

// Zod schema for the teaser response (constitution Principle III — validate AI output)
const TeaserSchema = z.object({
  compatibilityScore: z.number().min(0).max(100),
  missingSkills: z.array(z.string()),
})

const JD_MIN_LENGTH = 100
const JD_MAX_LENGTH = 5000

// POST /api/skillgap-demo
// Public endpoint — no auth required (intentional: demo mode feature, documented in specs/6-cro-crm-growth/plan.md)
// IP-based rate limit: 3 requests per hour per IP (FR-010a)
// Returns teaser only: compatibilityScore + top 3 missingSkills (FR-007, FR-008)
// Does NOT write to the database (FR-007)
export async function POST(req: NextRequest): Promise<NextResponse> {
  // Extract client IP for rate limiting
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'

  try {
    // FR-010a: IP-based rate limit — 3 req/hour/IP
    await checkDemoRateLimit(ip)

    const formData = await req.formData()
    const jobDescription = formData.get('jobDescription') as string | null
    const resumeFile = formData.get('resume') as File | null
    const resumeText = formData.get('resumeText') as string | null

    if (!jobDescription || !jobDescription.trim()) {
      return NextResponse.json({ error: 'Missing job description' }, { status: 400 })
    }

    // FR-010: Same input validation as authenticated flow
    if (jobDescription.trim().length < JD_MIN_LENGTH) {
      return NextResponse.json(
        { error: `Job description is too short. Please paste the full job posting (at least ${JD_MIN_LENGTH} characters).` },
        { status: 422 }
      )
    }

    if (jobDescription.trim().length > JD_MAX_LENGTH) {
      return NextResponse.json(
        { error: `Job description is too long (max ${JD_MAX_LENGTH} characters). Please trim it down.` },
        { status: 422 }
      )
    }

    // AI-powered JD guardrail — same as authenticated flow (FR-010)
    try {
      await validateJobDescription(jobDescription.trim())
    } catch (err) {
      if (err instanceof InputGuardrailTripwireTriggered) {
        const reason: string = (err as any).outputInfo?.reason ?? 'Job description does not appear to be a real job posting. Please paste an actual job description.'
        return NextResponse.json({ error: reason }, { status: 422 })
      }
      throw err
    }

    // Build resume text from optional inputs
    let resumeContent: string | null = null
    if (resumeFile && resumeFile.size > 0) {
      if (resumeFile.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: 'Resume file must be under 5MB.' }, { status: 400 })
      }
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require('pdf-parse') as (buf: Buffer) => Promise<{ text: string }>
      const buffer = Buffer.from(await resumeFile.arrayBuffer())
      const parsed = await pdfParse(buffer)
      resumeContent = parsed.text.trim()
      if (resumeContent.length < 50) {
        return NextResponse.json(
          { error: 'This appears to be a scanned PDF. Please use a text-based PDF.' },
          { status: 400 }
        )
      }
    } else if (resumeText && resumeText.trim()) {
      resumeContent = resumeText.trim()
    }

    const sanitizedJob = sanitizeInput(jobDescription.trim())
    // Demo mode: use a generic resume placeholder if none provided
    const sanitizedResume = resumeContent ? sanitizeInput(resumeContent) : 'No resume provided — analyse based on job description alone.'

    // FR-007: Primary Groq model only — no fallback chain for demo requests
    let analysis: Awaited<ReturnType<typeof analyzeSkillGap>>
    try {
      analysis = await analyzeSkillGap(sanitizedResume, sanitizedJob)
    } catch {
      return NextResponse.json(
        { error: 'AI service is temporarily unavailable. Please try again in a moment.' },
        { status: 503 }
      )
    }

    // Constitution Principle III: validate AI response before returning to client
    const teaserParsed = TeaserSchema.safeParse({
      compatibilityScore: analysis.compatibilityScore,
      missingSkills: analysis.missingSkills,
    })

    if (!teaserParsed.success) {
      return NextResponse.json(
        { error: 'AI service returned an unexpected response. Please try again.' },
        { status: 503 }
      )
    }

    // FR-007, FR-008: Return teaser only — top 3 missing skills, score, no full report
    return NextResponse.json({
      success: true,
      teaser: {
        compatibilityScore: teaserParsed.data.compatibilityScore,
        missingSkills: teaserParsed.data.missingSkills.slice(0, 3),
      },
    })

  } catch (error) {
    // Pass through 429 NextResponse from checkDemoRateLimit
    if (error instanceof NextResponse) return error
    console.error('Demo skill gap error:', error)
    return NextResponse.json({ error: 'An unexpected error occurred. Please try again.' }, { status: 500 })
  }
}
