'use client'
import { motion } from "framer-motion";
import { Compass, LineChart, Users, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

const services = [
  {
    icon: Compass,
    title: "Career Navigation",
    description: "AI-powered pathways that match your skills, interests, and aspirations with the perfect career opportunities.",
  },
  {
    icon: LineChart,
    title: "Skill Analysis",
    description: "Comprehensive assessments that identify your strengths and highlight areas for growth and development.",
  },
  {
    icon: Users,
    title: "Expert Guidance",
    description: "Connect with industry mentors and career coaches who provide personalized insights and advice.",
  },
  {
    icon: Rocket,
    title: "Growth Planning",
    description: "Strategic roadmaps designed to accelerate your professional development and career advancement.",
  },
];

const ServicesSection = () => {
  return (
    <section className="section-padding relative bg-secondary/30">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Visual Side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="order-2 lg:order-1"
          >
            <div className="grid grid-cols-2 gap-4">
              {services.map((service, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors group"
                >
                  <div className="w-12 h-12 mb-4 rounded-xl bg-gradient-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                    <service.icon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-display font-semibold mb-2">{service.title}</h4>
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="order-1 lg:order-2"
          >
            <span className="inline-block px-3 py-1.5 mb-4 text-xs font-semibold uppercase tracking-wider text-accent bg-accent/10 rounded-full">
              Our Services
            </span>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-6">
              Comprehensive{" "}
              <span className="text-gradient">Career Solutions</span>
              {" "}For Your Journey
            </h2>
            
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              From skill discovery to career placement, we provide end-to-end 
              support for students and graduates navigating the complex world 
              of professional opportunities. Our data-driven approach ensures 
              personalized recommendations that truly resonate.
            </p>
            
            <Button className="bg-gradient-primary hover:opacity-90 text-white font-semibold px-8 py-6 text-lg rounded-xl transition-all hover:scale-105">
              Explore Our Services
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
