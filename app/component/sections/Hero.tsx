"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Header from "../layout/Header";

interface HeroProps {
  setBookingOpen: (value: boolean) => void;
}

export default function Hero({ setBookingOpen }: HeroProps) {
  const heroRef = useRef(null);


  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 1.1]);

  return (
    <section
      ref={heroRef}
      className="relative h-screen overflow-hidden"
      id="Home"
    >
      {/* video background */}
      <motion.div
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="absolute inset-0 overflow-hidden"
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 w-full max-h-full object-cover "
        >
          <source src="/assets/hero.webm" type="video/webm" />
          <source src="/assets/hero.mp4" type="video/mp4" />
        </video>
      </motion.div>

      <div className="absolute inset-0 bg-black/45" />
      <div className="absolute inset-0 bg-linear-to-b from-black/30 via-black/10 to-black/60" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-175 h-175 bg-white/10 blur-3xl rounded-full" />

      <div className="relative z-20 h-full flex flex-col">
        <Header setBookingOpen={setBookingOpen} />

        <main className="flex-1 flex items-center justify-center">
          <div className="max-w-6xl mx-auto px-6 text-center -mt-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2  px-4 py-2 rounded-full border border-white/15 bg-white/10 backdrop-blur-md md:mb-8"
            >
              <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-xs tracking-[0.25em] uppercase text-white/90 font-semibold">
                Private Taxi Hire
              </span>
            </motion.div>

            <div className="space-y-5 md:space-y-0 leading-none tracking-[-0.06em]">
              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-5xl sm:text-7xl md:text-8xl lg:text-[9rem] font-medium text-white/70"
              >
                Premium.
              </motion.h1>
              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-5xl sm:text-7xl md:text-8xl lg:text-[9rem] font-medium text-white -mt-5 md:-mt-8"
              >
                Accessible.
              </motion.h1>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-14 md:mt-8 text-lg md:text-xl text-white/75 max-w-2xl mx-auto leading-relaxed"
            >
              Luxury airport transfers and executive private travel designed for
              comfort, elegance, and seamless journeys.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-10 flex flex-wrap items-center justify-center gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group px-7 py-3.5 rounded-full bg-white text-black font-medium hover:bg-gray-200 transition-colors flex items-center gap-2 shadow-2xl"
              >
                Discover
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setBookingOpen(true)}
                className="px-7 py-3.5 rounded-full border border-white/20    bg-linear-to-br
    from-[#3B82F6]
    to-[#2563EB] 
    shadow-[0_10px_30px_rgba(37,99,235,0.35)]
   
    
    backdrop-blur-md text-white  hover:shadow-lg hover:bg-white/20 transition-colors font-medium"
              >
                Book Now
              </motion.button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-20 flex flex-wrap items-center justify-center gap-10 text-white/70"
            >
              <motion.div whileHover={{ scale: 1.1 }}>
                <h3 className="text-2xl font-semibold text-white">24/7</h3>
                <p className="text-sm mt-1">Luxury Service</p>
              </motion.div>
              <div className="w-px h-10 bg-white/20 hidden sm:block" />
              <motion.div whileHover={{ scale: 1.1 }}>
                <h3 className="text-2xl font-semibold text-white">500+</h3>
                <p className="text-sm mt-1">Premium Transfers</p>
              </motion.div>
              <div className="w-px h-10 bg-white/20 hidden sm:block" />
              <motion.div whileHover={{ scale: 1.1 }}>
                <h3 className="text-2xl font-semibold text-white">VIP</h3>
                <p className="text-sm mt-1">Executive Experience</p>
              </motion.div>
            </motion.div>
          </div>
        </main>
      </div>
    </section>
  );
}
