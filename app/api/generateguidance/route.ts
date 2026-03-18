import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'
import { prisma } from '@/lib/db'
import { generateCareerGuidance } from '@/lib/agents/CareerGuidanceAgent'
import { sanitizeInput } from '@/lib/sanitize'

// POST /api/generateguidance
// Constitution Principle I (layer 2): requireAuth() throws NextResponse 401
// Constitution Principle II: clerkId from session only
// Constitution Principle III: Zod validate before DB write; 503 on AI failure; 500 on DB failure
// FR-001: guidance generation starts automatically after assessment save
// FR-002: three-level AI fallback (handled inside CareerGuidanceAgent)
// FR-003: structural validation via Zod inside agent
// FR-004: user-friendly error on all-providers failure
// FR-005: deleteMany+create — every submission overwrites previous guidance
export async function POST() {
  try {
    const userId = await requireAuth()

    const assessment = await prisma.career_assessments.findUnique({
      where: { clerkId: userId }
    })
    if (!assessment) {
      return NextResponse.json(
        { error: 'Assessment required before generating guidance. Please complete your career assessment first.' },
        { status: 400 }
      )
    }

    // Sanitize free-text fields before passing to agent (FR-009, FR-010)
    const sanitizedAssessment = {
      ...assessment,
      qualification: sanitizeInput(assessment.qualification ?? ''),
      skills: {
        ...(assessment.skills as any),
        skills: Array.isArray((assessment.skills as any)?.skills)
          ? (assessment.skills as any).skills.map((s: string) => sanitizeInput(s))
          : []
      }
    }

    let guidance: Awaited<ReturnType<typeof generateCareerGuidance>>
    try {
      guidance = await generateCareerGuidance(sanitizedAssessment as any)
    } catch (aiError) {
      console.error('AI service error:', aiError)
      return NextResponse.json(
        { error: 'AI service unavailable. Please try again later.' },
        { status: 503 }
      )
    }

    // FR-005: delete previous guidance then create fresh — overwrites on re-submission
    await prisma.career_guidance.deleteMany({ where: { clerkId: userId } })

    const record = await prisma.career_guidance.create({
      data: {
        clerkId: userId,
        assessmentId: assessment.id,
        assessmentSnapshot: {
          mbtiType: (assessment.personality as any)?.type ?? null,
          iqScore: (assessment.iq as any)?.iq_score ?? null,
          qualification: assessment.qualification,
          skills: assessment.skills
        },
        recommendations: guidance.recommendations as any,
        overallTimeline: guidance.overallTimeline as any
      }
    })

    return NextResponse.json(
      { success: true, data: { recommendations: record.recommendations, overallTimeline: record.overallTimeline } },
      { status: 201 }
    )

  } catch (error) {
    // CRITICAL: instanceof check passes through 401 from requireAuth()
    if (error instanceof NextResponse) return error
    console.error('Generate guidance error:', error)
    return NextResponse.json({ error: 'Failed to save guidance. Please try again.' }, { status: 500 })
  }
}

// GET /api/generateguidance
// Returns most recently generated guidance
export async function GET() {
  try {
    const userId = await requireAuth()

    const guidance = await prisma.career_guidance.findFirst({
      where: { clerkId: userId },
      orderBy: { generatedAt: 'desc' }
    })

    if (!guidance) {
      return NextResponse.json(
        { error: 'No guidance found. Generate guidance first.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ guidance })

  } catch (error) {
    if (error instanceof NextResponse) return error
    console.error('Error fetching guidance:', error)
    return NextResponse.json({ error: 'Failed to fetch guidance.' }, { status: 500 })
  }
}
