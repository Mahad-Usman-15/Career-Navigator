import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'
import { prisma } from '@/lib/db'
import { logger } from '@/lib/logger'

const CACHE_TTL_MS = 6 * 60 * 60 * 1000 // 6 hours

// GET /api/jobs — returns job listings for user's top career path
// ADR-004: JSearch (RapidAPI) with job_cache (6-hour TTL)
// Graceful degradation: returns empty array with message if API fails
export async function GET() {
  try {
    const userId = await requireAuth()

    const guidance = await prisma.career_guidance.findFirst({
      where: { clerkId: userId },
      orderBy: { generatedAt: 'desc' },
      select: { recommendations: true }
    })

    if (!guidance?.recommendations) {
      return NextResponse.json({
        success: true,
        listings: [],
        message: 'Complete the career assessment first to see job listings.'
      })
    }

    const recs = guidance.recommendations as Array<{ title?: string }>
    const topCareer = recs[0]?.title ?? ''
    if (!topCareer) {
      return NextResponse.json({ success: true, listings: [], message: 'No career paths found.' })
    }

    // Check cache
    const cached = await prisma.job_cache.findUnique({ where: { careerPathTitle: topCareer } })
    const isStale = !cached || (Date.now() - new Date(cached.fetchedAt).getTime()) > CACHE_TTL_MS

    if (!isStale && cached) {
      return NextResponse.json({ success: true, listings: cached.listings, source: 'cache' })
    }

    const apiKey = process.env.RAPIDAPI_KEY
    if (!apiKey || apiKey.includes('YOUR_')) {
      logger.warn({ event: 'jobs_jsearch_not_configured', userId })
      return NextResponse.json({
        success: true,
        listings: [],
        message: 'Job listings are not configured yet. Check back soon.'
      })
    }

    const query = encodeURIComponent(`${topCareer} in Pakistan`)
    const url = `https://jsearch.p.rapidapi.com/search?query=${query}&num_pages=1&page=1`

    let listings: unknown[] = []
    try {
      const res = await fetch(url, {
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
        },
        next: { revalidate: 0 }
      })
      if (!res.ok) throw new Error(`JSearch returned ${res.status}`)
      const data = await res.json()

      listings = (data.data ?? []).slice(0, 10).map((job: {
        job_title?: string
        employer_name?: string
        job_city?: string
        job_country?: string
        job_apply_link?: string
        job_description?: string
        job_min_salary?: number
        job_max_salary?: number
        job_salary_currency?: string
        job_employment_type?: string
      }) => ({
        title: job.job_title,
        company: job.employer_name,
        location: [job.job_city, job.job_country].filter(Boolean).join(', '),
        salary: job.job_min_salary
          ? `${job.job_salary_currency ?? 'PKR'} ${Math.round((job.job_min_salary + (job.job_max_salary ?? job.job_min_salary)) / 2).toLocaleString()}`
          : null,
        type: job.job_employment_type ?? null,
        url: job.job_apply_link,
        description: job.job_description?.slice(0, 200),
      }))
    } catch (err) {
      logger.warn({ event: 'jobs_jsearch_fetch_failed', userId, error: err })
      if (cached) {
        return NextResponse.json({ success: true, listings: cached.listings, source: 'stale_cache' })
      }
      return NextResponse.json({
        success: true,
        listings: [],
        message: 'Job listings temporarily unavailable. Try again later.'
      })
    }

    // Upsert cache
    await prisma.job_cache.upsert({
      where: { careerPathTitle: topCareer },
      update: { listings: listings as any, fetchedAt: new Date() },
      create: { careerPathTitle: topCareer, listings: listings as any }
    })

    return NextResponse.json({ success: true, listings, source: 'live' })

  } catch (error) {
    if (error instanceof NextResponse) return error
    logger.error({ event: 'jobs_error', error })
    return NextResponse.json({ error: 'Failed to fetch job listings' }, { status: 500 })
  }
}
