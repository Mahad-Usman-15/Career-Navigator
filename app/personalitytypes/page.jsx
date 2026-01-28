import PersonalityCard from "@/components/PersonalityCard";
import { personalityTypes } from "../../components/data/personalityTypes";

const Index = () => {
  return (
    <div className="page-container">
      {/* Hero Section */}
      <header className="relative pt-16 pb-12 md:pt-24 md:pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm md:text-base font-medium uppercase tracking-[0.3em] text-muted-foreground mb-4">
            Myers-Briggs Type Indicator
          </p>
          <h1 className="gradient-text text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
            Discover Your
            <br />
            Personality Type
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Explore the 16 unique personality types, their defining traits, 
            strengths, weaknesses, and ideal career paths.
          </p>
        </div>

        {/* Decorative gradient orb */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none opacity-20 blur-3xl"
          style={{
            background: 'radial-gradient(circle, hsl(217 91% 60% / 0.4) 0%, transparent 70%)',
          }}
        />
      </header>

      {/* Personality Types Grid */}
      <main className="px-4 pb-20 md:pb-32">
        <div className="max-w-7xl mx-auto">
          {/* Type categories */}
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
  );
};
export const metadata = {
  title: "Personality Types | MBTI",
  description: "Explore the 16 unique personality types and discover your MBTI profile.",
};
export default Index;
