import { describe, it, expect, vi, beforeEach, afterEach, afterAll, beforeAll } from 'vitest'
import { NextRequest } from 'next/server'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

// Mock Prisma client
vi.mock('@/lib/db', () => ({
  prisma: {
    skill_gaps: {
      create: vi.fn(),
      findMany: vi.fn()
    }
  }
}))

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn()
}))

// Mock pdf-parse — PDFParse class with getText() method
const mockGetText = vi.hoisted(() => vi.fn())
vi.mock('pdf-parse', () => {
  function MockPDFParse() { this.getText = mockGetText }
  return { PDFParse: MockPDFParse }
})

// Mock SkillAnalyzerAgent — avoids real Groq/Gemini calls in tests
vi.mock('@/lib/agents/SkillAnalyzerAgent', () => ({
  analyzeSkillGap: vi.fn()
}))

import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'
import { analyzeSkillGap } from '@/lib/agents/SkillAnalyzerAgent'
import { POST, GET } from '@/app/api/skillgap/route'

const mockAuth = vi.mocked(auth)
const mockCreate = vi.mocked(prisma.skill_gaps.create)
const mockFindMany = vi.mocked(prisma.skill_gaps.findMany)
const mockAnalyzeSkillGap = vi.mocked(analyzeSkillGap)

const validAIResponse = {
  missingSkills: ['TypeScript', 'Docker'],
  matchingSkills: ['React', 'Node.js'],
  recommendations: 'Learn TypeScript and Docker.',
  compatibilityScore: 72,
  suggestedRoadmap: [
    { step: 'Learn TypeScript', resource: 'typescriptlang.org' }
  ]
}

// MSW server to intercept Gemini API calls
const server = setupServer()

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

function makeTextFormData(resumeText: string, jobDescription: string) {
  const formData = new FormData()
  formData.append('resumeText', resumeText)
  formData.append('jobDescription', jobDescription)
  return new NextRequest('http://localhost/api/skillgap', {
    method: 'POST',
    body: formData
  })
}

function makePdfFormData(jobDescription: string, pdfContent = 'fake-pdf-content') {
  const formData = new FormData()
  const blob = new Blob([pdfContent], { type: 'application/pdf' })
  formData.append('resume', blob, 'resume.pdf')
  formData.append('jobDescription', jobDescription)
  return new NextRequest('http://localhost/api/skillgap', {
    method: 'POST',
    body: formData
  })
}

// Helper: mock Gemini to return valid AI response
function mockGeminiSuccess() {
  server.use(
    http.post(/generativelanguage\.googleapis\.com/, () => {
      return HttpResponse.json({
        candidates: [{
          content: {
            parts: [{ text: JSON.stringify(validAIResponse) }]
          }
        }]
      })
    })
  )
}

// Helper: mock Gemini to return network error
function mockGeminiError() {
  server.use(
    http.post(/generativelanguage\.googleapis\.com/, () => {
      return HttpResponse.error()
    })
  )
}

// Helper: mock Gemini to return valid JSON but wrong shape
function mockGeminiBadShape() {
  server.use(
    http.post(/generativelanguage\.googleapis\.com/, () => {
      return HttpResponse.json({
        candidates: [{
          content: {
            parts: [{ text: JSON.stringify({ wrongField: 'bad' }) }]
          }
        }]
      })
    })
  )
}

