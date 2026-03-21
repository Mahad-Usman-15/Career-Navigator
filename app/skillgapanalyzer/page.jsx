import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import SkillGapAnalyzerClient from './SkillGapAnalyzerClient'

export const metadata = {
  title: "Skill Gap Analyzer — Career Navigator",
  description:
    "Upload your resume and identify skill gaps for your target job with AI-powered analysis and personalised learning roadmaps.",
  robots: { index: false, follow: false },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL}/skillgapanalyzer`,
  },
};

// FR-011: Server-side auth guard — unauthenticated visitors are redirected
// before any page content is rendered (not client-side)
export default async function SkillGapAnalyzerPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  return <SkillGapAnalyzerClient />
}
