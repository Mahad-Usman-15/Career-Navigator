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
      id={code}
      className="rounded-2xl p-5 sm:p-6 bg-[#222222] border border-white/10 hover:border-blue-500/30 transition-colors duration-300 flex flex-col gap-5"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <header>
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-white/50">
          {code}
        </span>
        <h2
          className="text-xl sm:text-2xl font-bold mt-1 bg-clip-text text-transparent"
          style={{ backgroundImage: 'linear-gradient(135deg, hsl(221 83% 45%) 0%, hsl(199 89% 60%) 100%)' }}
        >
          {title}
        </h2>
      </header>

      <div className="flex flex-col gap-4 flex-1">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-white/40 block mb-1">Traits</span>
          <p className="text-white/80 text-sm leading-relaxed">{traits}</p>
        </div>

        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-white/40 block mb-1">Strengths</span>
          <p className="text-white/80 text-sm leading-relaxed">{strengths}</p>
        </div>

        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-white/40 block mb-1">Weaknesses</span>
          <p className="text-white/80 text-sm leading-relaxed">{weaknesses}</p>
        </div>

        <div className="pt-3 border-t border-white/10 mt-auto">
          <span className="text-xs font-semibold uppercase tracking-widest text-white/40 block mb-2">Career Fit</span>
          <div className="flex flex-wrap gap-2">
            {careers.split(", ").map((career, i) => (
              <span
                key={i}
                className="px-2.5 py-1 text-xs rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20"
              >
                {career}
              </span>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
};

export default PersonalityCard;
