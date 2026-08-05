"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import {
  Plane,
  Building2,
  School,
  CalendarHeart,
  Stethoscope,
  Train,
  Ship,
  Headphones,
  ArrowRight,
  CheckCircle2,
  Phone,
} from "lucide-react";

interface Service {
  icon: any;
  title: string;
  description: string;
  action: string;
  actionIcon?: any;
  link: string;
  highlight?: boolean;
}

const services: Service[] = [
  {
    icon: Plane,
    title: "Airport Transfers",
    description:
      "Fixed-price rides to all major London and regional airports. No surprises.",
    action: "Fixed Price",
    actionIcon: CheckCircle2,
    link: "#",
    highlight: true,
  },
  {
    icon: Building2,
    title: "Corporate Travel",
    description:
      "Monthly accounts, invoice billing, and dedicated account management.",
    action: "Account Setup",
    link: "#",
  },
  {
    icon: School,
    title: "School Runs",
    description:
      "Reliable, safe, and punctual. CRB-checked drivers you can trust with your family.",
    action: "Learn More",
    link: "#",
  },
  {
    icon: CalendarHeart,
    title: "Events & Occasions",
    description:
      "Weddings, proms, and special events in executive comfort and style.",
    action: "Enquire",
    link: "#",
  },
  {
    icon: Stethoscope,
    title: "Medical Transport",
    description:
      "Comfortable, assisted transport to hospitals and medical appointments.",
    action: "Book Now",
    link: "#",
  },
  {
    icon: Train,
    title: "Station Transfers",
    description:
      "East Grinstead, Gatwick, Three Bridges & all major rail connections.",
    action: "Check Routes",
    link: "#",
  },
  {
    icon: Ship,
    title: "Cruise Port Transfers",
    description:
      "Southampton, Dover & Tilbury cruise terminals, door to gangway.",
    action: "Get Quote",
    link: "#",
  },
  {
    icon: Headphones,
    title: "24/7 Dispatch",
    description:
      "Speak to a real person any time. Our team is always ready to assist with any journey.",
    action: "Call Now",
    actionIcon: Phone,
    link: "#",
  },
];

// Container variants for stagger animation
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
      duration: 0.5,
    },
  },
};

