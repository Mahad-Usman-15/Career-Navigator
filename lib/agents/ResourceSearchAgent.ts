import { tavily } from '@tavily/core'
import { logger } from '@/lib/logger'

export interface VideoRec {
  title: string
  url: string
  channel?: string
}

export interface CourseRec {
  title: string
  url: string
  platform?: string
  isFree?: boolean
}

export interface ResourceSearchResult {
  videos: VideoRec[]
  courses: CourseRec[]
}

// ADR-003: Tavily-based resource discovery for missing skills
// Returns null on any failure — skill gap analysis continues without resources
export async function ResourceSearchAgent(
  missingSkills: string[]
): Promise<ResourceSearchResult | null> {
  if (!process.env.TAVILY_API_KEY) {
    logger.warn({ event: 'resource_search_skip', reason: 'TAVILY_API_KEY not set' })
    return null
  }

  if (!missingSkills || missingSkills.length === 0) return null

  const client = tavily({ apiKey: process.env.TAVILY_API_KEY })

  // Focus on top 3 missing skills to stay within free tier (1000 searches/month)
  const topSkills = missingSkills.slice(0, 3)

  const videos: VideoRec[] = []
  const courses: CourseRec[] = []

  for (const skill of topSkills) {
    try {
      // Video search: target YouTube tutorials
      const videoSearch = await client.search(
        `${skill} tutorial for beginners site:youtube.com`,
        { maxResults: 2, searchDepth: 'basic', includeAnswer: false }
      )

      for (const r of videoSearch.results ?? []) {
        if (r.url && r.title && videos.length < 6) {
          const channel = r.url.includes('youtube.com') ? extractYouTubeChannel(r.url, r.content ?? '') : undefined
          videos.push({ title: r.title, url: r.url, channel })
        }
      }
    } catch (err) {
      logger.warn({ event: 'resource_search_video_fail', skill, error: err })
    }

    try {
      // Course search: target free learning platforms
      const courseSearch = await client.search(
        `${skill} free course OR tutorial site:coursera.org OR site:freecodecamp.org OR site:udemy.com OR site:khan academy`,
        { maxResults: 2, searchDepth: 'basic', includeAnswer: false }
      )

      for (const r of courseSearch.results ?? []) {
        if (r.url && r.title && courses.length < 6) {
          const platform = extractPlatform(r.url)
          const isFree = platform === 'freeCodeCamp' || platform === 'Khan Academy' || r.title.toLowerCase().includes('free')
          courses.push({ title: r.title, url: r.url, platform, isFree })
        }
      }
    } catch (err) {
      logger.warn({ event: 'resource_search_course_fail', skill, error: err })
    }
  }

  return { videos, courses }
}

function extractYouTubeChannel(url: string, content: string): string | undefined {
  try {
    const match = content.match(/by ([A-Za-z0-9 ]+) ·/) ?? content.match(/— ([A-Za-z0-9 ]+)/)
    return match?.[1]?.trim()
  } catch {
    return undefined
  }
}

function extractPlatform(url: string): string | undefined {
  if (url.includes('coursera.org')) return 'Coursera'
  if (url.includes('udemy.com')) return 'Udemy'
  if (url.includes('freecodecamp.org')) return 'freeCodeCamp'
  if (url.includes('khanacademy.org')) return 'Khan Academy'
  if (url.includes('youtube.com')) return 'YouTube'
  if (url.includes('edx.org')) return 'edX'
  if (url.includes('pluralsight.com')) return 'Pluralsight'
  return undefined
}
