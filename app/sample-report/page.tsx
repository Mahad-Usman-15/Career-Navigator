import Link from 'next/link'

export const metadata = {
  title: 'Sample Career Report — Career Navigator',
  description: 'See what a complete AI-generated career report looks like. Includes MBTI type, IQ score, career paths with match scores, roadmap, and sample job listings.',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL}/sample-report`,
  },
}

const sampleCareers = [
  {
    title: 'Clinical Psychologist',
    matchScore: 87,
    marketOutlook: 'High demand — mental health awareness driving 25% sector growth in Pakistan by 2027.',
    roadmap: [
      { step: 'Complete BS Psychology (4 years)', resource: 'HEC-recognized universities: UCP, FJWU, IoBM' },
      { step: 'Obtain clinical training certification', resource: 'Pakistan Psychological Association supervised practicum' },
      { step: 'Build counselling practice portfolio', resource: 'Volunteer at UMANG helpline or school counselling programs' },
      { step: 'Pursue MS Clinical Psychology', resource: 'University of Karachi, LUMS, Quaid-i-Azam University' },
    ],
  },
  {
    title: 'UX Researcher',
    matchScore: 82,
    marketOutlook: 'Growing fast — 40+ Pakistan-based tech companies now hire dedicated UX roles.',
    roadmap: [
      { step: 'Learn UX research fundamentals', resource: 'Google UX Design Certificate (Coursera, free audit)' },
      { step: 'Complete 3 portfolio projects', resource: 'Redesign a local app — document methods and findings' },
      { step: 'Get certified in usability testing', resource: 'Nielsen Norman Group — UX Certification (online)' },
      { step: 'Apply to product teams', resource: 'Systems Limited, Arbisoft, TRG Pakistan UX roles' },
    ],
  },
  {
    title: 'Social Entrepreneur',
    matchScore: 74,
    marketOutlook: 'Niche but growing — impact investment in Pakistan grew 3x between 2020 and 2024.',
    roadmap: [
      { step: 'Study social enterprise models', resource: 'Acumen Academy — Foundations of Social Entrepreneurship (free)' },
      { step: 'Build an MVP with measurable impact', resource: 'Invest2Innovate (i2i) Pakistan accelerator program' },
      { step: 'Apply for seed funding', resource: 'Karandaaz Pakistan, Indus Valley Capital impact track' },
      { step: 'Scale with a sustainability plan', resource: 'British Council Social Enterprise programme' },
    ],
  },
]

const sampleJobs = [
  { title: 'Junior Clinical Psychologist', company: 'Aga Khan University Hospital', location: 'Karachi', salary: 'PKR 80,000–120,000/mo' },
  { title: 'UX Researcher', company: 'Systems Limited', location: 'Lahore (Hybrid)', salary: 'PKR 120,000–180,000/mo' },
  { title: 'Program Associate — Mental Health', company: 'USAID Pakistan', location: 'Islamabad', salary: 'PKR 150,000–200,000/mo' },
]

export default function SampleReportPage() {
  return (
    <div className="min-h-screen pt-24 px-6 pb-16 md:px-10 bg-[#171717]">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Sample Report Banner */}
        <div className="rounded-xl px-5 py-3 bg-blue-500/10 border border-blue-500/20 flex items-center gap-3">
          <span className="text-blue-400 text-sm font-medium">Sample Report</span>
          <span className="text-white/50 text-sm">This is a realistic example. Your report will be generated from your actual assessment.</span>
        </div>

        {/* Header */}
        <div>
          <p className="text-xs font-medium text-white/40 uppercase tracking-widest mb-2">AI Career Report</p>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-[#1e3a8a] to-[#60a5fa] bg-clip-text text-transparent">
            Career Assessment Report
          </h1>
          <p className="text-white/50 text-sm mt-1">Example profile: Fatima A. · ENFJ · IQ 118 · Undergraduate</p>
        </div>

        {/* MBTI + IQ Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl p-6 bg-[#222222]">
            <p className="text-sm font-medium text-white/60 mb-2">MBTI Type</p>
            <p className="text-2xl font-bold text-white">ENFJ</p>
            <p className="text-xs text-white/50 mt-1">The Protagonist — empathetic, charismatic, natural leader</p>
          </div>
          <div className="rounded-2xl p-6 bg-[#222222]">
            <p className="text-sm font-medium text-white/60 mb-2">IQ Score</p>
            <p className="text-2xl font-bold text-white">118</p>
            <p className="text-xs text-white/50 mt-1">Above average — strong analytical and verbal reasoning</p>
          </div>
        </div>

        {/* Top Career Paths */}
        <div className="rounded-2xl p-6 bg-[#222222]">
          <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-[#1e3a8a] to-[#60a5fa] bg-clip-text text-transparent">
            Top Career Paths
          </h2>
          <div className="space-y-5">
            {sampleCareers.map((career, i) => (
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
                <p className="text-xs text-white/50 mt-1">{career.marketOutlook}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Roadmap for Top Career */}
        <div className="rounded-2xl p-6 bg-[#222222]">
          <h2 className="text-xl font-semibold mb-1 bg-gradient-to-r from-[#1e3a8a] to-[#60a5fa] bg-clip-text text-transparent">
            Roadmap: Clinical Psychologist
          </h2>
          <p className="text-white/40 text-xs mb-5">4-step path from where you are to your first role</p>
          <ol className="space-y-4">
            {sampleCareers[0].roadmap.map((item, i) => (
              <li key={i} className="flex gap-4">
                <div className="w-7 h-7 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center shrink-0 text-white text-xs font-bold mt-0.5">
                  {i + 1}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{item.step}</p>
                  <p className="text-white/50 text-xs mt-0.5">{item.resource}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Sample Job Listings */}
        <div className="rounded-2xl p-6 bg-[#222222]">
          <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-[#1e3a8a] to-[#60a5fa] bg-clip-text text-transparent">
            Sample Job Listings
          </h2>
          <div className="space-y-3">
            {sampleJobs.map((job, i) => (
              <div key={i} className="flex items-start justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                <div>
                  <p className="font-medium text-white text-sm">{job.title}</p>
                  <p className="text-white/50 text-xs mt-0.5">{job.company} · {job.location}</p>
                </div>
                <span className="text-xs text-white/40 shrink-0">{job.salary}</span>
              </div>
            ))}
          </div>
          <p className="text-white/30 text-xs mt-4">Job listings in your actual report are matched to your specific top career path and refreshed every 6 hours.</p>
        </div>

        {/* CTA */}
        <div className="rounded-2xl p-8 bg-gradient-to-r from-[#1e3a8a]/30 to-[#3b82f6]/20 border border-blue-500/20 text-center space-y-4">
          <h2 className="text-xl font-semibold text-white">Get Your Own Career Report — Free</h2>
          <p className="text-white/60 text-sm max-w-sm mx-auto">
            Takes 10 minutes. No credit card. Your results are personalised to your actual MBTI type, IQ score, and skills.
          </p>
          <Link
            href="/sign-up"
            className="inline-block px-8 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-lg shadow-blue-500/25 transition-all duration-300"
          >
            Start Free Assessment →
          </Link>
          <p className="text-white/30 text-xs">Already have an account? <Link href="/sign-in" className="text-blue-400 hover:underline">Sign in</Link></p>
        </div>

      </div>
    </div>
  )
}
