"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import { ArrowRight, Star, Shield, Clock, Award } from "lucide-react";

export default function Story() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.6, 1, 1, 0.6]);
  const scale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.95, 1, 1, 0.95]);

  const stats = [
    { icon: Star, value: "4.9", label: "Average Rating" },
    { icon: Shield, value: "20+", label: "Years Experience" },
    { icon: Clock, value: "24/7", label: "Service Available" },
    { icon: Award, value: "100%", label: "Satisfaction Rate" },
  ];

  return (
    <motion.section
      ref={sectionRef}
      id="story"
      style={{ opacity, scale }}
      className="relative py-24 md:py-32 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0a0e1a] to-black" />
      
      {/* Animated Gradient Orbs */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-sm tracking-[0.15em] uppercase text-white/60 font-medium mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Our Story
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            More Than a Ride
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            Elevating travel through premium service and unwavering commitment
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            <div className="space-y-6">
              <h3 className="text-2xl md:text-3xl font-semibold text-white/90 leading-tight">
                Effortless Elegance,
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                  Personalized Journeys
                </span>
              </h3>
              
              <p className="text-white/60 text-lg leading-relaxed">
                Western Cars was born from a simple idea: travel should be
                effortless, elegant, and personal. We combine premium vehicles
                with exceptional service to create journeys that are as memorable
                as the destinations.
              </p>
              
              <p className="text-white/60 text-lg leading-relaxed">
                Our fleet is meticulously maintained, our chauffeurs are
                professionally trained, and every ride is tailored to your needs.
                Whether it&apos;s a quick airport transfer or a full day of
                executive travel, we deliver a seamless experience.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                    className="text-center p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/5 hover:border-white/20 transition-all duration-300 group hover:bg-white/10"
                  >
                    <div className="flex justify-center mb-2">
                      <Icon className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="text-xl font-bold text-white">{stat.value}</div>
                    <div className="text-xs text-white/40">{stat.label}</div>
                  </motion.div>
                );
              })}
            </div>

            {/* CTA */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300"
            >
              Learn More About Us
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </motion.button>
          </motion.div>

          {/* Right Image */}
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            {/* Glow behind image */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
            
            {/* Image Container */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
              <Image
                src="/assets/Story_dark.png"
                alt="Western Cars Story"
                width={600}
                height={700}
                className="w-full h-full object-cover"
              />
              
              {/* Floating Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="absolute bottom-6 left-6 right-6 z-20 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <span className="text-white/60 text-sm">4.9</span>
                    </div>
                    <p className="text-white/80 text-sm font-medium mt-1">
                      "Exceptional service every time"
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">WC</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full border border-white/5 rounded-3xl scale-105" />
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}