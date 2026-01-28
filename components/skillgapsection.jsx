"use client"
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Zap, CheckCircle, TrendingUp } from "lucide-react";
import { GradientButton } from "./gradientbutton";

const SkillGapSection = () => {
  const skills = [
    { name: "Technical Skills", progress: 85 },
    { name: "Communication", progress: 72 },
    { name: "Leadership", progress: 58 },
    { name: "Industry Knowledge", progress: 90 },
  ];

  return (
    <section className="relative py-24 px-6 overflow-hidden">
      {/* Background accent */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[hsl(199,89%,48%)] rounded-full blur-[200px] opacity-10" />

      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content - Visual/Analytics */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative order-2 lg:order-1"
          >
            <div className="glass rounded-2xl p-8 glow-effect">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-semibold text-foreground">Your Skill Analysis</h3>
                <div className="flex items-center gap-2 text-accent">
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-sm font-medium">+24% this month</span>
                </div>
              </div>

              <div className="space-y-6">
                {skills.map((skill, index) => (
                  <motion.div
                    key={skill.name}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-foreground">{skill.name}</span>
                      <span className="text-sm text-accent font-medium">{skill.progress}%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.progress}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.3 + index * 0.1 }}
                        className="h-full bg-gradient-to-r from-[hsl(221,83%,45%)] to-[hsl(199,89%,60%)] rounded-full"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Recommendation cards */}
              <div className="mt-8 pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground mb-4">Recommended focus areas</p>
                <div className="flex flex-wrap gap-2">
                  {["Public Speaking", "Data Analysis", "Project Management"].map((area) => (
                    <span
                      key={area}
                      className="px-3 py-1.5 rounded-full text-xs font-medium bg-secondary text-foreground"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating insight card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="absolute -top-4 -right-4 glass rounded-xl px-4 py-3 max-w-[200px]"
            >
              <div className="flex items-start gap-2">
                <Zap className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <p className="text-xs text-foreground">
                  <span className="font-semibold">AI Insight:</span> You're 3 skills away from your dream role
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="order-1 lg:order-2"
          >
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-accent" />
              <span className="text-accent text-sm font-medium uppercase tracking-wider">Skill Gap Analyzer</span>
            </div>

            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              <span className="gradient-text">Know Your Gaps.</span>
              <br />
              <span className="text-foreground">Close Them Fast.</span>
            </h2>

            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Our AI-powered analyzer compares your current skills against industry demands.
              Get personalized insights on exactly what you need to learn to become job-ready
              in your chosen field.
            </p>

            <div className="space-y-4 mb-8">
              {[
                "Comprehensive skill assessment across 100+ competencies",
                "Industry-specific benchmarking against top performers",
                "Personalized learning recommendations with resources",
              ].map((text, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">{text}</span>
                </motion.div>
              ))}
            </div>
            <Link href="/skillgapanalyzer">
              <GradientButton>
                Analyze My Skills
                <ArrowRight className="w-5 h-5" />
              </GradientButton>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SkillGapSection;
