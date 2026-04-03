import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextResponse } from 'next/server'

// Sliding window: 10 AI requests per userId per 60 minutes (SC-010, ADR-002)
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '60 m'),
  analytics: false,
})

/**
 * checkRateLimit — call at the top of any AI-powered API route, after requireAuth().
 * Throws a NextResponse 429 if the user has exceeded their hourly quota.
 *
 * Caller must re-throw via: if (error instanceof NextResponse) return error
 */
export async function checkRateLimit(userId: string): Promise<void> {
  const { success, limit, remaining, reset } = await ratelimit.limit(userId)
  if (!success) {
    throw NextResponse.json(
      {
        error: 'Too many requests. You have reached the limit of 10 AI requests per hour. Please try again later.',
        limit,
        remaining: 0,
        resetAt: new Date(reset).toISOString(),
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': String(limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(reset),
          'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)),
        },
      }
    )
  }
}

// Sliding window: 3 demo requests per IP per 60 minutes
const demoRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, '60 m'),
  analytics: false,
})

/**
 * IP-based rate limit for the public demo endpoint. 3 requests per hour per IP.
 * Throws NextResponse 429 on limit exceeded.
 * Caller must re-throw via: if (error instanceof NextResponse) return error
 */
export async function checkDemoRateLimit(ip: string): Promise<void> {
  const { success, reset } = await demoRatelimit.limit(`demo-ip:${ip}`)
  if (!success) {
    throw NextResponse.json(
      {
        error: 'Demo limit reached. Create a free account for unlimited access.',
        resetAt: new Date(reset).toISOString(),
      },
      { status: 429 }
    )
  }
}