const ServiceCard = ({
  service,
  index,
  isDarkMode,
}: {
  service: Service;
  index: number;
  isDarkMode: boolean;
}) => {
  const Icon = service.icon;
  const ActionIcon = service.actionIcon || ArrowRight;

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{
        y: -8,
        transition: { type: "spring", stiffness: 300, damping: 25 },
      }}
      className={`group relative rounded-2xl p-6 md:p-8 transition-all duration-300 ${
        service.highlight
          ? isDarkMode
            ? "bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border border-blue-500/30 hover:border-blue-400/50"
            : "bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/50 hover:border-blue-300"
          : isDarkMode
            ? "bg-[#1a1f2f]/80 border border-white/5 hover:border-white/10"
            : "bg-white border border-gray-100 hover:border-gray-200"
      } ${isDarkMode ? "shadow-lg shadow-black/20" : "shadow-lg shadow-gray-100"} hover:shadow-xl transition-all duration-300`}
    >
      {/* Glow effect on hover */}
      <div
        className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
          isDarkMode
            ? "bg-gradient-to-br from-blue-600/5 to-indigo-600/5"
            : "bg-gradient-to-br from-blue-100/30 to-indigo-100/30"
        }`}
      />

      <div className="relative z-10">
        {/* Icon */}
        <div
          className={`mb-4 inline-flex rounded-2xl p-3 ${
            service.highlight
              ? isDarkMode
                ? "bg-blue-500/20 text-blue-400"
                : "bg-blue-100 text-blue-600"
              : isDarkMode
                ? "bg-white/5 text-white/70 group-hover:bg-white/10"
                : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"
          } transition-all duration-300`}
        >
          <Icon className="h-6 w-6" />
        </div>

        {/* Title */}
        <h3
          className={`text-lg md:text-xl font-bold mb-2 ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          {service.title}
        </h3>

        {/* Description */}
        <p
          className={`text-sm leading-relaxed mb-4 ${
            isDarkMode ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {service.description}
        </p>

        {/* Action Link */}
        <motion.a
          href={service.link}
          className={`inline-flex items-center gap-2 text-sm font-semibold transition-all duration-300 ${
            service.highlight
              ? isDarkMode
                ? "text-blue-400 hover:text-blue-300"
                : "text-blue-600 hover:text-blue-700"
              : isDarkMode
                ? "text-gray-300 hover:text-white"
                : "text-gray-700 hover:text-gray-900"
          }`}
          whileHover={{ x: 5 }}
        >
          <span>{service.action}</span>
          <ActionIcon
            className={`h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 ${
              service.actionIcon === Phone ? "h-4 w-4" : ""
            }`}
          />
        </motion.a>
      </div>
    </motion.div>
  );
};

export default function OurServices() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDarkMode = mounted && resolvedTheme === "dark";

  useEffect(() => {
    setMounted(true);
  }, []);

  // Theme-based styles
  const sectionBg = isDarkMode
    ? "bg-gradient-to-b from-[#0a0e1a] via-[#0f1424] to-[#0a0e1a]"
    : "bg-gradient-to-b from-[#f6f8fc] via-white to-[#f6f8fc]";
  const textColor = isDarkMode ? "text-white" : "text-gray-900";
  const textSecondary = isDarkMode ? "text-gray-400" : "text-gray-600";
  const badgeBg = isDarkMode
    ? "bg-blue-900/30 border-blue-800/50"
    : "bg-blue-50 border-blue-200";
  const badgeText = isDarkMode ? "text-blue-300" : "text-blue-700";
  const dividerColor = isDarkMode
    ? "from-transparent via-slate-700 to-transparent"
    : "from-transparent via-slate-300 to-transparent";
  const glowColor = isDarkMode
    ? "bg-blue-900/20 blur-[200px]"
    : "bg-blue-100/30 blur-[200px]";

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <section className={`relative overflow-hidden ${sectionBg} py-24`}>
        <div className="min-h-200" />
      </section>
    );
  }

  return (
    <section
      className={`relative overflow-hidden ${sectionBg} py-20 md:py-32`}
      id="services"
    >
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute -left-40 top-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full ${glowColor}`}
        />
        {isDarkMode && (
          <>
            <div className="absolute right-0 top-0 h-125 w-[500px] rounded-full bg-indigo-950/20 blur-[150px]" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[300px] w-[800px] rounded-full bg-blue-950/10 blur-[150px]" />
          </>
        )}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span
            className={`inline-flex items-center rounded-full border px-5 py-2 text-sm font-semibold tracking-wider ${badgeBg} ${badgeText}`}
          >
            OUR SERVICES
          </span>

          <h2
            className={`mt-6 text-4xl md:text-5xl lg:text-6xl font-bold leading-tight ${textColor}`}
          >
            Every Journey, <br className="sm:hidden" />
            <span className="bg-linear-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
              Perfectly Served
            </span>
          </h2>

          <p className={`mt-4 max-w-2xl mx-auto text-lg ${textSecondary}`}>
            From school runs to corporate accounts — a service tailored to your
            exact need.
          </p>

          {/* Divider */}
          <div
            className={`mx-auto mt-8 h-px max-w-xs bg-linear-to-r ${dividerColor}`}
          />
        </motion.div>

        {/* Services Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
        >
          {services.map((service, index) => (
            <ServiceCard
              key={index}
              service={service}
              index={index}
              isDarkMode={isDarkMode}
            />
          ))}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className={`mt-16 rounded-3xl p-8 md:p-12 text-center ${
            isDarkMode
              ? "bg-linear-to-br from-blue-900/20 to-indigo-900/20 border border-blue-500/20"
              : "bg-linear-to-br from-blue-50 to-indigo-50 border border-blue-100"
          }`}
        >
          <h3 className={`text-2xl md:text-3xl font-bold mb-3 ${textColor}`}>
            Need a custom solution?
          </h3>
          <p
            className={`text-base md:text-lg max-w-2xl mx-auto mb-6 ${textSecondary}`}
          >
            We're here to help with any special requirements or bespoke travel
            needs.
          </p>
          <motion.a
            href="#"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold transition-all duration-300 ${
              isDarkMode
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30"
            }`}
          >
            Contact Our Team
            <ArrowRight className="h-5 w-5" />
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
