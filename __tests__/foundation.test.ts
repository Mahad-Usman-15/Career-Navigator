import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextResponse } from 'next/server'

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn()
}))

import { auth } from '@clerk/nextjs/server'
import { requireAuth } from '@/lib/auth-guard'
import { SkillGapAnalysisSchema } from '@/lib/schemas'

const mockAuth = vi.mocked(auth)

describe('requireAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns userId when session is valid', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_123' } as any)
    const userId = await requireAuth()
    expect(userId).toBe('user_123')
  })

  it('throws NextResponse 401 when auth() returns null userId', async () => {
    mockAuth.mockResolvedValue({ userId: null } as any)
    let thrown: unknown
    try {
      await requireAuth()
    } catch (e) {
      thrown = e
    }
    expect(thrown).toBeInstanceOf(NextResponse)
    const response = thrown as NextResponse
    expect(response.status).toBe(401)
    const body = await response.json()
    expect(body).toEqual({ error: 'Unauthorized' })
  })
})

describe('SkillGapAnalysisSchema', () => {
  const validAnalysis = {
    missingSkills: ['TypeScript', 'Docker'],
    matchingSkills: ['React', 'Node.js'],
    recommendations: 'Focus on learning TypeScript and containerization.',
    compatibilityScore: 72,
    suggestedRoadmap: [
      { step: 'Learn TypeScript basics', resource: 'typescriptlang.org' },
      { step: 'Docker fundamentals', resource: 'docs.docker.com' }
    ]
  }

  it('returns success:true on valid shape', () => {
    const result = SkillGapAnalysisSchema.safeParse(validAnalysis)
    expect(result.success).toBe(true)
  })

  it('returns success:false when compatibilityScore is missing', () => {
    const { compatibilityScore, ...withoutScore } = validAnalysis
    const result = SkillGapAnalysisSchema.safeParse(withoutScore)
    expect(result.success).toBe(false)
  })

  it('returns success:false when compatibilityScore is out of range', () => {
    const result = SkillGapAnalysisSchema.safeParse({ ...validAnalysis, compatibilityScore: 150 })
    expect(result.success).toBe(false)
  })

  it('returns success:false when missingSkills is not an array', () => {
    const result = SkillGapAnalysisSchema.safeParse({ ...validAnalysis, missingSkills: 'Python' })
    expect(result.success).toBe(false)
  })
})
