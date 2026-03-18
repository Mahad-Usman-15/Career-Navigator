import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'
import { prisma } from '@/lib/db'

// T023-T024: GET /api/dashboard
// FR-F01: single server request using parallel queries (Promise.all)
// FR-012: requireAuth() — 401 if no session
// FR-013: unified response — assessment + guidance + skillGap
// FR-014: null sections when no data (not an error)
// FR-014b: 500 if ANY query throws — all or nothing
// FR-015: response pre-shaped for direct dashboard consumption
export async function GET() {
  try {
    // Constitution Principle I (layer 2) + Principle II
    const userId = await requireAuth()

    // FR-F01: parallel queries — single server request
    const [assessment, guidance, skillGap] = await Promise.all([
      prisma.career_assessments.findUnique({ where: { clerkId: userId } }),
      prisma.career_guidance.findFirst({
        where: { clerkId: userId },
        orderBy: { generatedAt: 'desc' }
      }),
      prisma.skill_gaps.findFirst({
        where: { clerkId: userId },
        orderBy: { createdAt: 'desc' }
      })
    ])

    // T024: Shape response — pre-process for direct UI consumption (FR-015)
    const assessmentData = assessment ? {
      mbtiType: (assessment.personality as any)?.type ?? null,
      iqScore: (assessment.iq as any)?.iq_score ?? null,
      qualification: assessment.qualification,
      skills: assessment.skills
    } : null

    const guidanceData = guidance ? {
      topCareers: ((guidance.recommendations as any[]) ?? [])
        .slice(0, 3)
        .map((c: any) => ({
          title: c.title,
          matchScore: c.matchScore,
          marketOutlook: c.marketOutlook
        })),
      overallTimeline: guidance.overallTimeline,
      generatedAt: guidance.generatedAt
    } : null

    const skillGapData = skillGap ? {
      compatibilityScore: (skillGap.analysis as any)?.compatibilityScore ?? null,
      missingSkills: ((skillGap.analysis as any)?.missingSkills ?? []).slice(0, 5),
      matchingSkills: (skillGap.analysis as any)?.matchingSkills ?? [],
      analyzedAt: skillGap.createdAt
    } : null

    return NextResponse.json({
      assessment: assessmentData,
      guidance: guidanceData,
      skillGap: skillGapData
    })

  } catch (error) {
    // CRITICAL: instanceof check passes through 401 from requireAuth()
    if (error instanceof NextResponse) return error
    // FR-014b: any DB query failure = 500 for entire response
    console.error('Dashboard aggregation error:', error)
    return NextResponse.json(
      { error: 'Failed to load dashboard data. Please try again.' },
      { status: 500 }
    )
  }
}
