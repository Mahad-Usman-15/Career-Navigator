'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Compass, ClipboardList, BookOpen, ArrowRight, SkipForward } from 'lucide-react'

const GradientButton = ({ onClick, className, children }: { onClick?: () => void; className?: string; children: React.ReactNode }) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-800 to-blue-500 hover:opacity-90 transition-opacity ${className ?? ''}`}
  >
    {children}
  </button>
)

// T015: 3-step onboarding wizard
// Step 1: Welcome + name display
// Step 2: Link to /careercounselling (assessment CTA)
// Step 3: Link to /skillgapanalyzer + skippable "Do it later" button
export default function OnboardingClient() {
  const [step, setStep] = useState(1)
  const { user } = useUser()
  const router = useRouter()
  const firstName = user?.firstName ?? 'there'

  return (
    <div className="min-h-screen bg-[#171717] flex items-center justify-center px-6 py-24">
      <div className="w-full max-w-lg">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                s <= step ? 'bg-blue-500' : 'bg-white/10'
              }`}
            />
          ))}
        </div>
        <p className="text-white/40 text-sm mb-6">Step {step} of 3</p>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center mb-6">
              <Compass className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">
              Welcome, {firstName}!
            </h1>
            <p className="text-white/60 text-lg leading-relaxed">
              Career Navigator helps you discover the right career path through an AI-powered
              personality and IQ assessment. It takes about 10 minutes to complete.
            </p>
            <p className="text-white/40 text-sm">
              Your results are private and only visible to you.
            </p>
            <GradientButton
              onClick={() => setStep(2)}
              className="w-full flex items-center justify-center gap-2"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </GradientButton>
          </div>
        )}

        {/* Step 2: Take Assessment */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-400 flex items-center justify-center mb-6">
              <ClipboardList className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white">
              Take the Career Assessment
            </h2>
            <p className="text-white/60 text-lg leading-relaxed">
              Answer 20 MBTI personality questions and 30 IQ questions. Our AI will match your
              profile to the top 5 career paths in Pakistan&apos;s job market.
            </p>
            <div className="p-4 rounded-xl border border-white/10 bg-white/5 space-y-2">
              <p className="text-white/80 text-sm font-medium">What you&apos;ll get:</p>
              <ul className="text-white/50 text-sm space-y-1">
                <li>• Your MBTI personality type</li>
                <li>• IQ score estimate</li>
                <li>• Top 3 AI-matched career paths with % match scores</li>
                <li>• Personalized 3-year roadmap</li>
              </ul>
            </div>
            <Link href="/careercounselling" className="block">
              <GradientButton className="w-full flex items-center justify-center gap-2">
                Start Assessment <ArrowRight className="w-4 h-4" />
              </GradientButton>
            </Link>
            <button
              onClick={() => setStep(3)}
              className="w-full text-white/40 text-sm hover:text-white/60 transition-colors py-2"
            >
              I&apos;ll do this later
            </button>
          </div>
        )}

        {/* Step 3: Skill Gap Scan (skippable) */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-400 flex items-center justify-center mb-6">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white">
              Analyze Your Skill Gap
            </h2>
            <p className="text-white/60 text-lg leading-relaxed">
              Upload your resume and paste a job description to see exactly which skills you
              need to develop — with a personalized learning roadmap to get there.
            </p>
            <div className="p-4 rounded-xl border border-white/10 bg-white/5">
              <p className="text-white/40 text-sm">Optional — you can do this any time from the dashboard.</p>
            </div>
            <Link href="/skillgapanalyzer" className="block">
              <GradientButton className="w-full flex items-center justify-center gap-2">
                Scan My Skill Gap <ArrowRight className="w-4 h-4" />
              </GradientButton>
            </Link>
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full flex items-center justify-center gap-2 text-white/40 text-sm hover:text-white/60 transition-colors py-2"
            >
              <SkipForward className="w-4 h-4" />
              Do it later — go to dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
