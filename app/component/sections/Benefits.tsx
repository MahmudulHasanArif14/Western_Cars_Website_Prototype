"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import {
  Car,
  User2,
  Clock,
  Sparkles,
  ShieldCheck,
  Star,
  ArrowRight,
  Award,
} from "lucide-react";

import type { Variants } from "framer-motion";
interface Benefit {
  icon: any;
  title: string;
  desc: string;
  color: string;
  linear: string;
}

const benefits: Benefit[] = [
  {
    icon: Car,
    title: "Premium Fleet",
    desc: "Latest luxury models with advanced features for the ultimate comfort.",
    color: "text-blue-400",
    linear: "from-blue-500/20 to-cyan-500/20",
  },
  {
    icon: User2,
    title: "Professional Chauffeurs",
    desc: "Trained, courteous, and discreet drivers ensuring a first-class experience.",
    color: "text-purple-400",
    linear: "from-purple-500/20 to-pink-500/20",
  },
  {
    icon: Clock,
    title: "On-Time Guarantee",
    desc: "We track your schedule and adjust to ensure you're never late.",
    color: "text-green-400",
    linear: "from-green-500/20 to-emerald-500/20",
  },
  {
    icon: Sparkles,
    title: "Personalized Service",
    desc: "Tailored to your preferences with attention to every detail.",
    color: "text-amber-400",
    linear: "from-amber-500/20 to-orange-500/20",
  },
];

// Container variants for stagger animation
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 25,
      duration: 0.5,
    },
  },
};

export default function Benefits() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDarkMode = mounted && resolvedTheme === "dark";

  useEffect(() => {
    setMounted(true);
  }, []);

  // Theme-based styles
  const sectionBg = isDarkMode
    ? "bg-linear-to-b from-[#0a0e1a] via-[#0f1424] to-[#0a0e1a]"
    : "bg-linear-to-b from-[#f6f8fc] via-white to-[#f6f8fc]";
  const textColor = isDarkMode ? "text-white" : "text-gray-900";
  const textSecondary = isDarkMode ? "text-gray-400" : "text-gray-600";
  const textMuted = isDarkMode ? "text-white/50" : "text-gray-500";
  const badgeBg = isDarkMode
    ? "bg-blue-900/30 border-blue-800/50"
    : "bg-blue-50 border-blue-200";
  const badgeText = isDarkMode ? "text-blue-300" : "text-blue-700";
  const glowColor = isDarkMode
    ? "bg-blue-900/20 blur-[150px]"
    : "bg-blue-100/30 blur-[150px]";

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <section className={`relative overflow-hidden ${sectionBg} py-24`}>
        <div className="min-h-[500px]" />
      </section>
    );
  }

  return (
    <motion.section
      id="benefits"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className={`relative overflow-hidden py-24 md:py-32 ${sectionBg}`}
    >
      {/* Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute -left-40 top-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full ${glowColor}`}
        />
        {isDarkMode && (
          <>
            <div className="absolute right-0 top-0 h-[400px] w-[400px] rounded-full bg-indigo-950/20 blur-[150px]" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[200px] w-[600px] rounded-full bg-blue-950/10 blur-[150px]" />
          </>
        )}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          {/* Badge */}
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            viewport={{ once: true }}
            className={`inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-semibold tracking-wider ${badgeBg} ${badgeText}`}
          >
            <Award className="h-4 w-4" />
            WHY CHOOSE US
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className={`mt-6 text-4xl md:text-5xl lg:text-6xl font-bold leading-tight ${textColor}`}
          >
            Elevate Your{" "}
            <span className="bg-linear-to-r from-blue-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
              Journey
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className={`mt-4 max-w-2xl mx-auto text-lg ${textSecondary}`}
          >
            Experience luxury, reliability, and personalized service with every
            ride.
          </motion.p>

          {/* Decorative Line */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            viewport={{ once: true }}
            className="mx-auto mt-8 h-1 w-24 rounded-full bg-linear-to-r from-blue-500 via-purple-500 to-indigo-500"
          />
        </motion.div>

        {/* Benefits Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
        >
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{
                  y: -12,
                  scale: 1.02,
                  transition: { type: "spring", stiffness: 300, damping: 25 },
                }}
                className={`group relative rounded-2xl p-8 transition-all duration-300 ${
                  isDarkMode
                    ? "bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20"
                    : "bg-white border border-gray-100 hover:border-gray-200"
                } ${isDarkMode ? "shadow-lg shadow-black/20" : "shadow-lg shadow-gray-100/50"} hover:shadow-xl transition-all duration-300 overflow-hidden`}
              >
                {/* linear Background on Hover */}
                <div
                  className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-linear-to-br ${benefit.linear}`}
                />

                {/* Animated Border */}
                <div className="absolute inset-0 rounded-2xl p-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div
                    className={`w-full h-full rounded-2xl bg-linear-to-br ${benefit.linear}`}
                  />
                </div>

                <div className="relative z-10">
                  {/* Icon Container */}
                  <motion.div
                    initial={{ scale: 0.8, rotate: -10 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    viewport={{ once: true }}
                    className={`mb-5 inline-flex rounded-2xl p-3.5 ${
                      isDarkMode
                        ? "bg-white/10 group-hover:bg-white/20"
                        : "bg-gray-100 group-hover:bg-gray-200"
                    } transition-all duration-300`}
                  >
                    <Icon
                      className={`h-8 w-8 ${benefit.color} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                    />
                  </motion.div>

                  {/* Title */}
                  <motion.h3
                    className={`text-xl font-bold mb-3 ${textColor} transition-colors duration-300`}
                  >
                    {benefit.title}
                  </motion.h3>

                  {/* Description */}
                  <p
                    className={`text-sm leading-relaxed ${textSecondary} transition-colors duration-300`}
                  >
                    {benefit.desc}
                  </p>

                  {/* Icon Indicator */}
                  <motion.div
                    initial={{ x: -5, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                    viewport={{ once: true }}
                    className="mt-5 flex items-center gap-1 text-xs font-medium text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <span>Learn more</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </motion.div>
                </div>

                {/* Number indicator */}
                <div
                  className={`absolute top-4 right-4 text-5xl font-bold opacity-5 ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  } select-none`}
                >
                  {String(index + 1).padStart(2, "0")}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <motion.a
            href="#"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold transition-all duration-300 ${
              isDarkMode
                ? "bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-600/30"
                : "bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-600/30"
            }`}
          >
            Experience the Difference
            <ArrowRight className="h-5 w-5" />
          </motion.a>
        </motion.div>
      </div>
    </motion.section>
  );
}
