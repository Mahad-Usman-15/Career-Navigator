'use client'
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const achievements = [
  { value: 50000, suffix: "+", label: "Students Guided", duration: 2 },
  { value: 200, suffix: "+", label: "Career Paths Explored", duration: 1.5 },
  { value: 1000000, suffix: "+", label: "Skills Analyzed", duration: 2.5 },
  { value: 15000, suffix: "+", label: "Success Stories", duration: 2 },
];

const AnimatedCounter = ({ 
  value, 
  suffix, 
  duration 
}) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    let startTime;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      setCount(Math.floor(progress * value));
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }, [isVisible, value, duration]);

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(0) + "K";
    }
    return num.toString();
  };

  return (
    <motion.div
      onViewportEnter={() => setIsVisible(true)}
      viewport={{ once: true }}
      className="text-center"
    >
      <span className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-gradient">
        {formatNumber(count)}{suffix}
      </span>
    </motion.div>
  );
};

const AchievementsSection = () => {
  return (
    <section className="section-padding relative bg-secondary/30 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-[100px]" />
      </div>
      
      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-3 py-1.5 mb-4 text-xs font-semibold uppercase tracking-wider text-accent bg-accent/10 rounded-full">
            Our Achievements
          </span>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-6">
            Numbers That{" "}
            <span className="text-gradient">Speak Volumes</span>
          </h2>
          
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Every number represents a life touched, a career transformed, 
            and a future brightened through our dedication.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {achievements.map((achievement, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <AnimatedCounter 
                  value={achievement.value} 
                  suffix={achievement.suffix}
                  duration={achievement.duration}
                />
                <p className="mt-3 text-muted-foreground font-medium">
                  {achievement.label}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AchievementsSection;
