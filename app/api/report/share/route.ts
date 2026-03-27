import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'
import { prisma } from '@/lib/db'
import { logger } from '@/lib/logger'

// T037: POST /api/report/share — generate a shareable token for the user's latest guidance
// Token is lazy-generated: if one already exists, return it. Idempotent.
export async function POST() {
  try {
    const userId = await requireAuth()

    const guidance = await prisma.career_guidance.findFirst({
      where: { clerkId: userId },
      orderBy: { generatedAt: 'desc' },
      select: { id: true, shareToken: true }
    })

    if (!guidance) {
      return NextResponse.json(
        { error: 'No career guidance found. Complete the assessment first.' },
        { status: 404 }
      )
    }

    // Return existing token if already set
    if (guidance.shareToken) {
      const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/report/${guidance.shareToken}`
      return NextResponse.json({ shareUrl })
    }

    // Generate new token
    const token = crypto.randomUUID()
    await prisma.career_guidance.update({
      where: { id: guidance.id },
      data: { shareToken: token }
    })

    logger.info({ event: 'share_token_generated', userId })

    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/report/${token}`
    return NextResponse.json({ shareUrl })

  } catch (error) {
    if (error instanceof NextResponse) return error
    logger.error({ event: 'share_token_error', error })
    return NextResponse.json({ error: 'Failed to generate share link.' }, { status: 500 })
  }
}
