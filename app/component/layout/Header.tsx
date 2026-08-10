"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, Sun, Moon } from "lucide-react";
import Image from "next/image";
import { getLenis } from "@/lib/lenis";
import { useTheme } from "next-themes";
interface HeaderProps {
  background?: string;
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

const scrollTo = (
  e: React.MouseEvent<HTMLElement>,
  id: string,
  setActiveSection?: (id: string) => void,
) => {
  e.preventDefault();
  setActiveSection?.(id);

  const attemptScroll = (attempts = 0) => {
    const element = document.getElementById(id);

    if (element) {
      const lenis = getLenis();
      if (lenis) {
        lenis.scrollTo(element, {
          duration: 1.5,
          onComplete: () => {
            setActiveSection?.(id);
          },
        });
      } else {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        setActiveSection?.(id);
      }
      return true;
    }

    if (attempts < 15) {
      setTimeout(() => attemptScroll(attempts + 1), 200);
      return false;
    }

    const section = document.querySelector(`[id="${id}"]`);
    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      setActiveSection?.(id);
      return true;
    }

    console.warn(`Element #${id} not found after ${attempts} attempts`);
    return false;
  };

  attemptScroll();
};

export default function Header({ background }: HeaderProps) {


  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  // Ref to always hold the current activeSection inside closure listeners
  const activeSectionRef = useRef(activeSection);
  // Keep activeSectionRef updated whenever activeSection changes
  useEffect(() => {
    activeSectionRef.current = activeSection;
  }, [activeSection]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const lenis = getLenis();
    if (!lenis) return;

    const navIds = new Set([
      "home",
      "story",
      "services",
      "review-card",
      "benefits",
      "areaWeCover",
      "faq",
    ]);

    // Always get fresh elements from the DOM
    const getSections = (): HTMLElement[] =>
      Array.from(document.querySelectorAll("[id]")).filter((el) =>
        navIds.has(el.id),
      ) as HTMLElement[];

    const handleScroll = () => {
      const scrollY = lenis.scroll;
      const viewportTop = scrollY + 100; // header height offset
      let current = "";

      const sections = getSections(); // fetch live
      let lastValidSection: string | null = null;

      for (const section of sections) {
        const rect = section.getBoundingClientRect();
        // Ignore hidden / empty elements
        if (rect.height === 0 || rect.width === 0) continue;

        const sectionTop = rect.top + scrollY;
        const sectionBottom = sectionTop + rect.height;

        if (rect.top <= window.innerHeight) {
          lastValidSection = section.id; // any section in view
        }

        if (viewportTop >= sectionTop && viewportTop < sectionBottom) {
          current = section.id;
          break; // first match wins (top to bottom order)
        }
      }

      // Fallback: if we're near the page bottom, force last section
      if (!current && lastValidSection) {
        const maxScroll = document.body.scrollHeight - window.innerHeight;
        if (scrollY >= maxScroll - 5) {
          current = lastValidSection;
        }
      }

      if (current && current !== activeSectionRef.current) {
        setActiveSection(current);
      }
    };

    lenis.on("scroll", handleScroll);
    handleScroll();

    // Resize / layout shift → re‑eval
    const observer = new ResizeObserver(() => handleScroll());
    observer.observe(document.body);

    return () => {
      lenis.off("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  const isDark = mounted && resolvedTheme === "dark";

  const isHome = activeSection === "home";

  // --- Colour classes based on section ---
  const headerBg = isHome
    ? "bg-transparent"
    : isDark
      ? "bg-[#1a1f2f]/50 backdrop-blur-lg border-b border-white/10"
      : "bg-[#FFF7EB]/50 backdrop-blur-lg border-b border-gray-200/50 shadow-sm";


  const backgroundColor = background ? background : headerBg;
 
  
  // service Section dropdown colors
  const textColor = isHome ? "text-white" : isDark? "text-white": "text-black";



  const textColorHover = isDark ? "hover:text-white" : "hover:text-black";




  const textColorMuted = isHome ? "text-white/90" :isDark?"text-white/90": "text-black/90";



  const textColorMutedHover =  "hover:text-grey-900";
  
  const activeNavColor = isHome ? "text-white" : isDark? "text-white": "text-black";
  const activeIndicatorColor = isDark ? "bg-orange-400" : "bg-orange-500";


   const mobileMenuBg = isHome
     ? isDark
       ? "bg-[#1a1f2f]/95 backdrop-blur-xl border border-white/10"
       : "bg-black/20 backdrop-blur-xl border border-gray-200/50"
     : isDark
       ? "bg-[#1a1f2f]/95 backdrop-blur-xl border border-white/10"
       : "bg-black/20 backdrop-blur-xl border border-gray-200/50";

 


  const dropdownBg = isHome
    ? isDark
      ? "bg-[#1a1f2f]/95 backdrop-blur-xl border border-white/10"
      : "bg-white/95 backdrop-blur-xl border border-gray-200/50"
    : isDark
      ? "bg-[#1a1f2f]/95 backdrop-blur-xl border border-white/10"
      : "bg-white/95 backdrop-blur-xl border border-gray-200/50";
  

const dropdownText = isHome
  ? isDark
    ? "text-white/90 hover:text-blue-400"
    : "text-gray-600 hover:text-orange-500"
  : isDark
    ? "text-white/90 hover:text-blue-400"
    : "text-gray-600 hover:text-orange-500";
  






  
const dropdownTitle = isHome
  ? isDark
    ? "text-white"
    : "text-gray-800"
  : isDark
    ? "text-white"
      : "text-gray-800";
  
  

  const buttonBg = "bg-orange-500 hover:bg-orange-600";
  const mobileButtonBg = "bg-orange-500 hover:bg-orange-600 text-white";
const themeToggleBg = isHome
  ? "bg-white/10 hover:bg-white/20 border border-white/20"
  : "bg-gray-100 hover:bg-gray-200 border border-gray-300";



  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 inset-x-0 z-50 w-full transition-all duration-300 ${
        background || headerBg
      }  `}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 lg:px-8 py-4 lg:py-5">
        {/* Logo */}
        <motion.a
          href="#home"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className={`h-12 w-48 relative cursor-pointer shrink-0`}
          onClick={(e) => scrollTo(e, "home", setActiveSection)}
        >
          <Image
            src="/assets/logo.png"
            alt="Western Cars Logo"
            width={200}
            height={50}
            priority
            className="object-contain"
          />
        </motion.a>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8  lg:gap-10">
          <motion.a
            href="#home"
            onClick={(e) => scrollTo(e, "home", setActiveSection)}
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
            href="#story"
            onClick={(e) => scrollTo(e, "story", setActiveSection)}
            className={`relative text-sm tracking-wide font-medium transition-colors ${
              activeSection === "story"
                ? activeNavColor
                : `${textColorMuted} ${textColorMutedHover}`
            }`}
          >
            Our Story
            {activeSection === "story" && (
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
              onClick={(e) => {
                setServicesOpen(!servicesOpen);
                scrollTo(e, "services", setActiveSection);
              }}
              className={`flex items-center gap-1 ${textColor} ${textColorHover} transition-colors text-sm tracking-wide font-medium cursor-pointer`}
            >
              Services
              {activeSection === "services" && (
                <motion.span
                  layoutId="desktop-active-nav"
                  className={`absolute left-0 -bottom-2 h-0.5 w-full ${activeIndicatorColor} rounded-full`}
                />
              )}
              <motion.div
                animate={{ rotate: servicesOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setServicesOpen(!servicesOpen);
                }}
                className="cursor-pointer"
              >
                <ChevronDown
                  size={16}
                  className={`transition-colors ${
                    servicesOpen ? "text-orange-400" : "text-gray-400"
                  }`}
                />
              </motion.div>
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
            href="#review-card"
            onClick={(e) => scrollTo(e, "review-card", setActiveSection)}
            className={`relative text-sm tracking-wide font-medium transition-colors ${
              activeSection === "review-card"
                ? activeNavColor
                : `${textColorMuted} ${textColorMutedHover}`
            }`}
          >
            Reviews
            {activeSection === "review-card" && (
              <motion.span
                layoutId="desktop-active-nav"
                className={`absolute left-0 -bottom-2 h-0.5 w-full ${activeIndicatorColor} rounded-full`}
              />
            )}
          </motion.a>

          <motion.a
            href="#benefits"
            onClick={(e) => scrollTo(e, "benefits", setActiveSection)}
            className={`relative text-sm tracking-wide font-medium transition-colors ${
              activeSection === "benefits"
                ? activeNavColor
                : `${textColorMuted} ${textColorMutedHover}`
            }`}
          >
            About
            {activeSection === "benefits" && (
              <motion.span
                layoutId="desktop-active-nav"
                className={`absolute left-0 -bottom-2 h-0.5 w-full ${activeIndicatorColor} rounded-full`}
              />
            )}
          </motion.a>

          <motion.a
            href="#areaWeCover"
            onClick={(e) => scrollTo(e, "areaWeCover", setActiveSection)}
            className={`relative text-sm tracking-wide font-medium transition-colors ${
              activeSection === "areaWeCover"
                ? activeNavColor
                : `${textColorMuted} ${textColorMutedHover}`
            }`}
          >
            Coverage
            {activeSection === "areaWeCover" && (
              <motion.span
                layoutId="desktop-active-nav"
                className={`absolute left-0 -bottom-2 h-0.5 w-full ${activeIndicatorColor} rounded-full`}
              />
            )}
          </motion.a>

          <motion.a
            href="#faq"
            onClick={(e) => scrollTo(e, "faq", setActiveSection)}
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
        <div className="hidden lg:flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-6 py-2.5 rounded-full text-white font-medium transition-all duration-300 ${buttonBg} shadow-lg shadow-orange-500/25`}
          >
            Sign In
          </motion.button>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-3 lg:hidden">
          {/* {mounted && (
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
          )} */}

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
            className="lg:hidden px-6 pb-6"
          >
            <div className={`rounded-3xl p-6 ${mobileMenuBg}`}>
              <nav className="flex flex-col gap-5">
                <motion.a
                  href="#home"
                  onClick={(e) => {
                    scrollTo(e, "home", setActiveSection);
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
                  href="#story"
                  onClick={(e) => {
                    scrollTo(e, "story", setActiveSection);
                    setMobileMenuOpen(false);
                  }}
                  className={`transition-colors ${
                    activeSection === "story"
                      ? `${activeNavColor} font-semibold`
                      : `${textColorMuted} ${textColorMutedHover}`
                  }`}
                >
                  Our Story
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
                                      onClick={(e) => {
                                        scrollTo(
                                          e,
                                          link.href.substring(1),
                                          setActiveSection,
                                        );
                                        setMobileMenuOpen(false);
                                      }}
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
                  href="#review-card"
                  onClick={(e) => {
                    scrollTo(e, "review-card", setActiveSection);
                    setMobileMenuOpen(false);
                  }}
                  className={`transition-colors ${
                    activeSection === "review-card"
                      ? `${activeNavColor} font-semibold`
                      : `${textColorMuted} ${textColorMutedHover}`
                  }`}
                >
                  Reviews
                </motion.a>

                <motion.a
                  href="#benefits"
                  onClick={(e) => {
                    scrollTo(e, "benefits", setActiveSection);
                    setMobileMenuOpen(false);
                  }}
                  className={`transition-colors ${
                    activeSection === "benefits"
                      ? `${activeNavColor} font-semibold`
                      : `${textColorMuted} ${textColorMutedHover}`
                  }`}
                >
                  About
                </motion.a>

                <motion.a
                  href="#areaWeCover"
                  onClick={(e) => {
                    scrollTo(e, "areaWeCover", setActiveSection);
                    setMobileMenuOpen(false);
                  }}
                  className={`transition-colors ${
                    activeSection === "areaWeCover"
                      ? `${activeNavColor} font-semibold`
                      : `${textColorMuted} ${textColorMutedHover}`
                  }`}
                >
                  Coverage
                </motion.a>

                <motion.a
                  href="#faq"
                  onClick={(e) => {
                    scrollTo(e, "faq", setActiveSection);
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
