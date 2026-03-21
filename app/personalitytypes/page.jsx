import PersonalityCard from "@/components/PersonalityCard";
import { personalityTypes } from "@/components/data/personalityTypes";

// T011: Dark theme — bg-[#171717] page background, gradient headings, text-white/60 secondary text
const Index = () => {
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
              { "@type": "ListItem", position: 2, name: "Personality Types", item: `${process.env.NEXT_PUBLIC_APP_URL}/personalitytypes` },
            ],
          }),
        }}
      />
    <div className="min-h-screen" style={{ backgroundColor: '#171717' }}>
      {/* Hero Section */}
      <header className="relative pt-16 pb-12 md:pt-24 md:pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm md:text-base font-medium uppercase tracking-[0.3em] text-white/60 mb-4">
            Myers-Briggs Type Indicator
          </p>
          <h1
            className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6"
            style={{ background: 'linear-gradient(135deg, #1e3a8a, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            Discover Your
            <br />
            Personality Type
          </h1>
          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
            Explore the 16 unique personality types, their defining traits,
            strengths, weaknesses, and ideal career paths.
          </p>
        </div>

        {/* Decorative gradient orb */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none opacity-20 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(96, 165, 250, 0.4) 0%, transparent 70%)',
          }}
        />
      </header>

      {/* Personality Types Grid */}
      <main className="px-4 pb-20 md:pb-32">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {personalityTypes.map((type, index) => (
              <PersonalityCard
                key={type.code}
                code={type.code}
                title={type.title}
                traits={type.traits}
                strengths={type.strengths}
                weaknesses={type.weaknesses}
                careers={type.careers}
                index={index}
              />
            ))}
          </div>
        </div>
      </main>

    </div>
    </>
  );
};

export const metadata = {
  title: "MBTI Personality Types — Career Navigator",
  description:
    "Explore all 16 MBTI personality types, their traits, strengths, weaknesses, and ideal career paths. Discover which type fits you.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL}/personalitytypes`,
  },
  openGraph: {
    title: "16 MBTI Personality Types — Career Navigator",
    description:
      "Explore all 16 MBTI personality types and find your ideal career match.",
    url: `${process.env.NEXT_PUBLIC_APP_URL}/personalitytypes`,
  },
};
export default Index;
