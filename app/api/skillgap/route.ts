import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'
import { prisma } from '@/lib/db'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse') as (buf: Buffer) => Promise<{ text: string }>
import { analyzeSkillGap } from '@/lib/agents/SkillAnalyzerAgent'
import { sanitizeInput } from '@/lib/sanitize'

// Input guardrail — detects gibberish before sending to AI
function isGibberish(text: string): boolean {
  const t = text.trim().toLowerCase()
  if (t.length < 5) return true
  const noSpaces = t.replace(/\s+/g, '')
  // Character diversity: unique chars / total chars — "mmmmm" = 1/5 = 0.2, fail at < 0.15
  const diversity = new Set(noSpaces).size / noSpaces.length
  if (diversity < 0.15) return true
  // Vowel ratio: real language always has vowels
  const vowels = (t.match(/[aeiou]/g) || []).length
  if (noSpaces.length > 0 && vowels / noSpaces.length < 0.05) return true
  // At least 2 real words (2+ chars)
  const realWords = t.split(/\s+/).filter(w => w.length >= 2)
  if (realWords.length < 2) return true
  return false
}

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

    // Input guardrail — reject gibberish before reaching AI
    if (jobDescription.trim().length < 100) {
      return NextResponse.json(
        { error: 'Job description is too short. Please paste the full job posting (at least 100 characters).' },
        { status: 422 }
      )
    }
    if (isGibberish(jobDescription)) {
      return NextResponse.json(
        { error: 'Job description does not appear to be a real job posting. Please paste an actual job description.' },
        { status: 422 }
      )
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

    // Input guardrail — reject gibberish resume/skills text
    if (resumeSource === 'text' && isGibberish(extractedText)) {
      return NextResponse.json(
        { error: 'Skills or experience input does not appear to be meaningful. Please describe your actual skills and background.' },
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
