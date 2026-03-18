import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock Prisma client
vi.mock('@/lib/db', () => ({
  prisma: {
    users: {
      upsert: vi.fn()
    }
  }
}))

// Shared mock verify function — controlled per test via mockVerify
const mockVerify = vi.fn()

// Mock svix using a proper constructor function (arrow functions cannot be used with `new`)
vi.mock('svix', () => ({
  Webhook: vi.fn(function () {
    return { verify: mockVerify }
  })
}))

import { prisma } from '@/lib/db'
import { POST } from '@/app/api/webhooks/clerk/route'

const mockUpsert = vi.mocked(prisma.users.upsert)

const userCreatedPayload = {
  type: 'user.created',
  data: {
    id: 'user_clerk_123',
    first_name: 'Ali',
    last_name: 'Khan',
    email_addresses: [{ email_address: 'ali@example.com', id: 'idn_1' }],
    created_at: 1710000000000
  }
}

function makeWebhookRequest(body: object, overrideHeaders: Record<string, string> = {}) {
  const bodyStr = JSON.stringify(body)
  return new NextRequest('http://localhost/api/webhooks/clerk', {
    method: 'POST',
    body: bodyStr,
    headers: {
      'Content-Type': 'application/json',
      'svix-id': 'msg_test_123',
      'svix-timestamp': '1710000000',
      'svix-signature': 'v1,testsignature',
      ...overrideHeaders
    }
  })
}

describe('POST /api/webhooks/clerk', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default: verify succeeds and returns the user.created payload
    mockVerify.mockReturnValue(userCreatedPayload)
  })

  // T037: 400 when missing Svix headers
  it('returns 400 when svix-id header is missing', async () => {
    const req = makeWebhookRequest(userCreatedPayload, { 'svix-id': '' })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/missing/i)
  })

  it('returns 400 when svix-timestamp header is missing', async () => {
    const req = makeWebhookRequest(userCreatedPayload, { 'svix-timestamp': '' })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 when svix-signature header is missing', async () => {
    const req = makeWebhookRequest(userCreatedPayload, { 'svix-signature': '' })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  // T038: 401 when signature verification fails
  it('returns 401 when Webhook.verify throws (invalid signature)', async () => {
    mockVerify.mockImplementation(() => { throw new Error('Invalid signature') })
    const req = makeWebhookRequest(userCreatedPayload)
    const res = await POST(req)
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toMatch(/invalid signature/i)
  })

  // T039: 200 user.created → upsert called with correct fields
  it('returns 200 and creates user record on user.created event', async () => {
    mockUpsert.mockResolvedValue({ id: 'db_1', clerkId: 'user_clerk_123', name: 'Ali Khan', email: 'ali@example.com', createdAt: new Date() } as any)
    const req = makeWebhookRequest(userCreatedPayload)
    const res = await POST(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.received).toBe(true)
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { clerkId: 'user_clerk_123' },
        update: {},
        create: expect.objectContaining({
          clerkId: 'user_clerk_123',
          name: 'Ali Khan',
          email: 'ali@example.com'
        })
      })
    )
  })

  // T040: idempotency — same event twice, both use upsert with update:{}
  it('handles duplicate user.created events idempotently (upsert with update: {})', async () => {
    mockUpsert.mockResolvedValue({ id: 'db_1', clerkId: 'user_clerk_123' } as any)
    const req1 = makeWebhookRequest(userCreatedPayload)
    const req2 = makeWebhookRequest(userCreatedPayload)

    const res1 = await POST(req1)
    const res2 = await POST(req2)

    expect(res1.status).toBe(200)
    expect(res2.status).toBe(200)
    expect(mockUpsert).toHaveBeenCalledTimes(2)

    // Both calls use empty update — idempotent no-op on duplicate
    for (const call of mockUpsert.mock.calls) {
      expect(call[0]).toMatchObject({ update: {} })
    }
  })

  // T041: 200 for non-user.created events — no DB write
  it('returns 200 without DB write for non-user.created event types', async () => {
    const otherEvent = { type: 'user.updated', data: { id: 'user_clerk_123' } }
    mockVerify.mockReturnValue(otherEvent)
    const req = makeWebhookRequest(otherEvent)
    const res = await POST(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.received).toBe(true)
    expect(mockUpsert).not.toHaveBeenCalled()
  })
})
