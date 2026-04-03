"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

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

function GradientHeading({ children, className = "", as: Tag = "h2" }) {
  return (
    <Tag className={`bg-linear-to-r from-blue-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent ${className}`}>
      {children}
    </Tag>
  );
}

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
    if (counterRef.current) observer.observe(counterRef.current);
    return () => observer.disconnect();
  }, [end]);

  return (
    <div ref={counterRef} className="text-center p-3 sm:p-4 md:p-6">
      <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-1 md:mb-2 leading-tight">
        {count.toLocaleString()}{suffix}
      </div>
      <p className="text-white/70 text-xs sm:text-sm md:text-base">{label}</p>
    </div>
  );
}

function VideoPlayer({ title, startTime = 0 }) {
  const videoRef = useRef(null);
  const wrapperRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    if (wrapperRef.current) observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isVisible && videoRef.current && startTime > 0) {
      videoRef.current.currentTime = startTime;
    }
  }, [isVisible, startTime]);

  return (
    <div ref={wrapperRef} className="relative aspect-video rounded-2xl border border-white/10 overflow-hidden bg-white/5">
      {isVisible && (
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          src="/promo.mp4"
          controls
          playsInline
          preload="none"
          onLoadedMetadata={() => {
            if (videoRef.current && startTime > 0) {
              videoRef.current.currentTime = startTime;
            }
          }}
        />
      )}
      <div className="absolute bottom-4 left-4 pointer-events-none">
        <p className="text-white/70 text-xs bg-black/50 px-2 py-1 rounded">{title}</p>
      </div>
    </div>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Take the Assessment",
      description: "Complete a 10-minute MBTI personality test and IQ assessment to map your unique profile.",
    },
    {
      number: "02",
      title: "Run Your Skill Gap Scan",
      description: "Upload your resume or paste your skills. Our AI compares them against any job description.",
    },
    {
      number: "03",
      title: "Get Your Career Roadmap",
      description: "Receive personalised career paths, step-by-step roadmaps, and matching job listings — instantly.",
    },
  ];
  return (
    <section className="py-24 md:py-32 bg-linear-to-b from-transparent via-blue-950/10 to-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <GradientHeading className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            How It Works
          </GradientHeading>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Three steps from uncertainty to a clear, personalised career plan.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div key={step.number} className="relative p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-colors duration-300">
              <div className="text-5xl font-bold bg-linear-to-r from-blue-400/30 to-cyan-400/30 bg-clip-text text-transparent mb-4">
                {step.number}
              </div>
              <h3 className="text-white font-semibold text-xl mb-3">{step.title}</h3>
              <p className="text-white/60 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CareerGuidanceSection() {
  return (
    <section id="demo" className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
              <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span className="text-blue-400 text-sm font-medium">AI Career Guidance</span>
            </div>
            <GradientHeading className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              AI-Powered Roadmaps Built Around You
            </GradientHeading>
            <p className="text-white/70 text-lg leading-relaxed mb-8">
              Complete your MBTI personality test and timed IQ assessment, then let the AI generate
              3–5 tailored career paths with step-by-step roadmaps, timelines, and resources —
              all specific to your profile.
            </p>
            <ul className="space-y-4 mb-8">
              {[
                "Personalized career roadmaps based on your MBTI + IQ profile",
                "3–5 career paths with match scores and job listings matched to your top path",
                "Step-by-step timelines with certifications and resources",
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
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Link href="/careercounselling"><Button variant="primary">Start Your Assessment</Button></Link>
              <Link href="/sample-report" className="text-blue-400 hover:text-blue-300 transition-colors text-sm self-center">
                See a sample report →
              </Link>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <VideoPlayer title="See Career Navigator in action" startTime={0} />
          </div>
        </div>
      </div>
    </section>
  );
}

function SkillGapSection() {
  return (
    <section id="skills" className="py-24 md:py-32 bg-linear-to-b from-transparent via-blue-950/10 to-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <VideoPlayer title="AI-powered skill analysis in action" startTime={20} />
          </div>
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
              Our AI compares your resume against any job description to surface exactly what skills
              are missing. Get a personalized learning roadmap with video tutorials and course recommendations to close the gap and land the job.
            </p>
            <div className="grid grid-cols-2 gap-4 mb-8">
              {[
                { metric: "PDF", label: "Resume Upload Supported" },
                { metric: "AI", label: "Powered Gap Analysis" },
                { metric: "Free", label: "No Credit Card Needed" },
                { metric: "Instant", label: "Results in Seconds" },
              ].map((item, index) => (
                <div key={index} className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-2xl font-bold bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">{item.metric}</div>
                  <p className="text-white/60 text-sm">{item.label}</p>
                </div>
              ))}
            </div>
            <Link href="/skillgapanalyzer"><Button variant="primary">Analyze My Skills</Button></Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const testimonials = [
    {
      quote: "I had no idea which direction to go after A-levels. Career Navigator showed me exactly why UX Design matches my personality and what skills I need to get there.",
      name: "Aisha Raza",
      university: "LUMS, Lahore",
    },
    {
      quote: "The skill gap report told me in 30 seconds what I was missing for a data analyst role. I followed the roadmap and got my first internship offer within two months.",
      name: "Hamza Tariq",
      university: "FAST-NUCES, Karachi",
    },
    {
      quote: "Every career counsellor I visited gave generic advice. Career Navigator gave me a specific roadmap with actual resources. It's the first tool that felt built for Pakistani students.",
      name: "Zara Siddiqui",
      university: "IBA Karachi",
    },
  ];
  return (
    <section className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <GradientHeading className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            What Students Are Saying
          </GradientHeading>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <div key={i} className="p-8 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-6">
              <p className="text-white/80 leading-relaxed italic">&ldquo;{t.quote}&rdquo;</p>
              <div>
                <p className="text-white font-semibold">{t.name}</p>
                <p className="text-white/50 text-sm">{t.university}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ImpactSection({ totalAssessments = 0, totalSkillGapScans = 0 }) {
  const stats = [
    { end: totalAssessments, suffix: "+", label: "Students Assessed" },
    { end: totalSkillGapScans, suffix: "+", label: "Skill Gap Scans Run" },
    { end: 100, suffix: "%", label: "Free — No Hidden Fees" },
    { end: 3, suffix: "", label: "Core Tools in One Place" },
    { end: 0, suffix: "", label: "Career Counsellors Needed" },
  ];
  return (
    <section id="impact" className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <GradientHeading className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            What You Get
          </GradientHeading>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Everything a student needs to go from uncertainty to a clear career plan.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-6">
          {stats.slice(0, 3).map((stat, index) => (
            <div key={index} className="bg-linear-to-br from-white/5 to-white/2 rounded-2xl border border-white/10 hover:border-blue-500/30 transition-colors duration-300">
              <AnimatedCounter end={stat.end} suffix={stat.suffix} label={stat.label} />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4 md:gap-6 w-2/3 mx-auto">
          {stats.slice(3).map((stat, index) => (
            <div key={index + 3} className="bg-linear-to-br from-white/5 to-white/2 rounded-2xl border border-white/10 hover:border-blue-500/30 transition-colors duration-300">
              <AnimatedCounter end={stat.end} suffix={stat.suffix} label={stat.label} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalBannerSection() {
  return (
    <section className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-blue-600/20 via-blue-500/10 to-cyan-600/20 border border-white/10">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl" />
          </div>
          <div className="relative px-6 py-16 md:px-12 md:py-24 text-center">
            <GradientHeading as="h2" className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Your Future Career Starts Today
            </GradientHeading>
            <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              Take the first step toward a career that fits who you are. Career Navigator gives you
              the clarity and direction you need — completely free.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/careercounselling"><Button variant="primary" className="w-full sm:w-auto text-base px-10 py-4">Start Your Journey Free</Button></Link>
              <a href="#demo"><Button variant="ghost" className="w-full sm:w-auto text-base px-10 py-4">Watch Demo</Button></a>
            </div>
            <p className="text-white/50 text-sm mt-6">No credit card required. Free to use.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function BelowFoldClient({ totalAssessments = 0, totalSkillGapScans = 0 }) {
  return (
    <>
      <HowItWorksSection />
      <CareerGuidanceSection />
      <SkillGapSection />
      <TestimonialsSection />
      <ImpactSection totalAssessments={totalAssessments} totalSkillGapScans={totalSkillGapScans} />
      <FinalBannerSection />
    </>
  );
}
