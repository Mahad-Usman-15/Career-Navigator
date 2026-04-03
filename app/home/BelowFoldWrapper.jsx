import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/db'
import BelowFoldClient from './BelowFoldClient'

const getUsageCounts = unstable_cache(
  async () => {
    const [totalAssessments, totalSkillGapScans] = await Promise.all([
      prisma.career_assessments.count(),
      prisma.skill_gaps.count(),
    ])
    return { totalAssessments, totalSkillGapScans }
  },
  ['landing-usage-counts'],
  { revalidate: 3600 }
)

export default async function BelowFoldWrapper() {
  let totalAssessments = 0
  let totalSkillGapScans = 0
  try {
    const counts = await getUsageCounts()
    totalAssessments = counts.totalAssessments
    totalSkillGapScans = counts.totalSkillGapScans
  } catch {
    // DB unreachable at build time — fall back to zeros
  }
  return <BelowFoldClient totalAssessments={totalAssessments} totalSkillGapScans={totalSkillGapScans} />
}
