import FAQsClient from "./FAQsClient";

export const metadata = {
  title: "FAQs — Career Navigator",
  description:
    "Answers to common questions about Career Navigator's career assessments, MBTI tests, and skill gap analysis.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL}/faqs`,
  },
  openGraph: {
    title: "FAQs — Career Navigator",
    description:
      "Answers to common questions about Career Navigator's career assessments, MBTI tests, and skill gap analysis.",
    url: `${process.env.NEXT_PUBLIC_APP_URL}/faqs`,
  },
};

export default function FAQPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "What is Career Navigator?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Career Navigator is your comprehensive career guidance platform designed to help students, fresh graduates, and professionals discover their ideal career paths. We provide personalized assessments, industry insights, and expert guidance to help you make informed decisions about your future.",
                },
              },
              {
                "@type": "Question",
                name: "How does career guidance work?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Our career guidance process begins with understanding your unique strengths, interests, and aspirations through our assessment tools. Based on your profile, we provide personalized career recommendations, skill development roadmaps, and connect you with industry mentors who can guide you toward your goals.",
                },
              },
              {
                "@type": "Question",
                name: "Who is this platform for?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Career Navigator is designed for anyone seeking career clarity — whether you're a high school student exploring options, a college student choosing your major, a fresh graduate entering the job market, or a professional looking to pivot your career.",
                },
              },
              {
                "@type": "Question",
                name: "How does the skill gap analyzer help?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Our Skill Gap Analyzer compares your current skillset against the requirements of your target career. It identifies areas where you need improvement and provides personalized learning recommendations, helping you bridge the gap between where you are and where you want to be.",
                },
              },
              {
                "@type": "Question",
                name: "Is Career Navigator suitable for students and fresh graduates?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Absolutely! Career Navigator is especially valuable for students and fresh graduates who are at the beginning of their career journey. We provide tailored resources, internship guidance, resume building tips, and interview preparation to help you confidently take your first steps into the professional world.",
                },
              },
              {
                "@type": "Question",
                name: "How do I get started?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Getting started is simple! Create your free account, complete our career assessment questionnaire, and receive your personalized career profile. From there, you can explore career paths, access learning resources, and connect with mentors — all designed to accelerate your career journey.",
                },
              },
            ],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: process.env.NEXT_PUBLIC_APP_URL },
              { "@type": "ListItem", position: 2, name: "FAQs", item: `${process.env.NEXT_PUBLIC_APP_URL}/faqs` },
            ],
          }),
        }}
      />
      <FAQsClient />
    </>
  );
}
