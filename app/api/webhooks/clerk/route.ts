import { NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { prisma } from '@/lib/db'

// T042-T045: POST /api/webhooks/clerk
// FR-019: Verify Clerk webhook signature using CLERK_WEBHOOK_SECRET
// FR-020: user.created → create record in users table (separate from career_assessments)
// FR-021: Idempotent — upsert with update:{} is a no-op if user already exists
// FR-022: Return 200 immediately after processing
//
// IMPORTANT: This route is NOT protected by requireAuth() or isProtectedApiRoute in proxy.js.
// It is called by Clerk's servers, not by a signed-in user.
// Authentication is provided by Svix signature verification only.
export async function POST(req: Request) {
  // T040: Read raw body as text — MUST come before any other body read
  // If req.json() is called first, the body stream is consumed and verify() will fail
  const body = await req.text()

  // T042: Check required Svix headers
  const svixId = req.headers.get('svix-id')
  const svixTimestamp = req.headers.get('svix-timestamp')
  const svixSignature = req.headers.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 })
  }

  // T043: Verify signature using CLERK_WEBHOOK_SECRET
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!)
  let event: { type: string; data: any }
  try {
    event = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature
    }) as { type: string; data: any }
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  if (event.type === 'user.created') {
    // Upsert user record — idempotent (FR-021)
    const { id, first_name, last_name, email_addresses } = event.data
    const name = `${first_name ?? ''} ${last_name ?? ''}`.trim()
    const email = email_addresses?.[0]?.email_address ?? ''

    await prisma.users.upsert({
      where: { clerkId: id },
      update: {},  // no-op on duplicate — idempotent
      create: { clerkId: id, name, email }
    })
  } else if (event.type === 'user.deleted') {
    // ADR-006: invalidate all share tokens so existing links return 404
    const { id } = event.data
    if (id) {
      await prisma.career_guidance.updateMany({
        where: { clerkId: id },
        data: { shareToken: null }
      })
    }
  }

  // Return 200 immediately — delayed responses cause Clerk retries
  return NextResponse.json({ received: true })
}
