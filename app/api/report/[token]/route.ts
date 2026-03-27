import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { logger } from '@/lib/logger'

// T038: GET /api/report/[token] — public, no auth required
// Returns career guidance + skill gap summary for a shared report
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Invalid token.' }, { status: 400 })
    }

    const guidance = await prisma.career_guidance.findUnique({
      where: { shareToken: token },
      select: {
        clerkId: true,
        recommendations: true,
        overallTimeline: true,
        generatedAt: true
      }
    })

    if (!guidance) {
      return NextResponse.json({ error: 'Report not found or link has expired.' }, { status: 404 })
    }

    // Fetch latest skill gap for the same user (public summary only)
    const skillGap = await prisma.skill_gaps.findFirst({
      where: { clerkId: guidance.clerkId },
      orderBy: { createdAt: 'desc' },
      select: { analysis: true, createdAt: true }
    })

    const topCareers = ((guidance.recommendations ?? []) as Array<{
      title?: string
      matchScore?: number
      marketOutlook?: string
    }>)
      .slice(0, 3)
      .map(c => ({ title: c.title, matchScore: c.matchScore, marketOutlook: c.marketOutlook }))

    const skillGapSummary = skillGap ? {
      compatibilityScore: (skillGap.analysis as any)?.compatibilityScore ?? null,
      missingSkills: ((skillGap.analysis as any)?.missingSkills ?? []).slice(0, 5),
      matchingSkills: ((skillGap.analysis as any)?.matchingSkills ?? []).slice(0, 5),
      analyzedAt: skillGap.createdAt
    } : null

    return NextResponse.json({
      topCareers,
      overallTimeline: guidance.overallTimeline,
      generatedAt: guidance.generatedAt,
      skillGap: skillGapSummary
    })

  } catch (error) {
    logger.error({ event: 'report_fetch_error', error })
    return NextResponse.json({ error: 'Failed to load report.' }, { status: 500 })
  }
}
