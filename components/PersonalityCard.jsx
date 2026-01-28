import { cn } from "@/lib/utils";

const PersonalityCard = ({
  code,
  title,
  traits,
  strengths,
  weaknesses,
  careers,
  index,
}) => {
  return (
    <article
      className={cn(
        "personality-card card-glow animate-fade-up"
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="space-y-5">
        <header>
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            {code}
          </span>
          <h2 className="gradient-text text-2xl md:text-3xl font-bold mt-1">
            {title}
          </h2>
        </header>

        <div className="space-y-4">
          <div>
            <span className="trait-label">Traits</span>
            <p className="text-foreground/90 leading-relaxed">{traits}</p>
          </div>

          <div>
            <span className="trait-label">Strengths</span>
            <p className="text-foreground/90 leading-relaxed">{strengths}</p>
          </div>

          <div>
            <span className="trait-label">Weaknesses</span>
            <p className="text-foreground/90 leading-relaxed">{weaknesses}</p>
          </div>

          <div className="pt-2 border-t border-border/50">
            <span className="trait-label">Career Fit</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {careers.split(", ").map((career, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 text-sm rounded-full bg-secondary/50 text-foreground/80 border border-border/30"
                >
                  {career}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default PersonalityCard;
