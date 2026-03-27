import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import OnboardingClient from './OnboardingClient'

export const metadata = {
  title: "Get Started — Career Navigator",
  description: "Set up your Career Navigator profile and take your first career assessment.",
  robots: { index: false, follow: false },
}

// T014: Onboarding page — redirect users who already have an active assessment to dashboard
export default async function OnboardingPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const existing = await prisma.career_assessments.findFirst({
    where: { clerkId: userId, isArchived: false },
    select: { id: true }
  })

  // Already has an active assessment — skip onboarding
  if (existing) redirect('/dashboard')

  return <OnboardingClient />
}
