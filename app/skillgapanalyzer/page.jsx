import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import SkillGapAnalyzerClient from './SkillGapAnalyzerClient'

// FR-011: Server-side auth guard — unauthenticated visitors are redirected
// before any page content is rendered (not client-side)
export default async function SkillGapAnalyzerPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  return <SkillGapAnalyzerClient />
}
