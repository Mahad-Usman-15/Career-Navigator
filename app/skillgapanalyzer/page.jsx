import { auth } from '@clerk/nextjs/server'
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

// FR-006: Page is accessible without auth — unauthenticated users see demo mode
// Authenticated users see the full form unchanged
// Note: /api/skillgap remains protected in proxy.js (isProtectedApiRoute)
export default async function SkillGapAnalyzerPage() {
  const { userId } = await auth()

  return (
    <ErrorBoundary>
      <SkillGapAnalyzerClient isAuthenticated={!!userId} />
    </ErrorBoundary>
  )
}
