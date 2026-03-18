import { describe, it, expect, vi, beforeEach, afterEach, afterAll, beforeAll } from 'vitest'
import { NextRequest } from 'next/server'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

// Mock Prisma client
vi.mock('@/lib/db', () => ({
  prisma: {
    career_assessments: {
      findUnique: vi.fn()
    },
    career_guidance: {
      create: vi.fn(),
      findFirst: vi.fn(),
      deleteMany: vi.fn().mockResolvedValue({ count: 0 })
    }
  }
}))

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn()
}))

// Mock CareerGuidanceAgent — avoids real Groq/Gemini calls in tests
vi.mock('@/lib/agents/CareerGuidanceAgent', () => ({
  generateCareerGuidance: vi.fn()
}))

import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'
import { generateCareerGuidance } from '@/lib/agents/CareerGuidanceAgent'
import { POST, GET } from '@/app/api/generateguidance/route'

const mockAuth = vi.mocked(auth)
const mockFindUnique = vi.mocked(prisma.career_assessments.findUnique)
const mockCreate = vi.mocked(prisma.career_guidance.create)
const mockFindFirst = vi.mocked(prisma.career_guidance.findFirst)
const mockGenerateGuidance = vi.mocked(generateCareerGuidance)

const mockAssessment = {
  id: 'assess_1',
  clerkId: 'user_abc',
  personality: { type: 'INTJ' },
  iq: { iq_score: 125 },
  qualification: 'Intermediate',
  skills: { skills: ['Python', 'Problem Solving'] }
}

const validAIResponse = {
  recommendations: [
    {
      title: 'Software Engineer',
      matchScore: 87,
      reasoning: 'Your INTJ personality suits structured problem-solving roles.',
      marketOutlook: 'High demand in Karachi tech sector.',
      roadmap: [{ title: 'Learn Python', description: 'Complete CS50P', duration: '2 months', resources: [] }]
    },
    {
      title: 'Data Scientist',
      matchScore: 82,
      reasoning: 'High IQ and analytical skills.',
      marketOutlook: 'Growing in Pakistan fintech.',
      roadmap: [{ title: 'Learn ML', description: 'Coursera ML', duration: '3 months' }]
    },
    {
      title: 'Systems Analyst',
      matchScore: 74,
      reasoning: 'Strong logical reasoning.',
      marketOutlook: 'Steady demand in banking.',
      roadmap: [{ title: 'Learn SQL', description: 'Mode analytics', duration: '1 month' }]
    }
  ],
  overallTimeline: {
    shortTermGoal: 'Secure an internship within 6 months',
    longTermGoal: 'Become a senior engineer within 3-5 years'
  }
}

const mockGuidanceRecord = {
  id: 'guid_1',
  clerkId: 'user_abc',
  assessmentId: 'assess_1',
  assessmentSnapshot: { mbtiType: 'INTJ', iqScore: 125, qualification: 'Intermediate', skills: ['Python'] },
  recommendations: validAIResponse.recommendations,
  overallTimeline: validAIResponse.overallTimeline,
  generatedAt: new Date('2026-03-16T10:00:00.000Z'),
  createdAt: new Date('2026-03-16T10:00:00.000Z'),
  updatedAt: new Date('2026-03-16T10:00:00.000Z')
}

// MSW server to intercept Gemini API calls
const server = setupServer()

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => { server.resetHandlers(); vi.clearAllMocks() })
afterAll(() => server.close())

function mockGeminiSuccess() {
  server.use(
    http.post(/generativelanguage\.googleapis\.com/, () => {
      return HttpResponse.json({
        candidates: [{
          content: { parts: [{ text: JSON.stringify(validAIResponse) }] }
        }]
      })
    })
  )
}

function mockGeminiError() {
  server.use(
    http.post(/generativelanguage\.googleapis\.com/, () => HttpResponse.error())
  )
}

function mockGeminiBadShape() {
  server.use(
    http.post(/generativelanguage\.googleapis\.com/, () => {
      return HttpResponse.json({
        candidates: [{
          content: { parts: [{ text: JSON.stringify({ wrong: 'shape' }) }] }
        }]
      })
    })
  )
}

function makePostRequest() {
  return new NextRequest('http://localhost/api/generateguidance', { method: 'POST' })
}

