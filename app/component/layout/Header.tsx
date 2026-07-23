"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, Sun, Moon } from "lucide-react";
import Image from "next/image";
import { getLenis } from "@/lib/lenis";
import { useTheme } from "next-themes";

interface HeaderProps {
  setBookingOpen: (open: boolean) => void;
}

const servicesMenu = [
  {
    title: "Business Services",
    items: [
      { label: "Open Account", href: "/business/open-account" },
      { label: "Business Accounts", href: "/business/accounts" },
      { label: "Travel Management Tool", href: "/business/travel-management" },
      { label: "Commercial Partnership", href: "/business/partnership" },
    ],
  },
  {
    title: "Passenger Services",
    items: [
      { label: "All Services", href: "/services" },
      { label: "A to B Transfers", href: "/services/a-to-b" },
      { label: "Airport Transfers", href: "/services/airport-transfers" },
      {
        label: "National / International",
        href: "/services/national-international",
      },
      { label: "Download the App", href: "/download-app" },
    ],
  },
];

const scrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
  e.preventDefault();

  const lenis = getLenis();

  if (lenis) {
    lenis.scrollTo(`#${id}`, {
      duration: 1.5,
    });
  }
};

export default function Header({ setBookingOpen }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const isDark = resolvedTheme === "dark";

  // Theme-based styles
  

  const textColor = "text-white";
  const textColorHover =  "hover:text-white" ;
  const textColorMuted = "text-white/90" ;
  const textColorMutedHover = "hover:text-white";

  const mobileMenuBg = isDark
    ? "bg-[#1a1f2f]/95 backdrop-blur-xl border border-white/10"
    : "bg-white/95 backdrop-blur-xl border border-gray-200/50";

  const dropdownBg = isDark
    ? "bg-[#1a1f2f]/95 backdrop-blur-xl border border-white/10"
    : "bg-white/95 backdrop-blur-xl border border-gray-200/50";

  const dropdownText = isDark
    ? "text-white/90 hover:text-blue-400"
    : "text-gray-600 hover:text-orange-500";
  const dropdownTitle = isDark ? "text-white" : "text-gray-800";

  const buttonBg = isDark
    ? "bg-orange-500 hover:bg-orange-600"
    : "bg-orange-500 hover:bg-orange-600";

  const mobileButtonBg = isDark
    ? "bg-orange-500 hover:bg-orange-600 text-white"
    : "bg-orange-500 hover:bg-orange-600 text-white";

  const themeToggleBg =  "bg-white/10 hover:bg-white/20 border border-white/20"
    

  const activeNavColor = "text-white" ;
  const activeIndicatorColor = isDark ? "bg-orange-400" : "bg-orange-500";

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 inset-x-0 z-50 w-full transition-all duration-300 `}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 lg:px-8 py-4 lg:py-5">
        {/* Logo */}
        <motion.a
          href="#home"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="h-12 w-48 relative cursor-pointer shrink-0"
          onClick={(e) => scrollTo(e, "home")}
        >
          <Image
            src={"/assets/logo.png"}
            alt="Western Cars Logo"
            width={200}
            height={50}
            priority
            className="object-contain"
          />
        </motion.a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 lg:gap-10">
          <motion.a
            href="#home"
            onClick={(e) => scrollTo(e, "home")}
            className={`relative text-sm tracking-wide font-medium transition-colors ${
              activeSection === "home"
                ? activeNavColor
                : `${textColorMuted} ${textColorMutedHover}`
            }`}
          >
            Home
            {activeSection === "home" && (
              <motion.span
                layoutId="desktop-active-nav"
                className={`absolute left-0 -bottom-2 h-0.5 w-full ${activeIndicatorColor} rounded-full`}
              />
            )}
          </motion.a>
          <motion.a
            href="#corporate-account"
            onClick={(e) => scrollTo(e, "corporate-account")}
            className={`relative text-sm tracking-wide font-medium transition-colors ${
              activeSection === "corporate-account"
                ? activeNavColor
                : `${textColorMuted} ${textColorMutedHover}`
            }`}
          >
            Corporate Account
            {activeSection === "corporate-account" && (
              <motion.span
                layoutId="desktop-active-nav"
                className={`absolute left-0 -bottom-2 h-0.5 w-full ${activeIndicatorColor} rounded-full`}
              />
            )}
          </motion.a>
          <motion.a
            href="#fleet"
            onClick={(e) => scrollTo(e, "fleet")}
            className={`relative text-sm tracking-wide font-medium transition-colors ${
              activeSection === "fleet"
                ? activeNavColor
                : `${textColorMuted} ${textColorMutedHover}`
            }`}
          >
            Fleet
            {activeSection === "fleet" && (
              <motion.span
                layoutId="desktop-active-nav"
                className={`absolute left-0 -bottom-2 h-0.5 w-full ${activeIndicatorColor} rounded-full`}
              />
            )}
          </motion.a>

          <motion.div
            className="relative"
            onMouseEnter={() => setServicesOpen(true)}
            onMouseLeave={() => setServicesOpen(false)}
          >
            <button
              onClick={() => setServicesOpen(!servicesOpen)}
              className={`flex items-center gap-1 ${textColor} ${textColorHover} transition-colors text-sm tracking-wide font-medium`}
            >
              Services <ChevronDown size={16} />
            </button>
            <AnimatePresence>
              {servicesOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className={`absolute top-10 left-1/2 -translate-x-1/2 w-150 lg:w-155 h-auto rounded-2xl shadow-2xl p-8 ${dropdownBg}`}
                >
                  <div className="grid grid-cols-2 gap-10">
                    {servicesMenu.map((section) => (
                      <div key={section.title}>
                        <h3 className={`font-semibold mb-4 ${dropdownTitle}`}>
                          {section.title}
                        </h3>
                        <div className="space-y-3">
                          {section.items.map((link) => (
                            <motion.a
                              key={link.label}
                              href={link.href}
                              className={`block transition-colors ${dropdownText}`}
                            >
                              {link.label}
                            </motion.a>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.a
            href="#contact"
            className={`relative text-sm tracking-wide font-medium transition-colors ${
              activeSection === "contact"
                ? activeNavColor
                : `${textColorMuted} ${textColorMutedHover}`
            }`}
            onClick={(e) => scrollTo(e, "contact")}
          >
            Contact
            {activeSection === "contact" && (
              <motion.span
                layoutId="desktop-active-nav"
                className={`absolute left-0 -bottom-2 h-0.5 w-full ${activeIndicatorColor} rounded-full`}
              />
            )}
          </motion.a>
          <motion.a
            href="#faq"
            onClick={(e) => scrollTo(e, "faq")}
            className={`relative text-sm tracking-wide font-medium transition-colors ${
              activeSection === "faq"
                ? activeNavColor
                : `${textColorMuted} ${textColorMutedHover}`
            }`}
          >
            FAQ
            {activeSection === "faq" && (
              <motion.span
                layoutId="desktop-active-nav"
                className={`absolute left-0 -bottom-2 h-0.5 w-full ${activeIndicatorColor} rounded-full`}
              />
            )}
          </motion.a>
        </nav>

        {/* Right side buttons */}
        <div className="hidden md:flex items-center gap-3">
          {/* Theme Toggle */}
          {mounted && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className={`p-2.5 rounded-full transition-all duration-300 ${themeToggleBg}`}
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="h-5 w-5 text-yellow-400" />
              ) : (
                <Moon className="h-5 w-5 text-white-400" />
              )}
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setBookingOpen(true)}
            className={`px-6 py-2.5 rounded-full text-white font-medium transition-all duration-300 ${buttonBg} shadow-lg shadow-orange-500/25`}
          >
            Sign In
          </motion.button>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-3 md:hidden">
          {mounted && (
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className={`p-2 rounded-full transition-all duration-300 ${themeToggleBg}`}
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="h-5 w-5 text-yellow-400" />
              ) : (
                <Moon className="h-5 w-5 text-slate-700" />
              )}
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className={textColor}
          >
            {mobileMenuOpen ? (
              <X className="w-7 h-7" />
            ) : (
              <Menu className="w-7 h-7" />
            )}
          </button>
        </div>
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
            <div className={`rounded-3xl p-6 ${mobileMenuBg}`}>
              <nav className="flex flex-col gap-5">
                <motion.a
                  href="#home"
                  onClick={(e) => {
                    scrollTo(e, "home");
                    setMobileMenuOpen(false);
                  }}
                  className={`transition-colors ${
                    activeSection === "home"
                      ? `${activeNavColor} font-semibold`
                      : `${textColorMuted} ${textColorMutedHover}`
                  }`}
                >
                  Home
                </motion.a>
                <motion.a
                  href="#corporate-account"
                  onClick={(e) => {
                    scrollTo(e, "corporate-account");
                    setMobileMenuOpen(false);
                  }}
                  className={`transition-colors ${
                    activeSection === "corporate-account"
                      ? `${activeNavColor} font-semibold`
                      : `${textColorMuted} ${textColorMutedHover}`
                  }`}
                >
                  Corporate Account
                </motion.a>
                <motion.a
                  href="#fleet"
                  onClick={(e) => {
                    scrollTo(e, "fleet");
                    setMobileMenuOpen(false);
                  }}
                  className={`transition-colors ${
                    activeSection === "fleet"
                      ? `${activeNavColor} font-semibold`
                      : `${textColorMuted} ${textColorMutedHover}`
                  }`}
                >
                  Fleet
                </motion.a>

                <motion.div className="relative">
                  <button
                    onClick={() => setServicesOpen((prev) => !prev)}
                    className={`flex items-center justify-between w-full ${textColor} ${textColorHover}`}
                  >
                    <span>Services</span>
                    <motion.div
                      animate={{ rotate: servicesOpen ? 180 : 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <ChevronDown size={18} />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {servicesOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className={`mt-4 rounded-2xl p-6 ${dropdownBg}`}>
                          <div className="grid grid-cols-2 gap-6">
                            {servicesMenu.map((section) => (
                              <div key={section.title}>
                                <h3
                                  className={`font-semibold mb-3 ${dropdownTitle}`}
                                >
                                  {section.title}
                                </h3>
                                <div className="space-y-2.5">
                                  {section.items.map((link) => (
                                    <motion.a
                                      key={link.label}
                                      href={link.href}
                                      className={`block text-sm transition-colors ${dropdownText}`}
                                    >
                                      {link.label}
                                    </motion.a>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                <motion.a
                  href="#contact"
                  onClick={(e) => {
                    scrollTo(e, "contact");
                    setMobileMenuOpen(false);
                  }}
                  className={`transition-colors ${
                    activeSection === "contact"
                      ? `${activeNavColor} font-semibold`
                      : `${textColorMuted} ${textColorMutedHover}`
                  }`}
                >
                  Contact
                </motion.a>
                <motion.a
                  href="#faq"
                  onClick={(e) => {
                    scrollTo(e, "faq");
                    setMobileMenuOpen(false);
                  }}
                  className={`transition-colors ${
                    activeSection === "faq"
                      ? `${activeNavColor} font-semibold`
                      : `${textColorMuted} ${textColorMutedHover}`
                  }`}
                >
                  FAQ
                </motion.a>

                <button
                  onClick={() => {
                    setBookingOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className={`mt-2 px-5 py-3 rounded-full font-medium transition-all duration-300 ${mobileButtonBg}`}
                >
                  Sign In
                </button>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
