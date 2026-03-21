import HeroSection from "./HeroSection";
import BelowFoldWrapper from "./BelowFoldWrapper";

export const metadata = {
  title: "Career Navigator — AI Career Guidance Pakistan",
  description:
    "Discover your ideal career path with AI-powered MBTI assessments, skill gap analysis, and personalized roadmaps for students in Pakistan.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL}/home`,
  },
  openGraph: {
    title: "Career Navigator — AI Career Guidance Pakistan",
    description:
      "Discover your ideal career path with AI-powered MBTI assessments, skill gap analysis, and personalized roadmaps for students in Pakistan.",
    url: `${process.env.NEXT_PUBLIC_APP_URL}/home`,
  },
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#171717]">
      <HeroSection />
      <BelowFoldWrapper />
    </main>
  );
}
