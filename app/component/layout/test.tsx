"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import Image from "next/image";

interface HeaderProps {
  setBookingOpen: (open: boolean) => void;
}

export default function Header({ setBookingOpen }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  const navItems = [
    "Home",
    "Corporate Account",
    "Fleet",
    "Services",
    "Contact",
    "FAQ",
  ];

  useEffect(() => {
    const sections = document.querySelectorAll("section[id]");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        threshold: 0.5,
        rootMargin: "-80px 0px -40% 0px",
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return (
    <motion.header
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 w-full z-50"
    >
      <div className="max-w-7xl mx-auto px-8 py-12 flex items-center justify-between h-5">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="h-18 w-48 relative cursor-pointer"
          id="home"
        >
          <Image
            src="/assets/logo.png"
            alt="Western Cars Logo"
            width={200}
            height={50}
            priority
          />
        </motion.div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-10">
          {navItems.map((item) => {
            const id = item.toLowerCase().replace(/\s+/g, "-");

            return (
              <motion.a
                key={id}
                href={`#${id}`}
                className={`relative text-sm tracking-wide font-medium transition-colors ${
                  activeSection === id
                    ? "text-black-500"
                    : "text-white/90 hover:text-white"
                }`}
              >
                {item}

                {activeSection === id && (
                  <motion.span
                    layoutId="active-nav"
                    className="absolute left-0 -bottom-2 h-0.5 w-full bg-orange-400 rounded-full hidden md:block"
                  />
                )}
              </motion.a>
            );
          })}
        </nav>

        {/* Desktop Button */}
        <div className="hidden md:block">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setBookingOpen(true)}
            className="px-5 py-2.5 rounded-full border border-white/20 bg-orange-500 backdrop-blur-md text-white hover:bg-orange-600 transition"
          >
            Reserve Ride
          </motion.button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="md:hidden text-white"
        >
          {mobileMenuOpen ? (
            <X className="w-7 h-7" />
          ) : (
            <Menu className="w-7 h-7" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="md:hidden px-6 pb-6"
          >
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
              <nav className="flex flex-col gap-5">
                {navItems.map((item) => {
                  const id = item.toLowerCase().replace(/\s+/g, "-");

                  return (
                    <a
                      key={id}
                      href={`#${id}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`transition-colors text-lg ${
                        activeSection === id
                          ? "text-yellow-400 font-semibold"
                          : "text-white/90 hover:text-white"
                      }`}
                    >
                      {item}
                    </a>
                  );
                })}

                <button
                  onClick={() => {
                    setBookingOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="mt-2 px-5 py-3 rounded-full bg-white text-black font-medium hover:bg-gray-200 transition"
                >
                  Reserve Ride
                </button>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
