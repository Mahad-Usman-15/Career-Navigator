"use client"
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { GradientButton } from "./gradientbutton";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-6 py-20">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[hsl(221,83%,30%)] rounded-full blur-[150px] opacity-20 animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[hsl(199,89%,48%)] rounded-full blur-[150px] opacity-15 animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
      </div>

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(0 0% 100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100%) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4 text-accent" />
            Your future starts with clarity
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight mb-6"
        >
          <span className="gradient-text">Navigate Your Career</span>
          <br />
          <span className="text-foreground">With Confidence</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
        >
          Stop guessing. Start growing. Discover your strengths, bridge skill gaps, 
          and find the career path that's truly meant for you.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <GradientButton size="lg">
            Discover Your Path
            <ArrowRight className="w-5 h-5" />
          </GradientButton>
          <GradientButton variant="secondary" size="lg">
            Watch How It Works
          </GradientButton>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 pt-8 border-t border-border/50"
        >
          <p className="text-sm text-muted-foreground mb-4">Trusted by students from</p>
          <div className="flex flex-wrap justify-center gap-8 opacity-50">
            {["Stanford", "MIT", "Harvard", "Berkeley", "Yale"].map((uni) => (
              <span key={uni} className="text-lg font-semibold text-foreground/70">
                {uni}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
