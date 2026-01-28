'use client'
import { motion } from "framer-motion";
import { Eye, Target, Lightbulb } from "lucide-react";

const VisionSection = () => {
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
              Our Vision
            </span>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-6">
              A World Where Every{" "}
              <span className="text-gradient">Career Choice</span>
              {" "}Is Informed
            </h2>
            
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              We envision a future where no student feels lost in the maze of career 
              options. Where data-driven insights meet personal aspirations. Where 
              every graduate steps into the workforce with confidence and purpose.
            </p>
            
            <div className="space-y-4">
              {[
                { icon: Eye, text: "Clear visibility into career possibilities" },
                { icon: Target, text: "Personalized guidance for every individual" },
                { icon: Lightbulb, text: "Innovation in career discovery tools" },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-foreground">{item.text}</span>
                </div>
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
            <div className="relative aspect-square rounded-3xl bg-linear-to-br from-secondary to-muted p-8 glow-primary">
              <div className="absolute inset-0 bg-linear-to-br from-primary/10 to-accent/10 rounded-3xl" />
              <div className="relative h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-primary flex items-center justify-center">
                    <Eye className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-display font-bold mb-2">Vision 2030</h3>
                  <p className="text-muted-foreground">
                    Guiding 10 million students towards fulfilling careers
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default VisionSection;
