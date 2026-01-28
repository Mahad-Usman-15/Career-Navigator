"use client";

import { useState, useEffect, useRef } from "react";

// Reusable Button Component
function Button({ children, variant = "primary", className = "", ...props }) {
  const baseStyles =
    "px-6 py-3 rounded-lg font-semibold text-base transition-all duration-300 cursor-pointer";
  const variants = {
    primary:
      "bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-700 hover:to-cyan-600 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40",
    secondary:
      "bg-transparent border border-blue-500 text-blue-400 hover:bg-blue-500/10",
    ghost: "bg-white/5 text-white hover:bg-white/10 border border-white/10",
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

// Gradient Heading Component
function GradientHeading({ children, className = "", as: Tag = "h2" }) {
  return (
    <Tag
      className={`bg-linear-to-r from-blue-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent ${className}`}
    >
      {children}
    </Tag>
  );
}

// Animated Counter Component
function AnimatedCounter({ end, suffix = "", label }) {
  const [count, setCount] = useState(0);
  const counterRef = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          let start = 0;
          const duration = 2000;
          const increment = end / (duration / 16);

          const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 16);
        }
      },
      { threshold: 0.5 }
    );

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    return () => observer.disconnect();
  }, [end]);

  return (
    <div ref={counterRef} className="text-center p-6">
      <div className="text-4xl md:text-5xl font-bold bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
        {count.toLocaleString()}
        {suffix}
      </div>
      <p className="text-white/70 text-sm md:text-base">{label}</p>
    </div>
  );
}

// Video Placeholder Component
function VideoPlaceholder({ title }) {
  return (
    <div className="relative aspect-video bg-linear-to-br from-blue-900/30 to-cyan-900/20 rounded-2xl border border-white/10 overflow-hidden group">
      <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 to-cyan-500/5" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-linear-to-r from-blue-500 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 cursor-pointer shadow-lg shadow-blue-500/30">
          <svg
            className="w-6 h-6 md:w-8 md:h-8 text-white ml-1"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-4 left-4 right-4">
        <p className="text-white/60 text-sm">{title}</p>
      </div>
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        <span className="text-white/50 text-xs">Preview</span>
      </div>
    </div>
  );
}

// Hero Section
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-white/70 text-sm">Trusted by 50,000+ students worldwide</span>
        </div>

        <GradientHeading
          as="h1"
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-balance"
        >
          Stop Guessing.<br />Start Navigating<br />Your Career.
        </GradientHeading>

        <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed text-pretty">
          Students and graduates struggle with career decisions due to lack of self-awareness and
          unclear pathways. Career Navigator bridges the gap between your potential and the job
          market reality.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button variant="primary" className="w-full sm:w-auto text-base px-8 py-4">
            Discover Your Path
          </Button>
          <Button variant="secondary" className="w-full sm:w-auto text-base px-8 py-4">
            Watch Demo
          </Button>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </section>
  );
}

// Career Guidance Section
function CareerGuidanceSection() {
  return (
    <section id="guidance" className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Content */}
          <div className="order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
              <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span className="text-blue-400 text-sm font-medium">Career Guidance</span>
            </div>

            <GradientHeading className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              1-on-1 Mentorship That Actually Works
            </GradientHeading>

            <p className="text-white/70 text-lg leading-relaxed mb-8">
              Get paired with industry professionals who&apos;ve walked the path you&apos;re about to
              take. Our mentors provide personalized guidance, real-world insights, and actionable
              feedback to accelerate your career journey.
            </p>

            <ul className="space-y-4 mb-8">
              {[
                "Personalized career roadmaps based on your strengths",
                "Weekly check-ins with verified industry mentors",
                "Access to exclusive career resources and workshops",
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-linear-to-r from-blue-500 to-cyan-500 flex items-center justify-center mt-0.5 shrink-0">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-white/80">{item}</span>
                </li>
              ))}
            </ul>

            <Button variant="primary">
              Find Your Mentor
            </Button>
          </div>

          {/* Right Column - Video */}
          <div className="order-1 lg:order-2">
            <VideoPlaceholder title="See how mentorship transforms careers" />
          </div>
        </div>
      </div>
    </section>
  );
}

// Skill Gap Analyzer Section
function SkillGapSection() {
  return (
    <section id="skills" className="py-24 md:py-32 bg-linear-to-b from-transparent via-blue-950/10 to-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Video */}
          <div>
            <VideoPlaceholder title="AI-powered skill analysis in action" />
          </div>

          {/* Right Column - Content */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
              <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-cyan-400 text-sm font-medium">Skill Gap Analyzer</span>
            </div>

            <GradientHeading className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Know Exactly What Skills You Need
            </GradientHeading>

            <p className="text-white/70 text-lg leading-relaxed mb-8">
              Our AI analyzes thousands of job postings in real-time to identify the exact skills
              employers want. Compare your current abilities against market demands and get a
              personalized learning path to close the gap.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {[
                { metric: "500K+", label: "Jobs Analyzed Daily" },
                { metric: "95%", label: "Skill Match Accuracy" },
                { metric: "200+", label: "Industries Covered" },
                { metric: "24hr", label: "Market Updates" },
              ].map((item, index) => (
                <div key={index} className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-2xl font-bold bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    {item.metric}
                  </div>
                  <p className="text-white/60 text-sm">{item.label}</p>
                </div>
              ))}
            </div>

            <Button variant="primary">
              Analyze My Skills
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

// Impact Counter Section
function ImpactSection() {
  const stats = [
    { end: 52847, suffix: "+", label: "Students Guided" },
    { end: 1200, suffix: "+", label: "Career Paths Explored" },
    { end: 3500000, suffix: "+", label: "Skills Analyzed" },
    { end: 94, suffix: "%", label: "Job Readiness Score" },
    { end: 850, suffix: "+", label: "Partner Companies" },
    { end: 12500, suffix: "+", label: "Success Stories" },
  ];

  return (
    <section id="impact" className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <GradientHeading className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Real Impact, Real Results
          </GradientHeading>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Numbers that showcase how Career Navigator is transforming career journeys worldwide.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-linear-to-br from-white/5 to-white/2 rounded-2xl border border-white/10 hover:border-blue-500/30 transition-colors duration-300"
            >
              <AnimatedCounter
                end={stat.end}
                suffix={stat.suffix}
                label={stat.label}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Final Banner Section
function FinalBannerSection() {
  return (
    <section className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-blue-600/20 via-blue-500/10 to-cyan-600/20 border border-white/10">
          {/* Background Effects */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl" />
          </div>

          <div className="relative px-6 py-16 md:px-12 md:py-24 text-center">
            <GradientHeading
              as="h2"
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6"
            >
              Your Future Career Starts Today
            </GradientHeading>

            <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              Join thousands of students who&apos;ve transformed uncertainty into clarity. Take the
              first step toward a career you&apos;ll love with Career Navigator by your side.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="primary" className="w-full sm:w-auto text-base px-10 py-4">
                Start Your Journey Free
              </Button>
              <Button variant="ghost" className="w-full sm:w-auto text-base px-10 py-4">
                Schedule a Demo
              </Button>
            </div>

            <p className="text-white/50 text-sm mt-6">
              No credit card required. Free forever for basic features.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}



// Main Page Component
export default function CareerNavigatorPage() {
  return (
    <main className="min-h-screen bg-[#171717]">
      
      <HeroSection />
      <CareerGuidanceSection />
      <SkillGapSection />
      <ImpactSection />
      <FinalBannerSection />
      
    </main>
  );
}
