"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";
import Image from "next/image";
import { getLenis } from "@/lib/lenis";

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
      className="fixed top-0 inset-x-0 z-50 w-full"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-12 h-5">
        {/* Logo */}
        <motion.a
          href="#home"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="h-18 w-48 relative cursor-pointer"
          onClick={(e) => scrollTo(e, "home")}
        >
          <Image
            src="/assets/logo.png"
            alt="Western Cars Logo"
            width={200}
            height={50}
            priority
          />
        </motion.a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-10">
          <motion.a
            href="#home"
            onClick={(e) => scrollTo(e, "home")}
            className={`relative text-sm tracking-wide font-medium transition-colors ${
              activeSection === "home"
                ? "text-white"
                : "text-white/90 hover:text-white"
            }`}
          >
            Home
            {activeSection === "home" && (
              <motion.span
                layoutId="desktop-active-nav"
                className="absolute left-0 -bottom-2 h-0.5 w-full bg-orange-400 rounded-full hidden md:block"
              />
            )}
          </motion.a>
          <motion.a
            href="#corporate-account"
            onClick={(e) => scrollTo(e, "corporate-account")}
            className={`relative text-sm tracking-wide font-medium transition-colors ${
              activeSection === "corporate-account"
                ? "text-white"
                : "text-white/90 hover:text-white"
            }`}
          >
            Corporate Account
            {activeSection === "corporate-account" && (
              <motion.span
                layoutId="desktop-active-nav"
                className="absolute left-0 -bottom-2 h-0.5 w-full bg-orange-400 rounded-full hidden md:block"
              />
            )}
          </motion.a>
          <motion.a
            href="#fleet"
            onClick={(e) => scrollTo(e, "fleet")}
            className={`relative text-sm tracking-wide font-medium transition-colors ${
              activeSection === "fleet"
                ? "text-white"
                : "text-white/90 hover:text-white"
            }`}
          >
            Fleet
            {activeSection === "fleet" && (
              <motion.span
                layoutId="desktop-active-nav"
                className="absolute left-0 -bottom-2 h-0.5 w-full bg-orange-400 rounded-full hidden md:block"
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
              className="flex items-center gap-1 text-white"
            >
              Services <ChevronDown size={16} />
            </button>
            <AnimatePresence>
              {servicesOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-10 left-1/2 -translate-x-1/2 w-155 h-auto rounded-2xl bg-white/10 backdrop-blur-xl shadow-2xl p-8"
                >
                  <div className="grid grid-cols-2 gap-10">
                    {servicesMenu.map((section) => (
                      <div key={section.title}>
                        <h3 className="font-semibold mb-4">{section.title}</h3>
                        <div className="space-y-3">
                          {section.items.map((link) => (
                            <motion.a
                              key={link.label}
                              href={link.href}
                              className="block text-white/90 hover:text-orange-500"
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
                ? "text-white"
                : "text-white/90 hover:text-white"
            }`}
            onClick={(e) => scrollTo(e, "contact")}
          >
            Contact
            {activeSection === "contact" && (
              <motion.span
                layoutId="desktop-active-nav"
                className="absolute left-0 -bottom-2 h-0.5 w-full bg-orange-400 rounded-full hidden md:block"
              />
            )}
          </motion.a>
          <motion.a
            href="#faq"
            onClick={(e) => scrollTo(e, "faq")}
            className={`relative text-sm tracking-wide font-medium transition-colors ${
              activeSection === "faq"
                ? "text-white"
                : "text-white/90 hover:text-white"
            }`}
          >
            FAQ
            {activeSection === "faq" && (
              <motion.span
                layoutId="desktop-active-nav"
                className="absolute left-0 -bottom-2 h-0.5 w-full bg-orange-400 rounded-full hidden md:block"
              />
            )}
          </motion.a>
        </nav>

        {/* Sign in button */}

        {/* Desktop Button */}
        <div className="hidden md:block">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setBookingOpen(true)}
            className="px-5 py-2.5 rounded-full border border-white/20 bg-orange-500 backdrop-blur-md text-white hover:bg-orange-600 transition"
          >
            Sign In
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
                {/* {navItems.map((item) => {
                  const id = item.toLowerCase().replace(/\s+/g, "-");

                  return (
                    <motion.a
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
                    </motion.a>
                  );
                })} */}

                <motion.a
                  href="#home"
                  onClick={(e) => {
                    scrollTo(e, "home");
                    setMobileMenuOpen(false);
                  }}
                  className={`relative text-sm tracking-wide font-medium transition-colors ${
                    activeSection === "home"
                      ? "text-white"
                      : "text-white/90 hover:text-white"
                  }`}
                >
                  Home
                  {activeSection === "home" && (
                    <motion.span
                      layoutId="mobile-active-nav"
                      className="absolute left-0 -bottom-2 h-0.5 w-full bg-orange-400 rounded-full hidden md:block"
                    />
                  )}
                </motion.a>
                <motion.a
                  href="#corporate-account"
                  onClick={(e) => {
                    scrollTo(e, "corporate-account");
                    setMobileMenuOpen(false);
                  }}
                  className={`relative text-sm tracking-wide font-medium transition-colors ${
                    activeSection === "corporate-account"
                      ? "text-white"
                      : "text-white/90 hover:text-white"
                  }`}
                >
                  Corporate Account
                  {activeSection === "corporate-account" && (
                    <motion.span
                      layoutId="mobile-active-nav"
                      className="absolute left-0 -bottom-2 h-0.5 w-full bg-orange-400 rounded-full hidden md:block"
                    />
                  )}
                </motion.a>
                <motion.a
                  href="#fleet"
                  onClick={(e) => {
                    scrollTo(e, "fleet");
                    setMobileMenuOpen(false);
                  }}
                  className={`relative text-sm tracking-wide font-medium transition-colors ${
                    activeSection === "fleet"
                      ? "text-white"
                      : "text-white/90 hover:text-white"
                  }`}
                >
                  Fleet
                  {activeSection === "fleet" && (
                    <motion.span
                      layoutId="mobile-active-nav"
                      className="absolute left-0 -bottom-2 h-0.5 w-full bg-orange-400 rounded-full hidden md:block"
                    />
                  )}
                </motion.a>

                <motion.div className="relative">
                  <button
                    onClick={() => setServicesOpen((prev) => !prev)}
                    className="flex items-center justify-between w-full text-white"
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
                        initial={{ height: 0, opacity: 0, y: 10 }}
                        animate={{ height: "auto", opacity: 1, y: 0 }}
                        exit={{ height: 0, opacity: 0, y: 10 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden   h-auto rounded-2xl bg-white/10 backdrop-blur-xl shadow-2xl p-8 "
                      >
                        <div className="grid grid-cols-2 gap-10">
                          {servicesMenu.map((section) => (
                            <div key={section.title}>
                              <h3 className="font-semibold mb-4">
                                {section.title}
                              </h3>
                              <div className="space-y-3">
                                {section.items.map((link) => (
                                  <motion.a
                                    key={link.label}
                                    href={link.href}
                                    className="block text-gray-600 hover:text-orange-500"
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
                      ? "text-white"
                      : "text-white/90 hover:text-white"
                  }`}
                  onClick={(e) => {
                    scrollTo(e, "contact");
                    setMobileMenuOpen(false);
                  }}
                >
                  Contact
                  {activeSection === "contact" && (
                    <motion.span
                      layoutId="mobile-active-nav"
                      className="absolute left-0 -bottom-2 h-0.5 w-full bg-orange-400 rounded-full hidden md:block"
                    />
                  )}
                </motion.a>
                <motion.a
                  href="#faq"
                  onClick={(e) => {
                    scrollTo(e, "faq");
                    setMobileMenuOpen(false);
                  }}
                  className={`relative text-sm tracking-wide font-medium transition-colors ${
                    activeSection === "faq"
                      ? "text-white"
                      : "text-white/90 hover:text-white"
                  }`}
                >
                  FAQ
                  {activeSection === "faq" && (
                    <motion.span
                      layoutId="mobile-active-nav"
                      className="absolute left-0 -bottom-2 h-0.5 w-full bg-orange-400 rounded-full hidden md:block"
                    />
                  )}
                </motion.a>

                <button
                  onClick={() => {
                    setBookingOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="mt-2 px-5 py-3 rounded-full bg-white text-black font-medium hover:bg-gray-200 transition"
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
