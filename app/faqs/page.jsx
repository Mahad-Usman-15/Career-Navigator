"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqData = [
  {
    question: "What is Career Navigator?",
    answer:
      "Career Navigator is your comprehensive career guidance platform designed to help students, fresh graduates, and professionals discover their ideal career paths. We provide personalized assessments, industry insights, and expert guidance to help you make informed decisions about your future.",
  },
  {
    question: "How does career guidance work?",
    answer:
      "Our career guidance process begins with understanding your unique strengths, interests, and aspirations through our assessment tools. Based on your profile, we provide personalized career recommendations, skill development roadmaps, and connect you with industry mentors who can guide you toward your goals.",
  },
  {
    question: "Who is this platform for?",
    answer:
      "Career Navigator is designed for anyone seeking career clarity — whether you're a high school student exploring options, a college student choosing your major, a fresh graduate entering the job market, or a professional looking to pivot your career. Our tools adapt to your stage of career development.",
  },
  {
    question: "How does the skill gap analyzer help?",
    answer:
      "Our Skill Gap Analyzer compares your current skillset against the requirements of your target career. It identifies areas where you need improvement and provides personalized learning recommendations, helping you bridge the gap between where you are and where you want to be.",
  },
  {
    question: "Is Career Navigator suitable for students and fresh graduates?",
    answer:
      "Absolutely! Career Navigator is especially valuable for students and fresh graduates who are at the beginning of their career journey. We provide tailored resources, internship guidance, resume building tips, and interview preparation to help you confidently take your first steps into the professional world.",
  },
  {
    question: "How do I get started?",
    answer:
      "Getting started is simple! Create your free account, complete our career assessment questionnaire, and receive your personalized career profile. From there, you can explore career paths, access learning resources, and connect with mentors — all designed to accelerate your career journey.",
  },
]

function HeroSection() {
  return (
    <section className="relative py-20 md:py-28 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-linear-to-r from-blue-700 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
          Frequently Asked Questions
        </h1>
        <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
          Find answers to common questions about Career Navigator and discover how
          we can help you achieve career clarity and confidence.
        </p>
      </div>
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-blue-500/10 rounded-full blur-3xl" />
      </div>
    </section>
  )
}

function FAQSection() {
  return (
    <section className="py-16 md:py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <Accordion type="single" collapsible className="space-y-4">
          {faqData.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border border-white/10 rounded-xl px-6 bg-white/5 backdrop-blur-sm hover:bg-white/[0.07] transition-colors"
            >
              <AccordionTrigger className="text-left py-5 hover:no-underline">
                <span className="text-base md:text-lg font-semibold bg-linear-to-r from-blue-600 via-blue-400 to-cyan-300 bg-clip-text text-transparent">
                  {faq.question}
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-white/80 text-base leading-relaxed pb-5">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}

function CTASection() {
  return (
    <section className="py-16 md:py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-blue-900/50 via-blue-800/30 to-cyan-900/40 border border-white/10 p-8 md:p-12 text-center">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl" />
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 bg-linear-to-r from-blue-500 via-blue-400 to-cyan-300 bg-clip-text text-transparent">
            Still Have Questions?
          </h2>
          <p className="text-white/80 text-base md:text-lg mb-8 max-w-xl mx-auto leading-relaxed">
            Our support team is here to help you navigate your career journey.
            Reach out to us anytime, and let&apos;s build your future together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3.5 bg-linear-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-xl hover:from-blue-500 hover:to-cyan-400 transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40">
              Contact Support
            </button>
            <button className="px-8 py-3.5 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-300">
              Start Your Journey
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-white/10 py-8 px-4">
      <div className="max-w-6xl mx-auto text-center">
        <p className="text-white/60 text-sm">
          © {new Date().getFullYear()} Career Navigator. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-[#171717]">
      <HeroSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </main>
  )
}