"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { ScanFace, IndentIcon, Sun, Moon } from "lucide-react";
import type { Variants } from "framer-motion";
export default function LoginPage() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  // Stagger Animation Variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 15, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-[#2c2424]">
      {/* 1. Blurred Background Image */}
      <div
        className="absolute inset-0 z-0 scale-110 blur-[40px] opacity-40"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=2000")',
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* 2. Dark Overlay for Mood */}
      <div className="absolute inset-0 z-0 bg-black/40 backdrop-blur-sm" />

      {/* Top Right Theme Toggle */}
      <header className="absolute top-6 right-6 z-20">
        <button
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="p-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 hover:scale-105 active:scale-95 transition-all duration-300"
          aria-label="Toggle theme"
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-white/90" />
          ) : (
            <Moon className="w-5 h-5 text-white/90" />
          )}
        </button>
      </header>

      {/* 3. Main Glassmorphism Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative w-full max-w-275 mx-4 z-10 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 min-h-137.5">
          {/* LEFT SIDE: Login Form */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-gradient-to-br from-black/10 to-transparent"
          >
            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-6xl font-serif text-white tracking-wide mb-8"
            >
              Welcome
            </motion.h1>

            <motion.div variants={itemVariants} className="space-y-4 mb-6">
              <div className="space-y-1.5">
                <label className="text-sm text-white/70 font-light tracking-wide block">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="w-full bg-transparent border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-white/60 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm text-white/70 font-light tracking-wide block">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="w-full bg-transparent border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-white/60 transition-colors"
                />
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex justify-center mb-6"
            >
              <button className="text-sm text-white/60 hover:text-white/90 transition-colors underline underline-offset-4 decoration-white/20 decoration-1">
                Forgot your password?
              </button>
            </motion.div>

            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-black text-white font-medium text-sm rounded-lg py-3.5 shadow-lg shadow-black/30 hover:bg-gray-900 transition-colors mb-6"
            >
              Login
            </motion.button>

            <motion.div
              variants={itemVariants}
              className="flex items-center gap-4 mb-6"
            >
              <div className="flex-grow border-t border-white/10"></div>
              <span className="text-xs text-white/40 font-light">or</span>
              <div className="flex-grow border-t border-white/10"></div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex gap-4 mb-8">
              <button className="flex-1 flex items-center justify-center gap-2 border border-white/20 rounded-lg py-2.5 text-white/90 hover:bg-white/10 transition-colors text-sm">
                <ScanFace className="w-4 h-4" />
                Scan Face
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 border border-white/20 rounded-lg py-2.5 text-white/90 hover:bg-white/10 transition-colors text-sm">
                <IndentIcon className="w-4 h-4" />
                Instagram
              </button>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="text-center text-sm text-white/60"
            >
              Don't have an account? <br className="sm:hidden" />
              <button className="bg-white/10 border border-white/20 rounded-lg px-4 py-1.5 text-white hover:bg-white/20 transition-colors mt-2 sm:mt-0 sm:ml-2">
                Create account
              </button>
            </motion.div>
          </motion.div>

          {/* RIGHT SIDE: Portrait Image */}
          <div className="relative h-[300px] md:h-auto overflow-hidden">
            <img
              src="https://images.pexels.com/photos/13522676/pexels-photo-13522676.jpeg"
              alt="Portrait of a smiling woman with flowers"
              className="w-full h-full object-cover grayscale-[20%]"
            />
            {/* Inner glow/fade on the edge to blend with glass card */}
            <div className="absolute inset-0 bg-gradient-to-l from-black/40 to-transparent pointer-events-none" />

            {/* Text Overlay */}
            <div className="absolute bottom-8 right-8 text-right pointer-events-none">
              <h2 className="text-3xl font-serif text-white/90 tracking-wide">
                Radiate Happy
              </h2>
              <p className="text-sm text-white/70 mt-1 font-light">
                Ft. Jessica Felicio
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
