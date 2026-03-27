import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'

interface ReportPageProps {
  params: Promise<{ token: string }>
}

export async function generateMetadata({ params }: ReportPageProps) {
  return {
    title: 'Career Report — Career Navigator',
    description: 'View this shared career assessment report.',
    robots: { index: false, follow: false }
  }
}

// T039: Public read-only report page — no auth required
export default async function ReportPage({ params }: ReportPageProps) {
  const { token } = await params

  const guidance = await prisma.career_guidance.findUnique({
    where: { shareToken: token },
    select: {
      clerkId: true,
      recommendations: true,
      overallTimeline: true,
      generatedAt: true
    }
  })

  if (!guidance) notFound()

  const skillGap = await prisma.skill_gaps.findFirst({
    where: { clerkId: guidance.clerkId },
    orderBy: { createdAt: 'desc' },
    select: { analysis: true, createdAt: true }
  })

  const topCareers = ((guidance.recommendations ?? []) as Array<{
    title?: string
    matchScore?: number
    marketOutlook?: string
  }>).slice(0, 3)

  const analysis = skillGap?.analysis as any
  const compatibilityScore = analysis?.compatibilityScore ?? null
  const missingSkills: string[] = (analysis?.missingSkills ?? []).slice(0, 5)
  const matchingSkills: string[] = (analysis?.matchingSkills ?? []).slice(0, 5)

  return (
    <div className="min-h-screen pt-24 px-6 pb-10 md:px-10 bg-[#171717]">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <p className="text-xs font-medium text-white/40 uppercase tracking-widest mb-2">Shared Report</p>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-[#1e3a8a] to-[#60a5fa] bg-clip-text text-transparent">
            Career Assessment Report
          </h1>
          <p className="text-white/50 text-sm mt-1">
            Generated {new Date(guidance.generatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Top Career Paths */}
        <div className="rounded-2xl p-6 bg-[#222222]">
          <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-[#1e3a8a] to-[#60a5fa] bg-clip-text text-transparent">
            Top Career Paths
          </h2>
          <div className="space-y-5">
            {topCareers.map((career, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-white">{career.title}</span>
                  <span className="text-sm text-white/60">{career.matchScore}% match</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden bg-[#333333]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#1e3a8a] to-[#60a5fa]"
                    style={{ width: `${career.matchScore}%` }}
                  />
                </div>
                {career.marketOutlook && (
                  <p className="text-xs text-white/50 mt-1">{career.marketOutlook}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Skill Gap Summary */}
        {skillGap && (
          <div className="rounded-2xl p-6 bg-[#222222]">
            <h2 className="text-xl font-semibold mb-4 bg-linear-to-r from-[#1e3a8a] to-[#60a5fa] bg-clip-text text-transparent">
              Skill Gap Summary
            </h2>
            {compatibilityScore !== null && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-white/60">Skill Match</span>
                  <span className="text-sm font-semibold text-white">{compatibilityScore}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden bg-[#333333]">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-[#1e3a8a] to-[#60a5fa]"
                    style={{ width: `${compatibilityScore}%` }}
                  />
                </div>
              </div>
            )}
            {missingSkills.length > 0 && (
              <div className="mb-3">
                <p className="text-sm font-medium text-white mb-2">Missing Skills</p>
                <div className="flex flex-wrap gap-2">
                  {missingSkills.map((skill, i) => (
                    <span key={i} className="px-3 py-1 rounded-full text-xs bg-[#4b1c1c] text-[#f87171]">{skill}</span>
                  ))}
                </div>
              </div>
            )}
            {matchingSkills.length > 0 && (
              <div>
                <p className="text-sm font-medium text-white mb-2">Matching Skills</p>
                <div className="flex flex-wrap gap-2">
                  {matchingSkills.map((skill, i) => (
                    <span key={i} className="px-3 py-1 rounded-full text-xs bg-[#1a3d2b] text-[#4ade80]">{skill}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* CTA */}
        <div className="rounded-2xl p-6 bg-[#222222] text-center space-y-3">
          <p className="text-white/70 font-medium">Want your own career report?</p>
          <p className="text-white/40 text-sm">Take the free AI-powered career assessment and discover the best paths for you.</p>
          <Link
            href="/"
            className="inline-block mt-1 px-5 py-2 rounded-lg text-sm font-medium text-white bg-linear-to-r from-[#1e3a8a] to-[#3b82f6] hover:opacity-90 transition-opacity"
          >
            Get Started Free →
          </Link>
        </div>

      </div>
    </div>
  )
}
