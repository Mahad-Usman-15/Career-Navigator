import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

// Mock Prisma client
vi.mock('@/lib/db', () => ({
  prisma: {
    career_assessments: {
      upsert: vi.fn(),
      findUnique: vi.fn()
    }
  }
}))

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn()
}))

import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'
import { POST, GET } from '@/app/api/career-assessment/route'

const mockAuth = vi.mocked(auth)
const mockUpsert = vi.mocked(prisma.career_assessments.upsert)
const mockFindUnique = vi.mocked(prisma.career_assessments.findUnique)

const validPayload = {
  name: 'Ahmed Khan',
  email: 'ahmed@example.com',
  age: 20,
  current_qualification: 'Under Graduate',
  mbtiAnswers: { ei1: 0, ei2: 1, sn1: 0, sn2: 1, tf1: 0, tf2: 1, jp1: 0, jp2: 1 },
  iqAnswers: { '1': '42', '2': 'True', '3': 'Ounce' },
  skills: 'Python, React',
  strengths: 'Problem solving',
  aspirations: 'Software Engineer'
}

function makeRequest(body: object) {
  return new NextRequest('http://localhost/api/career-assessment', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' }
  })
}

describe('POST /api/career-assessment', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when no session', async () => {
    mockAuth.mockResolvedValue({ userId: null } as any)
    const res = await POST(makeRequest(validPayload))
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('Unauthorized')
  })

  it('returns 400 when name is missing', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_abc' } as any)
    const { name, ...noName } = validPayload
    const res = await POST(makeRequest(noName))
    expect(res.status).toBe(400)
  })

  it('returns 400 when mbtiAnswers is missing', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_abc' } as any)
    const { mbtiAnswers, ...noMbti } = validPayload
    const res = await POST(makeRequest(noMbti))
    expect(res.status).toBe(400)
  })

  it('returns 201 with mbtiType and iqScore on valid payload', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_abc' } as any)
    const mockRecord = { id: 'rec_1', clerkId: 'user_abc', updatedAt: new Date() }
    mockUpsert.mockResolvedValue(mockRecord as any)
    const res = await POST(makeRequest(validPayload))
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(typeof body.data.mbtiType).toBe('string')
    expect(body.data.mbtiType).toHaveLength(4)
    expect(typeof body.data.iqScore).toBe('number')
    expect(body.data.iqScore).toBeGreaterThanOrEqual(70)
    expect(body.data.iqScore).toBeLessThanOrEqual(130)
  })

  it('calls upsert (not create) — second submission replaces first', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_abc' } as any)
    mockUpsert.mockResolvedValue({ id: 'rec_1', clerkId: 'user_abc', updatedAt: new Date() } as any)
    await POST(makeRequest(validPayload))
    await POST(makeRequest(validPayload))
    expect(mockUpsert).toHaveBeenCalledTimes(2)
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { clerkId: 'user_abc' } })
    )
  })

  it('returns 500 when DB upsert throws', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_abc' } as any)
    mockUpsert.mockRejectedValue(new Error('DB connection lost'))
    const res = await POST(makeRequest(validPayload))
    expect(res.status).toBe(500)
  })
})

describe('GET /api/career-assessment', () => {
  function makeGetRequest() {
    return new NextRequest('http://localhost/api/career-assessment', { method: 'GET' })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when no session', async () => {
    mockAuth.mockResolvedValue({ userId: null } as any)
    const res = await GET(makeGetRequest())
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('Unauthorized')
  })

  it('returns 404 when no assessment found', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_abc' } as any)
    mockFindUnique.mockResolvedValue(null)
    const res = await GET(makeGetRequest())
    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body.error).toBe('No assessment found')
  })

  it('returns 200 with assessment data when found', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_abc' } as any)
    const mockRecord = { id: 'rec_1', clerkId: 'user_abc', name: 'Ahmed' }
    mockFindUnique.mockResolvedValue(mockRecord as any)
    const res = await GET(makeGetRequest())
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data).toMatchObject(mockRecord)
  })

  it('queries by session userId only (not request params)', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_abc' } as any)
    mockFindUnique.mockResolvedValue({ id: 'rec_1', clerkId: 'user_abc' } as any)
    await GET(makeGetRequest())
    expect(mockFindUnique).toHaveBeenCalledWith({ where: { clerkId: 'user_abc' } })
  })

  it('returns 500 when DB findUnique throws', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_abc' } as any)
    mockFindUnique.mockRejectedValue(new Error('DB connection lost'))
    const res = await GET(makeGetRequest())
    expect(res.status).toBe(500)
  })
})

describe('US3 - cross-user isolation (career assessment)', () => {
  it('GET as userA does not return userB data', async () => {
    const userBRecord = { id: 'rec_b', clerkId: 'user_b', name: 'Fatima' }

    // Simulate: userA is signed in
    mockAuth.mockResolvedValue({ userId: 'user_a' } as any)
    // Simulate: DB only returns data for userA (null = not found for userA)
    mockFindUnique.mockImplementation(async ({ where }: any) => {
      if (where.clerkId === 'user_a') return null  // userA has no record
      return userBRecord                             // userB has one
    })

    const req = new NextRequest('http://localhost/api/career-assessment', { method: 'GET' })
    const res = await GET(req)

    // userA gets 404 - cannot see userB's data
    expect(res.status).toBe(404)
    // findUnique was called with userA's clerkId only
    expect(mockFindUnique).toHaveBeenCalledWith({ where: { clerkId: 'user_a' } })
    expect(mockFindUnique).not.toHaveBeenCalledWith({ where: { clerkId: 'user_b' } })
  })
})
