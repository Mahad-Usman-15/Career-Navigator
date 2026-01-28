"use client"
import { motion } from "framer-motion";
import { Mail, MapPin, Clock, ArrowRight } from "lucide-react";

const contactMethods = [
  {
    icon: Mail,
    title: "Email Us",
    description: "Our team will respond within 24 hours",
    info: "hello@company.com",
    link: "mailto:hello@company.com",
  },
  {
    icon: MapPin,
    title: "Visit Us",
    description: "Come say hello at our office",
    info: "123 Innovation Street, San Francisco, CA 94102",
  },
  {
    icon: Clock,
    title: "Business Hours",
    description: "We're here to help",
    info: "Mon - Fri: 9:00 AM - 6:00 PM PST",
  },
];

const ContactInfo = () => {
  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      {contactMethods.map((method, index) => (
        <motion.div
          key={method.title}
          className="glass-card rounded-xl p-6 group hover:border-primary/50 transition-all duration-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary/10 text-primary shrink-0">
              <method.icon className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-foreground mb-1">
                {method.title}
              </h3>
              <p className="text-muted-foreground text-sm mb-2">
                {method.description}
              </p>
              {method.link ? (
                <a
                  href={method.link}
                  className="text-primary hover:text-primary/80 font-medium inline-flex items-center gap-2 transition-colors"
                >
                  {method.info}
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </a>
              ) : (
                <p className="text-foreground font-medium">{method.info}</p>
              )}
            </div>
          </div>
        </motion.div>
      ))}

      {/* Social proof */}
      <motion.div
        className="mt-8 pt-8 border-t border-border"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <p className="text-muted-foreground text-sm mb-4">Trusted by leading companies</p>
        <div className="flex gap-6 opacity-50">
          <div className="text-foreground font-semibold">Company A</div>
          <div className="text-foreground font-semibold">Company B</div>
          <div className="text-foreground font-semibold">Company C</div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ContactInfo;
