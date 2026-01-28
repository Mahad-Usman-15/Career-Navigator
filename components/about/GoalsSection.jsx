'use client'
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight } from "lucide-react";

const goals = [
  "Bridge the gap between education and industry requirements",
  "Democratize access to quality career guidance",
  "Reduce career decision anxiety among students",
  "Create pathways for non-traditional career transitions",
  "Build a global community of empowered professionals",
];

const GoalsSection = () => {
  return (
    <section className="section-padding relative">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-3 py-1.5 mb-4 text-xs font-semibold uppercase tracking-wider text-accent bg-accent/10 rounded-full">
              Our Goals
            </span>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-6">
              Building{" "}
              <span className="text-gradient">Long-term Impact</span>
              {" "}For Generations
            </h2>
            
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Our commitment extends beyond individual success stories. We're 
              building infrastructure for lasting change in how the world 
              approaches career development and professional growth.
            </p>
            
            <div className="space-y-4">
              {goals.map((goal, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-start gap-3 group"
                >
                  <CheckCircle2 className="w-5 h-5 mt-0.5 text-accent shrink-0" />
                  <span className="text-foreground group-hover:text-accent transition-colors">
                    {goal}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          {/* Visual Side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden bg-linear-to-br from-primary/20 to-accent/20 p-1">
              <div className="bg-card rounded-[22px] p-8 md:p-12">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center">
                      <span className="text-2xl font-display font-bold text-white">2025</span>
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-lg">Short-term</h4>
                      <p className="text-sm text-muted-foreground">1 Million Active Users</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground ml-auto" />
                  </div>
                  
                  <div className="h-px bg-border" />
                  
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center">
                      <span className="text-2xl font-display font-bold text-white">2027</span>
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-lg">Mid-term</h4>
                      <p className="text-sm text-muted-foreground">50+ Countries Reached</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground ml-auto" />
                  </div>
                  
                  <div className="h-px bg-border" />
                  
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center">
                      <span className="text-2xl font-display font-bold text-white">2030</span>
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-lg">Long-term</h4>
                      <p className="text-sm text-muted-foreground">Global Career Standard</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-accent ml-auto" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default GoalsSection;
