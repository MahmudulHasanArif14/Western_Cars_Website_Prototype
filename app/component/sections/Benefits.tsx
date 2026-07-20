"use client";

import { motion } from "framer-motion";

export default function Benefits() {
  const benefits = [
    {
      icon: "🚗",
      title: "Premium Fleet",
      desc: "Latest luxury models with advanced features.",
    },
    {
      icon: "👔",
      title: "Professional Chauffeurs",
      desc: "Trained, courteous, and discreet.",
    },
    {
      icon: "⏱️",
      title: "On-Time Guarantee",
      desc: "We track your schedule and adjust.",
    },
    {
      icon: "✨",
      title: "Personalized Service",
      desc: "Tailored to your preferences.",
    },
  ];

  return (
    <motion.section
      id="benefits"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1 }}
      className="py-24 bg-black/95"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-sm tracking-[0.2em] uppercase text-white/50">
            Why Choose Us
          </span>
          <h2 className="text-4xl sm:text-5xl font-medium mt-2">
            Elevate Your Journey
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center"
            >
              <div className="text-4xl mb-4">{benefit.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {benefit.title}
              </h3>
              <p className="text-white/70 text-sm">{benefit.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
