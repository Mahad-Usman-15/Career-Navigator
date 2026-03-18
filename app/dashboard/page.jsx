import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const user = await currentUser()

  // Query DB directly — no HTTP round-trip, works without NEXT_PUBLIC_APP_URL
  const [rawAssessment, rawGuidance, rawSkillGap] = await Promise.all([
    prisma.career_assessments.findUnique({ where: { clerkId: userId } }),
    prisma.career_guidance.findFirst({
      where: { clerkId: userId },
      orderBy: { generatedAt: 'desc' }
    }),
    prisma.skill_gaps.findFirst({
      where: { clerkId: userId },
      orderBy: { createdAt: 'desc' }
    })
  ])

  const assessment = rawAssessment ? {
    mbtiType: rawAssessment.personality?.type ?? null,
    iqScore: rawAssessment.iq?.iq_score ?? null,
    qualification: rawAssessment.qualification,
    skills: rawAssessment.skills
  } : null

  const guidance = rawGuidance ? {
    topCareers: (rawGuidance.recommendations ?? [])
      .slice(0, 3)
      .map(c => ({ title: c.title, matchScore: c.matchScore, marketOutlook: c.marketOutlook })),
    overallTimeline: rawGuidance.overallTimeline,
    generatedAt: rawGuidance.generatedAt
  } : null

  const skillGap = rawSkillGap ? {
    compatibilityScore: rawSkillGap.analysis?.compatibilityScore ?? null,
    missingSkills: (rawSkillGap.analysis?.missingSkills ?? []).slice(0, 5),
    matchingSkills: rawSkillGap.analysis?.matchingSkills ?? [],
    analyzedAt: rawSkillGap.createdAt
  } : null

  return (
    <div className="min-h-screen pt-24 px-6 pb-10 md:px-10" style={{ backgroundColor: '#171717' }}>
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Welcome banner */}
        <div>
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{ background: 'linear-gradient(135deg, #1e3a8a, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            Welcome back, {user?.firstName ?? 'Student'}
          </h1>
          <p className="text-white/60 mt-1">Your career profile at a glance.</p>
        </div>

        {/* Assessment Cards row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl p-6" style={{ backgroundColor: '#222222' }}>
            <p className="text-sm font-medium text-white/60 mb-2">MBTI Type</p>
            {assessment ? (
              <>
                <p className="text-2xl font-bold text-white">{assessment.mbtiType ?? '—'}</p>
                {assessment.mbtiType && (
                  <Link
                    href={`/personalitytypes#${assessment.mbtiType}`}
                    className="text-xs text-blue-400 hover:underline mt-1 inline-block"
                  >
                    What does this mean?
                  </Link>
                )}
              </>
            ) : (
              <p className="text-sm text-white/60">Not completed yet</p>
            )}
          </div>

          <div className="rounded-2xl p-6" style={{ backgroundColor: '#222222' }}>
            <p className="text-sm font-medium text-white/60 mb-2">IQ Score</p>
            {assessment ? (
              <p className="text-2xl font-bold text-white">{assessment.iqScore ?? '—'}</p>
            ) : (
              <p className="text-sm text-white/60">Not completed yet</p>
            )}
          </div>

          <div className="rounded-2xl p-6" style={{ backgroundColor: '#222222' }}>
            <p className="text-sm font-medium text-white/60 mb-2">Skill Match</p>
            {skillGap ? (
              <>
                <p className="text-2xl font-bold text-white">{skillGap.compatibilityScore}%</p>
                <div className="mt-2 h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#333333' }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${skillGap.compatibilityScore}%`, background: 'linear-gradient(135deg, #1e3a8a, #60a5fa)' }}
                  />
                </div>
              </>
            ) : (
              <p className="text-sm text-white/60">Not scanned yet</p>
            )}
          </div>
        </div>

        {/* Career Paths section */}
        <div className="rounded-2xl p-6" style={{ backgroundColor: '#222222' }}>
          <h2
            className="text-xl font-semibold mb-4"
            style={{ background: 'linear-gradient(135deg, #1e3a8a, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            Top Career Paths
          </h2>
          {!guidance ? (
            <div className="text-center py-8 space-y-3">
              <p className="text-white/60">You have not generated career guidance yet.</p>
              <Link
                href="/careercounselling"
                className="inline-block px-4 py-2 rounded-md text-sm font-medium text-white"
                style={{ background: 'linear-gradient(135deg, #1e3a8a, #60a5fa)' }}
              >
                Generate Career Guidance
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              {guidance.topCareers.map((career, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-white">{career.title}</span>
                    <span className="text-sm text-white/60">{career.matchScore}% match</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#333333' }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${career.matchScore}%`, background: 'linear-gradient(135deg, #1e3a8a, #60a5fa)' }}
                    />
                  </div>
                  <p className="text-xs text-white/60 mt-1">{career.marketOutlook}</p>
                </div>
              ))}
              <p className="text-xs text-white/60 pt-2">
                Generated {new Date(guidance.generatedAt).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        {/* Skill Gap section */}
        <div className="rounded-2xl p-6" style={{ backgroundColor: '#222222' }}>
          <h2
            className="text-xl font-semibold mb-4"
            style={{ background: 'linear-gradient(135deg, #1e3a8a, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            Skill Gap Summary
          </h2>
          {!skillGap ? (
            <div className="text-center py-8 space-y-3">
              <p className="text-white/60">You have not run a skill gap scan yet.</p>
              <Link
                href="/skillgapanalyzer"
                className="inline-block px-4 py-2 rounded-md text-sm font-medium text-white"
                style={{ background: 'linear-gradient(135deg, #1e3a8a, #60a5fa)' }}
              >
                Run Skill Gap Scan
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-white mb-2">Missing Skills</p>
                <div className="flex flex-wrap gap-2">
                  {skillGap.missingSkills.map((skill, i) => (
                    <span key={i} className="px-3 py-1 rounded-full text-xs" style={{ backgroundColor: '#4b1c1c', color: '#f87171' }}>{skill}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-white mb-2">Matching Skills</p>
                <div className="flex flex-wrap gap-2">
                  {skillGap.matchingSkills.map((skill, i) => (
                    <span key={i} className="px-3 py-1 rounded-full text-xs" style={{ backgroundColor: '#1a3d2b', color: '#4ade80' }}>{skill}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick-action buttons */}
        <div className="flex flex-wrap gap-4">
          <Link
            href="/careercounselling"
            className="px-5 py-2 rounded-md text-sm font-medium text-white/80 hover:text-white transition-colors"
            style={{ backgroundColor: '#222222' }}
          >
            Retake Assessment
          </Link>
          <Link
            href="/skillgapanalyzer"
            className="px-5 py-2 rounded-md text-sm font-medium text-white/80 hover:text-white transition-colors"
            style={{ backgroundColor: '#222222' }}
          >
            New Skill Gap Scan
          </Link>
          <Link
            href="/personalitytypes"
            className="px-5 py-2 rounded-md text-sm font-medium text-white/80 hover:text-white transition-colors"
            style={{ backgroundColor: '#222222' }}
          >
            View Personality Types
          </Link>
        </div>

      </div>
    </div>
  )
}
