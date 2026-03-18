import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'
import { prisma } from '@/lib/db'
import pdfParse from 'pdf-parse'
import { analyzeSkillGap } from '@/lib/agents/SkillAnalyzerAgent'
import { sanitizeInput } from '@/lib/sanitize'

// POST /api/skillgap
// Constitution Principle I (layer 2) + Principle II: userId from session only
// Constitution Principle III: Zod validate inside agent before DB write
// FR-009, FR-010: sanitizeInput() on all free-text fields
// FR-013: scanned PDF guard — fewer than 50 chars after trim → 400
export async function POST(req: NextRequest) {
  try {
    const userId = await requireAuth()

    const formData = await req.formData()
    const resumeFile = formData.get('resume') as File | null
    const resumeText = formData.get('resumeText') as string | null
    const jobDescription = formData.get('jobDescription') as string | null

    if (!jobDescription || !jobDescription.trim()) {
      return NextResponse.json({ error: 'Missing job description' }, { status: 400 })
    }

    let extractedText: string
    let resumeSource: string

    if (resumeFile && resumeFile.size > 0) {
      // PDF path — Constitution Principle IV: extract text, never store binary
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

    // Save to DB
    await prisma.skill_gaps.create({
      data: {
        clerkId: userId,
        resumeSource,
        resumeContent: extractedText,
        jobDescription: jobDescription.trim(),
        analysis: analysis as any
      }
    })

    // Return analysis at top level (not nested under data) — matches client expectation
    return NextResponse.json({ success: true, analysis }, { status: 201 })

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
