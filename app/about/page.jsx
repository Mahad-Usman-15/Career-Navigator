import { Target, Compass, Rocket, ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "About — Career Navigator",
  description:
    "Learn how Career Navigator helps students and graduates in Pakistan discover their ideal career paths through MBTI assessments and AI-powered guidance.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL}/about`,
  },
  openGraph: {
    title: "About Career Navigator",
    description:
      "Learn how Career Navigator helps students and graduates in Pakistan discover their ideal career paths.",
    url: `${process.env.NEXT_PUBLIC_APP_URL}/about`,
  },
};

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: process.env.NEXT_PUBLIC_APP_URL },
              { "@type": "ListItem", position: 2, name: "About", item: `${process.env.NEXT_PUBLIC_APP_URL}/about` },
            ],
          }),
        }}
      />
    <main className="min-h-screen bg-[#171717]">


      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-block px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
            <span className="text-cyan-400 text-sm font-medium">About Us</span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-balance">
            <span className="bg-linear-to-r from-blue-500 via-cyan-400 to-blue-300 bg-clip-text text-transparent">
              Empowering Careers,
            </span>
            <br />
            <span className="text-white">Shaping Futures</span>
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed text-pretty">
            Career Navigator is on a mission to transform how students and graduates 
            discover their career paths through self-awareness, skill alignment, and 
            intelligent guidance.
          </p>
        </div>
      </section>

      {/* Our Vision Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Compass className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-cyan-400 text-sm font-medium uppercase tracking-wider">Our Vision</span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                <span className="bg-linear-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
                  Clarity Through
                </span>
                <br />
                <span className="text-white">Self-Discovery</span>
              </h2>
              <p className="text-white/70 text-lg leading-relaxed mb-6">
                We envision a world where every student and graduate has the clarity 
                and confidence to pursue a career that aligns with their unique strengths, 
                passions, and values.
              </p>
              <p className="text-white/60 leading-relaxed">
                By combining self-assessment tools with intelligent career matching, 
                we help individuals unlock their potential and make informed decisions 
                about their professional futures.
              </p>
            </div>
            <div className="relative">
              <div className="rounded-3xl bg-linear-to-br from-blue-600/20 to-cyan-500/20 border border-white/10 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 to-transparent" />
                <div className="relative z-10 p-4 sm:p-8 w-full">
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="p-4 sm:p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-3 sm:mb-4">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <p className="text-white font-medium text-sm sm:text-base">Self-Awareness</p>
                    </div>
                    <div className="p-4 sm:p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-3 sm:mb-4">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <p className="text-white font-medium text-sm sm:text-base">Empowerment</p>
                    </div>
                    <div className="p-4 sm:p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-400/20 flex items-center justify-center mb-3 sm:mb-4">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <p className="text-white font-medium text-sm sm:text-base">Confidence</p>
                    </div>
                    <div className="p-4 sm:p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-cyan-400/20 flex items-center justify-center mb-3 sm:mb-4">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                      </div>
                      <p className="text-white font-medium text-sm sm:text-base">Global Reach</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Goals Section */}
      <section className="py-20 px-6 bg-linear-to-b from-transparent via-blue-950/20 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="order-2 md:order-1 relative">
              <div className="aspect-square rounded-3xl bg-linear-to-br from-cyan-600/20 to-blue-500/20 border border-white/10 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-tl from-cyan-500/10 to-transparent" />
                <div className="relative z-10 p-8 w-full">
                  <div className="space-y-4">
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-linear-to-br from-blue-500 to-cyan-400 flex items-center justify-center shrink-0">
                        <span className="text-white font-bold text-lg">1</span>
                      </div>
                      <div>
                        <p className="text-white font-semibold">Career Clarity</p>
                        <p className="text-white/60 text-sm">Help users discover their ideal path</p>
                      </div>
                    </div>
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-linear-to-br from-cyan-500 to-blue-400 flex items-center justify-center shrink-0">
                        <span className="text-white font-bold text-lg">2</span>
                      </div>
                      <div>
                        <p className="text-white font-semibold">Skill Alignment</p>
                        <p className="text-white/60 text-sm">Match abilities with opportunities</p>
                      </div>
                    </div>
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-linear-to-br from-blue-400 to-cyan-300 flex items-center justify-center shrink-0">
                        <span className="text-white font-bold text-lg">3</span>
                      </div>
                      <div>
                        <p className="text-white font-semibold">Job-Market Ready</p>
                        <p className="text-white/60 text-sm">Prepare for real-world success</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                  <Target className="w-5 h-5 text-cyan-400" />
                </div>
                <span className="text-cyan-400 text-sm font-medium uppercase tracking-wider">Our Goals</span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                <span className="bg-linear-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  Building Bridges
                </span>
                <br />
                <span className="text-white">To Success</span>
              </h2>
              <p className="text-white/70 text-lg leading-relaxed mb-6">
                Our mission is clear: bridge the gap between education and 
                employment by providing students with the tools they need to 
                succeed in today's competitive job market.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                  </div>
                  <p className="text-white/60">
                    <span className="text-white font-medium">Short-term:</span> Deliver personalized career assessments and actionable insights
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-cyan-400" />
                  </div>
                  <p className="text-white/60">
                    <span className="text-white font-medium">Long-term:</span> Create an ecosystem that connects talent with opportunity globally
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Future Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Rocket className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-cyan-400 text-sm font-medium uppercase tracking-wider">Our Future</span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                <span className="bg-linear-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
                  AI-Powered
                </span>
                <br />
                <span className="text-white">Career Intelligence</span>
              </h2>
              <p className="text-white/70 text-lg leading-relaxed mb-6">
                We're building the future of career guidance with cutting-edge 
                AI technology that adapts to each user's unique journey and 
                provides personalized recommendations at scale.
              </p>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-white font-medium mb-1">Intelligent Matching</p>
                  <p className="text-white/60 text-sm">AI algorithms that understand your potential better than ever</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-white font-medium mb-1">Global Impact</p>
                  <p className="text-white/60 text-sm">Expanding our reach to empower millions worldwide</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-white font-medium mb-1">Continuous Evolution</p>
                  <p className="text-white/60 text-sm">Always learning, always improving, always ahead</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl bg-linear-to-br from-blue-600/20 to-cyan-500/20 border border-white/10 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 to-transparent" />
                <div className="relative z-10">
                  <div className="relative w-64 h-64">
                    {/* Central orb */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-32 h-32 rounded-full bg-linear-to-br from-blue-500 to-cyan-400 animate-pulse flex items-center justify-center">
                        <svg className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    {/* Orbiting elements */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                      <div className="w-4 h-4 rounded-full bg-blue-400" />
                    </div>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                      <div className="w-4 h-4 rounded-full bg-cyan-400" />
                    </div>
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                      <div className="w-4 h-4 rounded-full bg-blue-300" />
                    </div>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                      <div className="w-4 h-4 rounded-full bg-cyan-300" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Meet the Creator Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-4">
              <span className="text-cyan-400 text-sm font-medium">The Person Behind It</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
              <span className="bg-linear-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">Meet the Creator</span>
            </h2>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="rounded-3xl bg-white/5 border border-white/10 p-8 md:p-12">
              {/* Avatar + Name */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
                <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-blue-500 to-cyan-400 flex items-center justify-center shrink-0 text-3xl font-bold text-white">
                  MU
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-2xl font-bold text-white">Mahad Usman</h3>
                  <p className="text-cyan-400 font-medium mt-1">AI Enthusiast &amp; Developer</p>
                  <a
                    href="mailto:mahadusman2008@gmail.com"
                    className="text-white/50 text-sm mt-1 inline-block hover:text-cyan-400 transition-colors"
                  >
                    mahadusman2008@gmail.com
                  </a>
                </div>
              </div>

              {/* Story */}
              <div className="mb-8 space-y-4 text-white/70 leading-relaxed">
                <p>
                  I built Career Navigator because I saw a real problem — many students struggle to choose the right career, and freshers keep getting rejected despite sending dozens of CVs. The reason isn&apos;t a lack of potential. It&apos;s a skill gap that no one ever pointed out to them.
                </p>
                <p>
                  Career Navigator gives every student a complete, AI-generated career roadmap based on their personality and IQ — and a detailed skill gap report so they know exactly what to fix before they apply. No more guessing. No more rejections from preventable gaps.
                </p>
              </div>

              {/* Social Links */}
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://www.linkedin.com/in/mahad-usman-45497a353"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:border-blue-500/50 hover:bg-blue-500/10 transition-all text-sm"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  LinkedIn
                </a>
                <a
                  href="https://github.com/Mahad-Usman-15"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:border-white/30 hover:bg-white/10 transition-all text-sm"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub
                </a>
                <a
                  href="https://x.com/MahadUsmns"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all text-sm"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  X (Twitter)
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Closing Banner Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-3xl bg-linear-to-r from-blue-600 to-cyan-500 overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
            </div>
            
            <div className="relative z-10 py-16 px-8 md:py-20 md:px-16 text-center">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 text-balance">
                Your Journey Starts Here
              </h2>
              <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-8 text-pretty">
                Join thousands of students and graduates who have discovered 
                their true career potential with Career Navigator.
              </p>
              <Link href="/careercounselling" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-semibold rounded-full hover:bg-white/90 transition-colors">
                Start Your Career Journey
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

  
    </main>
    </>
  );
}
