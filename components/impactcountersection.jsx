"use client"
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Users, Route, Brain, Trophy, Briefcase, TrendingUp } from "lucide-react";


const Counter = ({ value, suffix = "", label, icon: Icon, delay = 0 }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (isVisible) {
      const timeout = setTimeout(() => {
        const duration = 2000;
        const startTime = Date.now();

        const updateValue = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          // Easing function for smooth animation
          const easeOutQuart = 1 - Math.pow(1 - progress, 4);
          const currentValue = Math.floor(easeOutQuart * value);
          
          setDisplayValue(currentValue);

          if (progress < 1) {
            requestAnimationFrame(updateValue);
          }
        };

        requestAnimationFrame(updateValue);
      }, delay);

      return () => clearTimeout(timeout);
    }
  }, [isVisible, value, delay]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: delay / 1000 }}
      className="text-center group"
    >
      <div className="mb-4 mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-[hsl(221,83%,25%)] to-[hsl(199,89%,35%)] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-8 h-8 text-white" />
      </div>
      <div className="text-5xl lg:text-6xl font-extrabold counter-gradient mb-2">
        {displayValue.toLocaleString()}{suffix}
      </div>
      <p className="text-muted-foreground">{label}</p>
    </motion.div>
  );
};

const ImpactCounterSection = () => {
  const counters = [
    { value: 50000, suffix: "+", label: "Students Guided", icon: Users, delay: 0 },
    { value: 120, suffix: "+", label: "Career Paths Explored", icon: Route, delay: 100 },
    { value: 1000000, suffix: "+", label: "Skills Analyzed", icon: Brain, delay: 200 },
    { value: 94, suffix: "%", label: "Job-Ready Success Rate", icon: Trophy, delay: 300 },
    { value: 8500, suffix: "+", label: "Career Transitions", icon: Briefcase, delay: 400 },
    { value: 40, suffix: "%", label: "Average Salary Increase", icon: TrendingUp, delay: 500 },
  ];

  return (
    <section className="relative py-24 px-6 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[hsl(221,83%,30%)] rounded-full blur-[200px] opacity-10" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            <span className="gradient-text">Impact That Speaks</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real numbers from real transformations. See how Career Navigator is changing lives.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-6">
          {counters.map((counter) => (
            <Counter
              key={counter.label}
              value={counter.value}
              suffix={counter.suffix}
              label={counter.label}
              icon={counter.icon}
              delay={counter.delay}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ImpactCounterSection;