describe('POST /api/skillgap', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when no session', async () => {
    mockAuth.mockResolvedValue({ userId: null } as any)
    const req = makeTextFormData('my resume', 'job description')
    const res = await POST(req)
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('Unauthorized')
  })

  it('returns 400 when no resume and no resumeText', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_abc' } as any)
    const formData = new FormData()
    formData.append('jobDescription', 'Software Engineer')
    const req = new NextRequest('http://localhost/api/skillgap', { method: 'POST', body: formData })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 when jobDescription is missing', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_abc' } as any)
    const formData = new FormData()
    formData.append('resumeText', 'My resume content')
    const req = new NextRequest('http://localhost/api/skillgap', { method: 'POST', body: formData })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 when PDF text extraction yields empty string', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_abc' } as any)
    mockGetText.mockResolvedValue({ text: '   ' } as any)
    const req = makePdfFormData('Software Engineer role')
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toContain('text-based PDF')
  })

  it('returns 201 on text path with valid AI response', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_abc' } as any)
    mockCreate.mockResolvedValue({ id: 'gap_1' } as any)
    mockAnalyzeSkillGap.mockResolvedValue(validAIResponse as any)
    const req = makeTextFormData('React developer with 3 years experience', 'Senior React Engineer')
    const res = await POST(req)
    expect(res.status).toBe(201)
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          clerkId: 'user_abc',
          resumeSource: 'text'
        })
      })
    )
    // Verify no name field in create call (H1 fix)
    const createCall = mockCreate.mock.calls[0][0] as any
    expect(createCall.data).not.toHaveProperty('name')
  })

  it('returns 201 on PDF path with valid AI response', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_abc' } as any)
    mockGetText.mockResolvedValue({ text: 'React developer experience with lots of content here so over 50 chars' } as any)
    mockCreate.mockResolvedValue({ id: 'gap_2' } as any)
    mockAnalyzeSkillGap.mockResolvedValue(validAIResponse as any)
    const req = makePdfFormData('Senior React Engineer')
    const res = await POST(req)
    expect(res.status).toBe(201)
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          clerkId: 'user_abc',
          resumeSource: 'pdf'
        })
      })
    )
  })

  it('returns 503 and does not call DB when AI is down', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_abc' } as any)
    mockAnalyzeSkillGap.mockRejectedValue(new Error('All AI providers failed'))
    const req = makeTextFormData('my resume', 'job description')
    const res = await POST(req)
    expect(res.status).toBe(503)
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('returns 503 and does not call DB when AI returns bad shape', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_abc' } as any)
    mockAnalyzeSkillGap.mockRejectedValue(new Error('Validation failed'))
    const req = makeTextFormData('my resume', 'job description')
    const res = await POST(req)
    expect(res.status).toBe(503)
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('returns 500 when DB create throws after valid AI response', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_abc' } as any)
    mockCreate.mockRejectedValue(new Error('DB connection lost'))
    mockAnalyzeSkillGap.mockResolvedValue(validAIResponse as any)
    const req = makeTextFormData('my resume', 'job description')
    const res = await POST(req)
    expect(res.status).toBe(500)
  })
})

describe('GET /api/skillgap', () => {
  function makeGetRequest() {
    return new NextRequest('http://localhost/api/skillgap', { method: 'GET' })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when no session', async () => {
    mockAuth.mockResolvedValue({ userId: null } as any)
    const res = await GET(makeGetRequest())
    expect(res.status).toBe(401)
  })

  it('returns 200 with array of records ordered by createdAt desc', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_abc' } as any)
    const records = [
      { id: 'gap_2', createdAt: new Date('2026-03-15') },
      { id: 'gap_1', createdAt: new Date('2026-03-14') }
    ]
    mockFindMany.mockResolvedValue(records as any)
    const res = await GET(makeGetRequest())
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data).toHaveLength(2)
    expect(body.data[0].id).toBe('gap_2')
  })

  it('returns 200 with empty array when no records exist', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_abc' } as any)
    mockFindMany.mockResolvedValue([])
    const res = await GET(makeGetRequest())
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data).toEqual([])
  })

  it('queries by session userId only (not request params)', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_abc' } as any)
    mockFindMany.mockResolvedValue([])
    await GET(makeGetRequest())
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { clerkId: 'user_abc' } })
    )
  })

  it('returns 500 when DB findMany throws', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_abc' } as any)
    mockFindMany.mockRejectedValue(new Error('DB connection lost'))
    const res = await GET(makeGetRequest())
    expect(res.status).toBe(500)
  })
})

describe('US3 - cross-user isolation (skill gap)', () => {
  it('GET as userA does not return userB data', async () => {
    const userBRecords = [{ id: 'gap_b', clerkId: 'user_b' }]

    mockAuth.mockResolvedValue({ userId: 'user_a' } as any)
    mockFindMany.mockImplementation(async ({ where }: any) => {
      if (where.clerkId === 'user_a') return []  // userA has no records
      return userBRecords                          // userB has records
    })

    const res = await GET(new NextRequest('http://localhost/api/skillgap', { method: 'GET' }))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data).toEqual([])  // userA sees empty, not userB's data

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { clerkId: 'user_a' } })
    )
    expect(mockFindMany).not.toHaveBeenCalledWith(
      expect.objectContaining({ where: { clerkId: 'user_b' } })
    )
  })
})
