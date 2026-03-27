import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import SkillGapAnalyzerClient from './SkillGapAnalyzerClient'
import ErrorBoundary from '@/components/ErrorBoundary'

export const metadata = {
  title: "Skill Gap Analyzer — Career Navigator",
  description:
    "Upload your resume and identify skill gaps for your target job with AI-powered analysis and personalised learning roadmaps.",
  robots: { index: false, follow: false },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL}/skillgapanalyzer`,
  },
  openGraph: {
    images: [`${process.env.NEXT_PUBLIC_APP_URL}/api/og?title=Skill+Gap+Analyzer&description=Upload+your+resume+and+find+exactly+what+skills+you%27re+missing`],
  },
};

// FR-011: Server-side auth guard — unauthenticated visitors are redirected
// T019: Wrapped with ErrorBoundary so AI failures don't crash the full page
export default async function SkillGapAnalyzerPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  return (
    <ErrorBoundary>
      <SkillGapAnalyzerClient />
    </ErrorBoundary>
  )
}
