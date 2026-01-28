"use client"
import { motion } from "framer-motion";
import { ArrowRight, Rocket } from "lucide-react";
import { GradientButton } from "./gradientbutton";

const ClosingBannerSection = () => {
  return (
    <section className="relative py-24 px-6 overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative rounded-3xl overflow-hidden"
        >
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(221,83%,25%)] via-[hsl(215,80%,30%)] to-[hsl(199,89%,35%)]" />
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[hsl(199,89%,60%)] rounded-full blur-[150px] opacity-30" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[hsl(221,83%,45%)] rounded-full blur-[120px] opacity-40" />
          
          {/* Grid pattern */}
          <div 
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: `linear-gradient(hsl(0 0% 100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100%) 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
            }}
          />

          <div className="relative z-10 px-8 py-16 md:px-16 md:py-20 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm mb-6"
            >
              <Rocket className="w-4 h-4 text-white" />
              <span className="text-sm text-white/90">Your journey starts here</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight"
            >
              Ready to Take Control
              <br />
              of Your Future?
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10"
            >
              Join thousands of students and graduates who've transformed confusion into clarity. 
              Your dream career is just one decision away.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <button className="inline-flex items-center justify-center gap-2 h-14 px-8 rounded-lg bg-white text-[hsl(221,83%,30%)] font-semibold text-base hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-lg hover:shadow-xl">
                Start Your Free Assessment
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="inline-flex items-center justify-center gap-2 h-14 px-8 rounded-lg bg-transparent border-2 border-white/30 text-white font-semibold text-base hover:bg-white/10 hover:border-white/50 transition-all duration-300">
                Talk to a Career Advisor
              </button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-8 text-sm text-white/60"
            >
              No credit card required • Free skill assessment • Cancel anytime
            </motion.p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ClosingBannerSection;
