"use client";

import { motion } from "framer-motion";
import { useScroll } from "framer-motion";
import ThreeScene from "../../three/ThreeScene";

export default function Story() {
  const { scrollY } = useScroll();

  return (
    <motion.section
      id="story"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1 }}
      className="py-24 bg-black/95"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-sm tracking-[0.2em] uppercase text-white/50 mb-4 block">
              Our Story
            </span>
            <h2 className="text-4xl sm:text-5xl font-medium mb-6">
              More Than a Ride
            </h2>
            <p className="text-white/70 text-lg leading-relaxed mb-6">
              Western Cars was born from a simple idea: travel should be
              effortless, elegant, and personal. We combine premium vehicles
              with exceptional service to create journeys that are as memorable
              as the destinations.
            </p>
            <p className="text-white/70 text-lg leading-relaxed">
              Our fleet is meticulously maintained, our chauffeurs are
              professionally trained, and every ride is tailored to your needs.
              Whether it&apos;s a quick airport transfer or a full day of
              executive travel, we deliver a seamless experience.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <ThreeScene scrollY={scrollY} />
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
