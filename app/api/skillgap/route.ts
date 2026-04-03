import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'
import { prisma } from '@/lib/db'
import { revalidateTag } from 'next/cache'
import { analyzeSkillGap } from '@/lib/agents/SkillAnalyzerAgent'
import { validateJobDescription, InputGuardrailTripwireTriggered } from '@/lib/agents/JDGuardrailAgent'
import { sanitizeInput } from '@/lib/sanitize'
import { ResourceSearchAgent } from '@/lib/agents/ResourceSearchAgent'
import { logger } from '@/lib/logger'
import { checkRateLimit } from '@/lib/rate-limit'

// POST /api/skillgap
// Constitution Principle I (layer 2) + Principle II: userId from session only
// Constitution Principle III: Zod validate inside agent before DB write
// FR-009, FR-010: sanitizeInput() on all free-text fields
// FR-013: scanned PDF guard — fewer than 50 chars after trim → 400
export async function POST(req: NextRequest) {
  try {
    const userId = await requireAuth()
    // T051: Rate limit — 10 AI requests per user per 60-min window (ADR-002)
    await checkRateLimit(userId)

    const formData = await req.formData()
    const resumeFile = formData.get('resume') as File | null
    const resumeText = formData.get('resumeText') as string | null
    const jobDescription = formData.get('jobDescription') as string | null

    if (!jobDescription || !jobDescription.trim()) {
      return NextResponse.json({ error: 'Missing job description' }, { status: 400 })
    }

    // Fast length check — no point hitting the AI for a 3-word input
    if (jobDescription.trim().length < 100) {
      return NextResponse.json(
        { error: 'Job description is too short. Please paste the full job posting (at least 100 characters).' },
        { status: 422 }
      )
    }

    // AI-powered input guardrail — LLM classifies whether this is a real JD.
    // Throws InputGuardrailTripwireTriggered if the text is not a valid job posting.
    try {
      await validateJobDescription(jobDescription.trim())
    } catch (err) {
      if (err instanceof InputGuardrailTripwireTriggered) {
        const reason: string = (err as any).outputInfo?.reason ?? 'Job description does not appear to be a real job posting. Please paste an actual job description.'
        return NextResponse.json({ error: reason }, { status: 422 })
      }
      throw err
    }

    let extractedText: string
    let resumeSource: string

    if (resumeFile && resumeFile.size > 0) {
      // PDF path — Constitution Principle IV: extract text, never store binary
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require('pdf-parse') as (buf: Buffer) => Promise<{ text: string }>
      const buffer = Buffer.from(await resumeFile.arrayBuffer())
      const parsed = await pdfParse(buffer)
      extractedText = parsed.text.trim()
      resumeSource = 'pdf'

      // FR-013: scanned PDF guard — fewer than 50 chars = image-only PDF
      if (extractedText.trim().length < 50) {
        return NextResponse.json(
          { error: 'This appears to be a scanned PDF. Please use a text-based PDF or fill the form manually.' },
          { status: 400 }
        )
      }
    } else if (resumeText && resumeText.trim()) {
      extractedText = resumeText.trim()
      resumeSource = 'text'
    } else {
      return NextResponse.json({ error: 'Missing resume or job description' }, { status: 400 })
    }

    // Basic resume length sanity check
    if (resumeSource === 'text' && extractedText.trim().length < 10) {
      return NextResponse.json(
        { error: 'Skills or experience input is too short. Please describe your actual skills and background.' },
        { status: 422 }
      )
    }

    // FR-009, FR-010: sanitize before AI call
    const sanitizedResume = sanitizeInput(extractedText)
    const sanitizedJob = sanitizeInput(jobDescription.trim())

    let analysis: Awaited<ReturnType<typeof analyzeSkillGap>>
    try {
      analysis = await analyzeSkillGap(sanitizedResume, sanitizedJob)
    } catch (aiError) {
      console.error('AI service error:', aiError)
      return NextResponse.json(
        { error: 'AI service unavailable. Please try again later.' },
        { status: 503 }
      )
    }

    // T028: Search for learning resources for missing skills via Tavily (ADR-003)
    // Graceful degradation: if ResourceSearchAgent fails, analysis is still saved
    let resources = null
    const missingSkills: string[] = analysis.missingSkills ?? []
    if (missingSkills.length > 0) {
      try {
        resources = await ResourceSearchAgent(missingSkills.slice(0, 4))
      } catch (err) {
        logger.warn({ event: 'resource_search_failed', userId, error: err })
        // continue without resources — do not fail the request
      }
    }

    // Save to DB including resources column (may be null)
    await prisma.skill_gaps.create({
      data: {
        clerkId: userId,
        resumeSource,
        resumeContent: extractedText,
        jobDescription: jobDescription.trim(),
        analysis: analysis as any,
        resources: resources as any ?? undefined
      }
    })
    revalidateTag(`dashboard-${userId}`, 'max')

    // Return analysis + resources (resources may be null — client handles gracefully)
    return NextResponse.json({ success: true, analysis: { ...analysis, resources } }, { status: 201 })

  } catch (error) {
    // CRITICAL: instanceof check passes through 401 from requireAuth()
    if (error instanceof NextResponse) return error
    console.error('Skill gap error:', error)
    return NextResponse.json({ error: 'Failed to process analysis' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    // Constitution Principle I (layer 2) + Principle II: userId from session only
    const userId = await requireAuth()

    const records = await prisma.skill_gaps.findMany({
      where: { clerkId: userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        resumeSource: true,
        jobDescription: true,
        analysis: true,
        createdAt: true
      }
    })

    return NextResponse.json({ success: true, data: records })

  } catch (error) {
    // CRITICAL: instanceof check passes through 401 from requireAuth()
    if (error instanceof NextResponse) return error
    console.error('Error fetching skill gaps:', error)
    return NextResponse.json({ error: 'Failed to fetch skill gap analyses' }, { status: 500 })
  }
}