function makeGetRequest() {
  return new NextRequest('http://localhost/api/generateguidance', { method: 'GET' })
}

// ─── POST /api/generateguidance ─────────────────────────────────────────────

describe('POST /api/generateguidance', () => {
  // T007: 401 when no session
  it('returns 401 when no session', async () => {
    mockAuth.mockResolvedValue({ userId: null } as any)
    const res = await POST(makePostRequest())
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('Unauthorized')
  })

  // T008: 400 when no assessment record
  it('returns 400 when user has no completed assessment', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_abc' } as any)
    mockFindUnique.mockResolvedValue(null)
    const res = await POST(makePostRequest())
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/assessment/i)
  })

  // T009: 503 when AI throws
  it('returns 503 and does not call DB when AI is down', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_abc' } as any)
    mockFindUnique.mockResolvedValue(mockAssessment as any)
    mockGenerateGuidance.mockRejectedValue(new Error('All AI providers failed'))
    const res = await POST(makePostRequest())
    expect(res.status).toBe(503)
    expect(mockCreate).not.toHaveBeenCalled()
  })

  // T010: 503 when AI returns malformed response (agent throws ZodError)
  it('returns 503 and does not call DB when AI returns malformed response', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_abc' } as any)
    mockFindUnique.mockResolvedValue(mockAssessment as any)
    mockGenerateGuidance.mockRejectedValue(new Error('Validation failed'))
    const res = await POST(makePostRequest())
    expect(res.status).toBe(503)
    expect(mockCreate).not.toHaveBeenCalled()
  })

  // T011: 500 when DB write fails after valid AI response
  it('returns 500 when DB write fails after valid AI response', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_abc' } as any)
    mockFindUnique.mockResolvedValue(mockAssessment as any)
    mockGenerateGuidance.mockResolvedValue(validAIResponse as any)
    mockCreate.mockRejectedValue(new Error('DB connection lost'))
    const res = await POST(makePostRequest())
    expect(res.status).toBe(500)
  })

  // T012: 201 happy path
  it('returns 201 with guidance record on happy path', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_abc' } as any)
    mockFindUnique.mockResolvedValue(mockAssessment as any)
    mockGenerateGuidance.mockResolvedValue(validAIResponse as any)
    mockCreate.mockResolvedValue(mockGuidanceRecord as any)
    const res = await POST(makePostRequest())
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.data).toBeDefined()
    expect(body.data.recommendations).toBeDefined()
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          clerkId: 'user_abc',
          assessmentId: 'assess_1'
        })
      })
    )
  })
})

// ─── GET /api/generateguidance ──────────────────────────────────────────────

describe('GET /api/generateguidance', () => {
  // T032: 401 when no session
  it('returns 401 when no session', async () => {
    mockAuth.mockResolvedValue({ userId: null } as any)
    const res = await GET(makeGetRequest())
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('Unauthorized')
  })

  // T033: 404 when no guidance record
  it('returns 404 when no guidance found', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_abc' } as any)
    mockFindFirst.mockResolvedValue(null)
    const res = await GET(makeGetRequest())
    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body.error).toMatch(/no guidance/i)
  })

  // T034: 200 returns most recent guidance
  it('returns 200 with most recently generated guidance', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_abc' } as any)
    mockFindFirst.mockResolvedValue(mockGuidanceRecord as any)
    const res = await GET(makeGetRequest())
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.guidance).toBeDefined()
    expect(body.guidance.id).toBe('guid_1')
    expect(mockFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { clerkId: 'user_abc' },
        orderBy: { generatedAt: 'desc' }
      })
    )
  })

  // T035: cross-user isolation
  it('returns 404 for userB when only userA has guidance (cross-user isolation)', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_b' } as any)
    mockFindFirst.mockImplementation(async ({ where }: any) => {
      if (where.clerkId === 'user_b') return null
      return mockGuidanceRecord // user_a has guidance
    })
    const res = await GET(makeGetRequest())
    expect(res.status).toBe(404)
    expect(mockFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { clerkId: 'user_b' } })
    )
    expect(mockFindFirst).not.toHaveBeenCalledWith(
      expect.objectContaining({ where: { clerkId: 'user_abc' } })
    )
  })
})
