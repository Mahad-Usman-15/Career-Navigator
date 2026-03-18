import { PrismaClient } from '@prisma/client'

// Singleton pattern: prevents connection pool exhaustion during Next.js dev hot-reload.
// In production (Vercel serverless), each function gets its own instance.
// Tip: append ?connection_limit=1&pool_timeout=0 to DATABASE_URL for Supabase serverless.
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
