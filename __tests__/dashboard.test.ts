import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock Prisma client
vi.mock('@/lib/db', () => ({
  prisma: {
    career_assessments: {
      findUnique: vi.fn()
    },
    career_guidance: {
      findFirst: vi.fn()
    },
    skill_gaps: {
      findFirst: vi.fn()
    }
  }
}))

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn()
}))

import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'
import { GET } from '@/app/api/dashboard/route'

const mockAuth = vi.mocked(auth)
const mockFindAssessment = vi.mocked(prisma.career_assessments.findUnique)
const mockFindGuidance = vi.mocked(prisma.career_guidance.findFirst)
const mockFindSkillGap = vi.mocked(prisma.skill_gaps.findFirst)

const mockAssessment = {
  id: 'assess_1',
  clerkId: 'user_abc',
  personality: { type: 'INTJ' },
  iq: { iq_score: 125 },
  qualification: 'Intermediate',
  skills: ['Python', 'Problem Solving']
}

const mockGuidance = {
  id: 'guid_1',
  clerkId: 'user_abc',
  recommendations: [
    { title: 'Software Engineer', matchScore: 87, marketOutlook: 'High demand in Karachi.', reasoning: 'r1', roadmap: [] },
    { title: 'Data Scientist', matchScore: 82, marketOutlook: 'Growing in fintech.', reasoning: 'r2', roadmap: [] },
    { title: 'Systems Analyst', matchScore: 74, marketOutlook: 'Steady in banking.', reasoning: 'r3', roadmap: [] },
    { title: 'Product Manager', matchScore: 70, marketOutlook: 'Emerging in startups.', reasoning: 'r4', roadmap: [] }
  ],
  overallTimeline: { shortTermGoal: 'Get internship', longTermGoal: 'Senior engineer' },
  generatedAt: new Date('2026-03-16T10:00:00.000Z')
}

const mockSkillGap = {
  id: 'gap_1',
  clerkId: 'user_abc',
  analysis: {
    compatibilityScore: 68,
    missingSkills: ['Docker', 'SQL', 'System Design', 'REST APIs', 'Cloud', 'Kubernetes'],
    matchingSkills: ['Python', 'Problem Solving']
  },
  createdAt: new Date('2026-03-16T09:30:00.000Z')
}

function makeGetRequest() {
  return new NextRequest('http://localhost/api/dashboard', { method: 'GET' })
}

describe('GET /api/dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // T018: 401 when no session
  it('returns 401 when no session', async () => {
    mockAuth.mockResolvedValue({ userId: null } as any)
    const res = await GET(makeGetRequest())
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('Unauthorized')
  })

  // T019: 200 with all 3 sections populated
  it('returns 200 with all sections populated and pre-shaped data', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_abc' } as any)
    mockFindAssessment.mockResolvedValue(mockAssessment as any)
    mockFindGuidance.mockResolvedValue(mockGuidance as any)
    mockFindSkillGap.mockResolvedValue(mockSkillGap as any)

    const res = await GET(makeGetRequest())
    expect(res.status).toBe(200)
    const body = await res.json()

    // Assessment section
    expect(body.assessment.mbtiType).toBe('INTJ')
    expect(body.assessment.iqScore).toBe(125)

    // Guidance section — topCareers sliced to 3
    expect(body.guidance.topCareers).toHaveLength(3)
    expect(body.guidance.topCareers[0].title).toBe('Software Engineer')
    expect(body.guidance.topCareers[0]).toHaveProperty('matchScore')
    expect(body.guidance.topCareers[0]).toHaveProperty('marketOutlook')

    // Skill gap section — missingSkills sliced to 5
    expect(body.skillGap.compatibilityScore).toBe(68)
    expect(body.skillGap.missingSkills).toHaveLength(5)
    expect(body.skillGap.matchingSkills).toContain('Python')
  })

  // T020: 200 with all null sections
  it('returns 200 with null sections when student has no data', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_abc' } as any)
    mockFindAssessment.mockResolvedValue(null)
    mockFindGuidance.mockResolvedValue(null)
    mockFindSkillGap.mockResolvedValue(null)

    const res = await GET(makeGetRequest())
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.assessment).toBeNull()
    expect(body.guidance).toBeNull()
    expect(body.skillGap).toBeNull()
  })

  // T021: cross-user isolation
  it('returns only the requesting user data (cross-user isolation)', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_b' } as any)
    mockFindAssessment.mockImplementation(async ({ where }: any) => {
      if (where.clerkId === 'user_b') return null
      return mockAssessment
    })
    mockFindGuidance.mockImplementation(async ({ where }: any) => {
      if (where.clerkId === 'user_b') return null
      return mockGuidance
    })
    mockFindSkillGap.mockImplementation(async ({ where }: any) => {
      if (where.clerkId === 'user_b') return null
      return mockSkillGap
    })

    const res = await GET(makeGetRequest())
    expect(res.status).toBe(200)
    const body = await res.json()
    // user_b has no data — all null, not user_a's data
    expect(body.assessment).toBeNull()
    expect(body.guidance).toBeNull()
    expect(body.skillGap).toBeNull()

    // All queries used user_b's clerkId
    expect(mockFindAssessment).toHaveBeenCalledWith(
      expect.objectContaining({ where: { clerkId: 'user_b' } })
    )
  })

  // T022: 500 when any query throws
  it('returns 500 when any table query throws (all-or-nothing, FR-014b)', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_abc' } as any)
    mockFindAssessment.mockResolvedValue(mockAssessment as any)
    mockFindGuidance.mockRejectedValue(new Error('DB connection lost'))
    mockFindSkillGap.mockResolvedValue(null)

    const res = await GET(makeGetRequest())
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error).toBeDefined()
  })
})
