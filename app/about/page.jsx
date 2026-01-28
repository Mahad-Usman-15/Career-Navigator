import { Target, Compass, Rocket, ArrowRight } from "lucide-react";
export default function AboutPage() {
  return (
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
              <div className="aspect-square rounded-3xl bg-linear-to-br from-blue-600/20 to-cyan-500/20 border border-white/10 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 to-transparent" />
                <div className="relative z-10 p-8">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                      <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <p className="text-white font-medium">Self-Awareness</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                      <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <p className="text-white font-medium">Empowerment</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                      <div className="w-12 h-12 rounded-xl bg-blue-400/20 flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <p className="text-white font-medium">Confidence</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                      <div className="w-12 h-12 rounded-xl bg-cyan-400/20 flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                      </div>
                      <p className="text-white font-medium">Global Reach</p>
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
              <button className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-semibold rounded-full hover:bg-white/90 transition-colors">
                Start Your Career Journey
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-xl font-bold bg-linear-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Career Navigator
            </div>
            <div className="flex items-center gap-6 text-white/60 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
            <p className="text-white/40 text-sm">
              © 2026 Career Navigator. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
