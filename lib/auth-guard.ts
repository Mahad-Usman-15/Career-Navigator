import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

/**
 * requireAuth - Constitution Principle I (Security-First) layer 2.
 *
 * Extracts userId from the active Clerk session.
 * Throws a NextResponse 401 if no valid session exists.
 *
 * SECURITY: userId is exclusively from Clerk session - never from request input
 * (constitution Principle II: Session-Driven Identity).
 *
 * Usage in route handlers:
 *   try {
 *     const userId = await requireAuth()
 *     // ... rest of handler
 *   } catch (error) {
 *     if (error instanceof NextResponse) return error  // passes through 401
 *     return NextResponse.json({ error: 'Internal error' }, { status: 500 })
 *   }
 */
export async function requireAuth(): Promise<string> {
  const { userId } = await auth()
  if (!userId) throw NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return userId
}
