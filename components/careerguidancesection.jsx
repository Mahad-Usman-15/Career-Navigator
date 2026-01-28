"use client"
import { motion } from "framer-motion";
import { ArrowRight, Play, Users, Target, Compass } from "lucide-react";
import { GradientButton } from "./gradientbutton";

const CareerGuidanceSection = () => {
  return (
    <section className="relative py-24 px-6 overflow-hidden">
      {/* Subtle background accent */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[hsl(221,83%,30%)] rounded-full blur-[180px] opacity-10" />

      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Compass className="w-5 h-5 text-accent" />
              <span className="text-accent text-sm font-medium uppercase tracking-wider">Career Guidance</span>
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              <span className="gradient-text">Expert Mentorship</span>
              <br />
              <span className="text-foreground">For Every Step</span>
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Get personalized guidance from industry professionals who've walked your path. 
              Our mentors help you see beyond the surface, understand real-world expectations, 
              and make informed decisions about your future.
            </p>

            <div className="space-y-4 mb-8">
              {[
                { icon: Users, text: "1-on-1 sessions with industry experts" },
                { icon: Target, text: "Personalized career roadmaps" },
                { icon: Compass, text: "Real-world industry insights" },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-accent" />
                  </div>
                  <span className="text-foreground">{item.text}</span>
                </motion.div>
              ))}
            </div>

            <GradientButton>
              Get Career Guidance
              <ArrowRight className="w-5 h-5" />
            </GradientButton>
          </motion.div>

          {/* Right Content - Video Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden glass glow-effect">
              {/* Video placeholder with gradient overlay */}
              <div className="aspect-video bg-gradient-to-br from-[hsl(221,83%,15%)] to-[hsl(199,89%,20%)] relative">
                {/* Decorative elements */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full glass flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-300 group">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-r from-[hsl(221,83%,45%)] to-[hsl(199,89%,60%)] flex items-center justify-center">
                      <Play className="w-10 h-10 text-white ml-1" fill="white" />
                    </div>
                  </div>
                </div>
                
                {/* Video description overlay */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="glass rounded-lg px-4 py-3">
                    <p className="text-sm text-muted-foreground">
                      Watch: How Sarah found her dream career in UX Design
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="absolute -bottom-6 -left-6 glass rounded-xl px-5 py-4 glow-effect"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[hsl(221,83%,45%)] to-[hsl(199,89%,60%)] flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">500+</p>
                  <p className="text-sm text-muted-foreground">Mentors Available</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CareerGuidanceSection;
