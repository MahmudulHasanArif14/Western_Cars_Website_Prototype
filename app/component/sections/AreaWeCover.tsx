"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { CheckCircle2, Sun, Moon, MapPin, Compass } from "lucide-react";
import { useTheme } from "next-themes";

// Dynamically import map with SSR disabled
const AreaMap = dynamic(() => import("./AreaMap"), {
  ssr: false,
  loading: () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full h-full min-h-[450px] bg-gradient-to-br from-slate-800/50 to-slate-900/50 animate-pulse rounded-2xl flex flex-col items-center justify-center gap-4 text-slate-400"
    >
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-sm font-medium">Loading map...</span>
    </motion.div>
  ),
});

const coverageAreas = [
  { name: "Crawley, Gatwick, Horley", icon: MapPin },
  { name: "Horsham, Haywards Heath", icon: MapPin },
  { name: "East Grinstead, Lingfield", icon: MapPin },
  { name: "Brighton, Worthing, Lewes", icon: MapPin },
  { name: "London and all major cities", icon: Compass },
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
    },
  },
};

export default function AreaWeCover() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  const isDarkMode = mounted && resolvedTheme === "dark";

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(isDarkMode ? "light" : "dark");
  };

  // Theme-based styles
  const sectionBg = isDarkMode
    ? "bg-gradient-to-b from-[#0a0e1a] via-[#0f1424] to-[#0a0e1a]"
    : "bg-gradient-to-b from-[#f6f8fc] via-white to-[#f6f8fc]";
  const textColor = isDarkMode ? "text-white" : "text-slate-900";
  const textSecondary = isDarkMode ? "text-slate-400" : "text-slate-600";
  const badgeBg = isDarkMode
    ? "bg-blue-900/30 border-blue-800/50"
    : "bg-blue-50 border-blue-200";
  const badgeText = isDarkMode ? "text-blue-300" : "text-blue-700";
  const cardBg = isDarkMode
    ? "bg-slate-900/60 border-slate-800 backdrop-blur-sm"
    : "bg-white border-slate-200";

  if (!mounted) {
    return (
      <section className={`relative overflow-hidden ${sectionBg} py-16`}>
        <div className="min-h-[600px]" />
      </section>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className={`relative overflow-hidden py-16 md:py-24 ${sectionBg}`}
    >
      {/* Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute -left-40 top-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full ${
            isDarkMode
              ? "bg-blue-900/20 blur-[200px]"
              : "bg-blue-100/30 blur-[200px]"
          }`}
        />
        {isDarkMode && (
          <>
            <div className="absolute right-0 top-0 h-[400px] w-[400px] rounded-full bg-indigo-950/20 blur-[150px]" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[200px] w-[600px] rounded-full bg-blue-950/10 blur-[150px]" />
          </>
        )}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className={`max-w-7xl mx-auto rounded-3xl p-6 sm:p-10 lg:p-12 border shadow-2xl transition-colors duration-300 ${cardBg}`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left Side: Text Content */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <motion.span
                  variants={itemVariants}
                  className={`inline-flex items-center gap-2 text-blue-500 font-semibold text-xs tracking-widest uppercase ${badgeBg} ${badgeText} px-4 py-2 rounded-full border`}
                >
                  <Compass className="w-4 h-4" />
                  WE COVER
                </motion.span>

                <motion.h2
                  variants={itemVariants}
                  className={`text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight ${textColor}`}
                >
                  Your Local & Long <br className="hidden sm:inline" />
                  <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
                    Distance Partner
                  </span>
                </motion.h2>

                <motion.p
                  variants={itemVariants}
                  className={`text-base sm:text-lg pt-2 leading-relaxed ${textSecondary}`}
                >
                  From Crawley to London and across the UK.{" "}
                  <br className="hidden sm:block" />
                  We've got you covered.
                </motion.p>
              </div>

              {/* Coverage List */}
              <motion.div
                variants={containerVariants}
                className="space-y-4 pt-2"
              >
                {coverageAreas.map((area, index) => {
                  const Icon = area.icon;
                  return (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      whileHover={{ x: 5 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center space-x-3 group">
                        <div className="relative">
                          <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" />
                          <CheckCircle2 className="relative w-6 h-6 text-blue-500 shrink-0 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
                        </div>
                        <span
                          className={`font-medium text-base sm:text-lg transition-colors ${textColor}`}
                        >
                          {area.name}
                        </span>
                      </div>
                      {index !== coverageAreas.length - 1 && (
                        <div
                          className={`border-b w-full transition-colors ${
                            isDarkMode
                              ? "border-slate-800/80"
                              : "border-slate-200"
                          }`}
                        />
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Stats */}
              <motion.div
                variants={itemVariants}
                className="grid grid-cols-3 gap-4 pt-4"
              >
                {[
                  { label: "Locations", value: "50+" },
                  { label: "Cities", value: "25+" },
                  { label: "Coverage", value: "100%" },
                ].map((stat, index) => (
                  <div
                    key={index}
                    className={`text-center p-3 rounded-xl ${
                      isDarkMode ? "bg-white/5" : "bg-slate-50"
                    }`}
                  >
                    <p className={`text-xl font-bold ${textColor}`}>
                      {stat.value}
                    </p>
                    <p className={`text-xs ${textSecondary}`}>{stat.label}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right Side: Map Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className={`relative w-full h-[400px] sm:h-[450px] lg:h-[550px] rounded-2xl overflow-hidden border shadow-inner transition-colors ${
                isDarkMode ? "border-slate-800" : "border-slate-200"
              }`}
            >
              {/* Top Right Toggle Button */}
              <motion.button
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                onClick={toggleTheme}
                type="button"
                className={`absolute top-4 right-4 z-[1000] px-3 py-2 rounded-xl border shadow-lg transition-all flex items-center gap-2 text-xs font-semibold backdrop-blur-md ${
                  isDarkMode
                    ? "bg-slate-900/90 border-slate-700 text-slate-200 hover:bg-slate-800"
                    : "bg-white/90 border-slate-300 text-slate-800 hover:bg-slate-100"
                }`}
              >
                {isDarkMode ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span className="hidden sm:inline">Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-indigo-500" />
                    <span className="hidden sm:inline">Dark Mode</span>
                  </>
                )}
              </motion.button>

              <AreaMap isDarkMode={isDarkMode} />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
