"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1 }}
      className="py-16 bg-black/95 border-t border-white/10"
    >
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center bg-white/10 cursor-pointer">
              <Image
                src="/assets/footerlogo.png"
                alt="Western Cars Logo"
                width={50}
                height={50}
                priority
              />
            </div>
            <h1 className="text-xl font-semibold tracking-wide text-white">
              Western Cars
            </h1>
          </div>
          <p className="text-white/50 text-sm">
            Luxury rides, delivered with care.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.8 }}
        >
          <h4 className="text-white font-medium mb-4">Quick Links</h4>
          <ul className="space-y-2 text-white/50 text-sm">
            <li>
              <a href="#story" className="hover:text-white transition-colors">
                Story
              </a>
            </li>
            <li>
              <a href="#rates" className="hover:text-white transition-colors">
                Rates
              </a>
            </li>
            <li>
              <a
                href="#benefits"
                className="hover:text-white transition-colors"
              >
                Benefits
              </a>
            </li>
            <li>
              <a href="#faq" className="hover:text-white transition-colors">
                FAQ
              </a>
            </li>
          </ul>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          <h4 className="text-white font-medium mb-4">Contact</h4>
          <ul className="space-y-2 text-white/50 text-sm">
            <li>info@westerncars.co.uk</li>
            <li>01342 300000</li>
            <li>
              198 Haslett Ave E, Three Bridges, Crawley RH10 1LY, United Kingdom
            </li>
          </ul>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <h4 className="text-white font-medium mb-4">Follow Us</h4>
          <div className="flex gap-4">
            <a
              href="https://www.instagram.com/westerncarscrawley/"
              className="text-white/50 hover:text-white transition-colors"
            >
              Instagram
            </a>
            <a
              href="#"
              className="text-white/50 hover:text-white transition-colors"
            >
              Twitter
            </a>
          </div>
        </motion.div>
      </div>
      <div className="max-w-7xl mx-auto px-6 mt-8 pt-8 border-t border-white/10 text-center text-white/40 text-sm">
        &copy; 2026 Western Cars. All rights reserved.
      </div>
    </motion.footer>
  );
}
