"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTheme } from "next-themes";

import {
  Star,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Clock3,
  Car,
  Headphones,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

interface Review {
  name: string;
  location: string;
  review: string;
  image: string;
  rating: number;
  date?: string;
}

const reviews: Review[] = [
  {
    name: "Andrea Frontelo",
    location: "East Grinstead • Heathrow Transfer",
    review:
      "Used Western Cars for our Heathrow transfer. The driver was early, the Mercedes immaculate, and the ride stress-free. Wouldn't use anyone else.",
    image:
      "https://user-images.trustpilot.com/64dcc4043610b700117c3a85/73x73.png",
    rating: 5,
    date: "2 days ago",
  },
  {
    name: "James T.",
    location: "Corporate Account",
    review:
      "Flight delayed by two hours and they waited without charging extra. Brilliant service.",
    image:
      "https://user-images.trustpilot.com/5226144000006400014aa3bf/73x73.png",
    rating: 5,
    date: "1 week ago",
  },
  {
    name: "Claire W.",
    location: "Lingfield • Gatwick Return",
    review:
      "Booking was effortless and the chauffeur was fantastic. Will definitely use again.",
    image:
      "https://user-images.trustpilot.com/5ccae1c84e08cbdd84935edf/73x73.png",
    rating: 5,
    date: "3 days ago",
  },
  {
    name: "Oliver H.",
    location: "East Grinstead",
    review:
      "Our driver drove us home safely and efficiently. Friendly, professional and good value for money.",
    image:
      "https://user-images.trustpilot.com/657e03462a9e12001141a5df/73x73.png",
    rating: 4,
    date: "5 days ago",
  },
  {
    name: "Mrs STACEY",
    location: "Crawley",
    review:
      "Super lady driver. Clean vehicle, very comfortable journey and excellent customer service. Highly recommended.",
    image:
      "https://user-images.trustpilot.com/4f323cde0000640001139a87/73x73.png",
    rating: 5,
    date: "1 day ago",
  },
  {
    name: "Megan Watkinson",
    location: "London • Heathrow",
    review:
      "Amazing communication and a fantastic driver. Booking was effortless and the fixed price was exactly as quoted.",
    image:
      "https://user-images.trustpilot.com/6a6036d37b418cfba6878678/73x73.png",
    rating: 5,
    date: "4 days ago",
  },
  {
    name: "Tish Hands",
    location: "Lingfield",
    review:
      "Amazing communication and a fantastic driver. Booking was effortless and the fixed price was exactly as quoted.",
    image:
      "https://user-images.trustpilot.com/657e03462a9e12001141a5df/73x73.png",
    rating: 5,
    date: "3 days ago",
  },
  {
    name: "Mr Treharne",
    location: "Brighton",
    review:
      "Excellent BMW 5 Series. Very clean, punctual and extremely professional chauffeur.",
    image:
      "https://user-images.trustpilot.com/4f323cde0000640001139a87/73x73.png",
    rating: 5,
    date: "1 week ago",
  },
];

const bottomFeatures = [
  {
    title: "Professional Drivers",
    subtitle: "Licensed & Experienced",
    icon: ShieldCheck,
  },
  {
    title: "Always On Time",
    subtitle: "Punctual, Every Time",
    icon: Clock3,
  },
  {
    title: "Premium Fleet",
    subtitle: "Comfort & Style",
    icon: Car,
  },
  {
    title: "24/7 Support",
    subtitle: "We're Here to Help",
    icon: Headphones,
  },
];

export default function ClientReviews() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [visibleCount, setVisibleCount] = useState(4);
  const [isScrolling, setIsScrolling] = useState(false);
  const [totalSlides, setTotalSlides] = useState(1);
  const [mounted, setMounted] = useState(false);

  // Use next-themes for dark mode
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);

      let count = 4;
      if (width >= 1280) count = 4;
      else if (width >= 1024) count = 3;
      else if (width >= 768) count = 2;
      else count = 1;
      setVisibleCount(count);
      setTotalSlides(Math.ceil(reviews.length / count));
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // GSAP ScrollTrigger for horizontal scrolling
  useEffect(() => {
    if (isMobile || isTablet) return;

    if (!sectionRef.current || !cardsContainerRef.current) return;

    const ctx = gsap.context(() => {
      const container = cardsContainerRef.current;
      const section = sectionRef.current;
      if (!container || !section) return;

      // Calculate the total width of all cards
      const cards = container.querySelectorAll(".review-card-wrapper");
      if (cards.length === 0) return;

      let totalWidth = 0;
      cards.forEach((card) => {
        totalWidth += (card as HTMLElement).offsetWidth + 24;
      });
      totalWidth -= 24;

      const viewportWidth = window.innerWidth;
      const maxScroll = Math.max(0, totalWidth - viewportWidth + 80);

      if (maxScroll <= 0) return;

      // Kill any existing ScrollTriggers
      ScrollTrigger.getAll().forEach((st) => st.kill());

      // Create the horizontal scroll animation
      const tl = gsap.to(container, {
        x: -maxScroll,
        ease: "none",
        scrollTrigger: {
          trigger: container,
          start: "top 30%",
          end: `+=${maxScroll + window.innerHeight * 0.5}`,
          pin: true,
          scrub: 1.5,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const progress = self.progress;
            const slideIndex = Math.floor(progress * totalSlides);
            const newIndex = Math.min(slideIndex, totalSlides - 1);
            if (newIndex !== currentIndex && !isScrolling) {
              setIsScrolling(true);
              setCurrentIndex(newIndex);
              setTimeout(() => setIsScrolling(false), 300);
            }
          },
        },
      });

      return () => {
        tl.kill();
        ScrollTrigger.getAll().forEach((st) => st.kill());
      };
    }, sectionRef);

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, [isMobile, isTablet, visibleCount, totalSlides]);

  const currentSlideIndex = Math.min(currentIndex, totalSlides - 1);

  const nextSlide = () => {
    if (isScrolling || totalSlides <= 1) return;
    const newIndex = (currentIndex + 1) % totalSlides;
    setCurrentIndex(newIndex);

    if (!isMobile && !isTablet && cardsContainerRef.current) {
      const container = cardsContainerRef.current;
      const cards = container.querySelectorAll(".review-card-wrapper");
      let totalWidth = 0;
      cards.forEach((card) => {
        totalWidth += (card as HTMLElement).offsetWidth + 24;
      });
      totalWidth -= 24;
      const viewportWidth = window.innerWidth;
      const maxScroll = Math.max(0, totalWidth - viewportWidth + 80);
      const progress = newIndex / (totalSlides - 1);
      const targetX = -maxScroll * progress;

      gsap.to(container, {
        x: targetX,
        duration: 0.8,
        ease: "power2.inOut",
        overwrite: "auto",
      });
    }
  };

  const prevSlide = () => {
    if (isScrolling || totalSlides <= 1) return;
    const newIndex = (currentIndex - 1 + totalSlides) % totalSlides;
    setCurrentIndex(newIndex);

    if (!isMobile && !isTablet && cardsContainerRef.current) {
      const container = cardsContainerRef.current;
      const cards = container.querySelectorAll(".review-card-wrapper");
      let totalWidth = 0;
      cards.forEach((card) => {
        totalWidth += (card as HTMLElement).offsetWidth + 24;
      });
      totalWidth -= 24;
      const viewportWidth = window.innerWidth;
      const maxScroll = Math.max(0, totalWidth - viewportWidth + 80);
      const progress = newIndex / (totalSlides - 1);
      const targetX = -maxScroll * progress;

      gsap.to(container, {
        x: targetX,
        duration: 0.8,
        ease: "power2.inOut",
        overwrite: "auto",
      });
    }
  };

  const getVisibleReviews = () => {
    const start = currentSlideIndex * visibleCount;
    const end = Math.min(start + visibleCount, reviews.length);
    return reviews.slice(start, end);
  };

  const visibleReviews = getVisibleReviews();

  // Theme-based styles
  const textColor = isDarkMode ? "text-white" : "text-slate-900";
  const textSecondary = isDarkMode ? "text-slate-300" : "text-slate-500";
  const cardBg = isDarkMode ? "bg-[#1a1f2f]" : "bg-white";
  const sectionBg = isDarkMode
    ? "bg-gradient-to-b from-[#0a0e1a] via-[#0f1424] to-[#0a0e1a]"
    : "bg-gradient-to-b from-[#f6f8fc] via-white to-[#f6f8fc]";
  const dividerColor = isDarkMode
    ? "from-transparent via-slate-700 to-transparent"
    : "from-transparent via-slate-300 to-transparent";
  const glowColor = isDarkMode
    ? "bg-blue-900/30 blur-[170px]"
    : "bg-blue-100 blur-[170px]";
  const glowColor2 = isDarkMode
    ? "bg-slate-800/30 blur-[150px]"
    : "bg-slate-200 blur-[150px]";
  const badgeBg = isDarkMode
    ? "bg-blue-900/30 border-blue-800/50"
    : "bg-blue-50 border-blue-200";
  const badgeText = isDarkMode ? "text-blue-300" : "text-blue-700";
  const navButtonBg = isDarkMode
    ? "bg-[#1a1f2f] border-[#2a2f3f] hover:bg-[#2a2f3f]"
    : "bg-white border-slate-200 hover:bg-slate-50";
  const navButtonPrimary = isDarkMode
    ? "bg-blue-600 hover:bg-blue-700"
    : "bg-[#0d2348] hover:bg-[#1a3a6a]";
  const featureCardBg = isDarkMode ? "bg-[#1a1f2f]/80" : "bg-white";
  const featureCardHover = isDarkMode
    ? "hover:bg-[#2a2f3f]"
    : "hover:bg-slate-50";
  const shadowColor = isDarkMode
    ? "shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
    : "shadow-[0_25px_70px_rgba(0,0,0,0.12)]";

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <section className={`relative overflow-hidden ${sectionBg}`}>
        <div className="min-h-[600px]" />
      </section>
    );
  }

  return (
    <motion.section
      ref={sectionRef}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 1 }}
      viewport={{ once: true }}
      className={`relative overflow-hidden ${sectionBg}`}
    >
      {/* Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute right-0 top-0 h-[700px] w-[700px] rounded-full ${glowColor}`}
        />
        <div
          className={`absolute -left-40 bottom-0 h-[500px] w-[500px] rounded-full ${glowColor2}`}
        />
        {isDarkMode && (
          <>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-blue-950/20 blur-[200px]" />
            <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-indigo-950/20 blur-[150px]" />
          </>
        )}
      </div>

      <div className="relative z-10">
        {/* ================= HERO ================= */}
        <div className="mx-auto max-w-7xl px-6 lg:px-10 pt-24">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            {/* LEFT */}
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <span
                className={`inline-flex items-center rounded-full border px-5 py-2 text-sm font-semibold tracking-wider ${badgeBg} ${badgeText}`}
              >
                CLIENT REVIEWS
              </span>

              <h2
                className={`mt-8 text-5xl font-bold leading-tight lg:text-7xl ${textColor}`}
              >
                Trusted by
                <br />
                Thousands
              </h2>

              <p className={`mt-8 max-w-xl text-lg leading-9 ${textSecondary}`}>
                Thousands of customers across Crawley, Gatwick, Horsham, Lewes,
                East Grinstead, Horley, Haywards Heath and the surrounding areas
                trust Western Cars for airport transfers, executive travel and
                everyday journeys.
              </p>

              {/* Rating */}
              <div className="mt-10 flex flex-wrap items-center gap-6">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-7 w-7 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <div>
                  <h3 className={`text-5xl font-bold ${textColor}`}>4.2</h3>
                  <p className={`mt-1 ${textSecondary}`}>
                    Based on 847+ verified reviews
                  </p>
                </div>
              </div>

              {/* Navigation */}
              <div className="mt-14 flex gap-5">
                <button
                  onClick={prevSlide}
                  className={`flex h-14 w-14 items-center justify-center rounded-full border transition-all duration-300 hover:-translate-y-1 ${navButtonBg} ${shadowColor}`}
                >
                  <ArrowLeft
                    className={`h-5 w-5 ${isDarkMode ? "text-white" : "text-slate-700"}`}
                  />
                </button>
                <button
                  onClick={nextSlide}
                  className={`flex h-14 w-14 items-center justify-center rounded-full transition-all duration-300 hover:-translate-y-1 ${navButtonPrimary} ${shadowColor}`}
                >
                  <ArrowRight className="h-5 w-5 text-white" />
                </button>
              </div>
            </motion.div>

            {/* RIGHT */}
            <motion.div
              initial={{ opacity: 0, x: 80 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9 }}
              className="relative"
            >
              {/* Blue Glow behind car */}
              <div
                className={`absolute right-10 top-6 h-[420px] w-[420px] rounded-full ${isDarkMode ? "bg-blue-900/40 blur-[130px]" : "bg-blue-200 blur-[130px]"}`}
              />

              {/* White Card - Top Left */}
              <div
                className={`absolute left-0 top-12 z-20 hidden rounded-3xl p-5 ${shadowColor} ${cardBg} lg:block`}
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-blue-600 p-3">
                    <ShieldCheck className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p
                      className={`text-xs uppercase tracking-wider ${textSecondary}`}
                    >
                      Trusted Service
                    </p>
                    <h4 className={`mt-1 text-lg font-bold ${textColor}`}>
                      20+ Years Experience
                    </h4>
                  </div>
                </div>
              </div>

              {/* Mercedes */}
              <Image
                src={
                  isDarkMode
                    ? "/assets/ReviewImage-dark.png"
                    : "/assets/ReviewImage-whitebg.png"
                }
                alt="Western Cars Mercedes"
                width={900}
                height={700}
                priority
                className="relative z-10 w-full object-contain drop-shadow-[0_45px_90px_rgba(0,0,0,0.25)]"
              />

              {/* Bottom Floating Card */}
              <div
                className={`absolute bottom-8 right-10 hidden rounded-3xl px-8 py-5 ${shadowColor} ${cardBg} lg:block`}
              >
                <div className="flex items-center gap-5">
                  <div
                    className={`rounded-full p-3 ${isDarkMode ? "bg-green-900/30" : "bg-green-100"}`}
                  >
                    <Car
                      className={`h-6 w-6 ${isDarkMode ? "text-green-400" : "text-green-600"}`}
                    />
                  </div>
                  <div>
                    <h5 className={`text-lg font-bold ${textColor}`}>
                      Premium Fleet
                    </h5>
                    <p className={`text-sm ${textSecondary}`}>
                      Mercedes • Executive • MPV
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Divider */}
        <div
          className={`mx-auto mt-24 mb-20 h-px max-w-7xl bg-gradient-to-r ${dividerColor}`}
        />

        {/* ================= REVIEW CARDS ================= */}
        <div className="relative mx-auto max-w-7xl overflow-hidden px-6 lg:px-10">
          {/* Trustpilot Style Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 fill-green-600 text-green-600" />
                <span className={`text-sm font-semibold ${textColor}`}>
                  Trustpilot
                </span>
              </div>
              <span className={`text-sm ${textSecondary}`}>•</span>
              <span className={`text-sm ${textSecondary}`}>
                {reviews.length} reviews
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={prevSlide}
                className={`p-2 rounded-full border transition-all ${navButtonBg}`}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={nextSlide}
                className={`p-2 rounded-full border transition-all ${navButtonBg}`}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Review Cards - Horizontal Scroll Container */}
          <div
            ref={cardsContainerRef}
            className="flex gap-6 transition-none will-change-transform"
            style={{
              width: isMobile || isTablet ? "100%" : "max-content",
              flexWrap: isMobile || isTablet ? "wrap" : "nowrap",
            }}
          >
            <AnimatePresence mode="sync">
              {(isMobile || isTablet ? visibleReviews : reviews).map(
                (review, index) => (
                  <motion.div
                    key={`${isMobile || isTablet ? currentSlideIndex : "desktop"}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="review-card-wrapper shrink-0"
                    style={{
                      width: isMobile
                        ? "100%"
                        : isTablet
                          ? "calc(50% - 12px)"
                          : "300px",
                    }}
                  >
                    <ReviewCard review={review} isDarkMode={isDarkMode} />
                  </motion.div>
                ),
              )}
            </AnimatePresence>
          </div>

          {/* Scroll Progress Indicator */}
          {!isMobile && !isTablet && totalSlides > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentIndex(index);
                    if (cardsContainerRef.current) {
                      const container = cardsContainerRef.current;
                      const cards = container.querySelectorAll(
                        ".review-card-wrapper",
                      );
                      let totalWidth = 0;
                      cards.forEach((card) => {
                        totalWidth += (card as HTMLElement).offsetWidth + 24;
                      });
                      totalWidth -= 24;
                      const viewportWidth = window.innerWidth;
                      const maxScroll = Math.max(
                        0,
                        totalWidth - viewportWidth + 80,
                      );
                      const progress = index / (totalSlides - 1);
                      const targetX = -maxScroll * progress;
                      gsap.to(container, {
                        x: targetX,
                        duration: 0.6,
                        ease: "power2.out",
                        overwrite: "auto",
                      });
                    }
                  }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentSlideIndex
                      ? `w-8 ${isDarkMode ? "bg-blue-500" : "bg-blue-600"}`
                      : `w-2 ${isDarkMode ? "bg-slate-600" : "bg-slate-300"}`
                  }`}
                />
              ))}
            </div>
          )}

          {/* Mobile/Tablet Pagination Dots */}
          {(isMobile || isTablet) && totalSlides > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentSlideIndex
                      ? `w-8 ${isDarkMode ? "bg-blue-500" : "bg-blue-600"}`
                      : `w-2 ${isDarkMode ? "bg-slate-600" : "bg-slate-300"}`
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* ================= BOTTOM FEATURES ================= */}
        <div className="mx-auto mt-24 max-w-7xl px-6 pb-24 lg:px-10">
          <div className={`rounded-4xl p-10 lg:p-14 ${shadowColor} ${cardBg}`}>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              {bottomFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className={`group flex flex-col items-center rounded-3xl p-6 text-center transition-all duration-300 hover:-translate-y-2 ${featureCardBg} ${featureCardHover}`}
                  >
                    <div
                      className={`rounded-2xl p-3 transition-colors duration-300 ${
                        isDarkMode
                          ? "bg-blue-900/20 text-blue-400 group-hover:bg-blue-800/30"
                          : "bg-blue-50 text-blue-600 group-hover:bg-blue-100"
                      }`}
                    >
                      <Icon className="h-8 w-8" />
                    </div>
                    <h3 className={`mt-4 text-lg font-semibold ${textColor}`}>
                      {feature.title}
                    </h3>
                    <p className={`mt-1 text-sm ${textSecondary}`}>
                      {feature.subtitle}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

// ================= REVIEW CARD COMPONENT =================
function ReviewCard({
  review,
  isDarkMode,
}: {
  review: Review;
  isDarkMode: boolean;
}) {
  const cardBg = isDarkMode ? "bg-[#1a1f2f]" : "bg-white";
  const textColor = isDarkMode ? "text-white" : "text-slate-900";
  const textSecondary = isDarkMode ? "text-slate-300" : "text-slate-500";
  const textMuted = isDarkMode ? "text-slate-400" : "text-slate-400";
  const dividerColor = isDarkMode ? "bg-slate-700" : "bg-slate-100";
  const shadow = isDarkMode
    ? "shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
    : "shadow-[0_20px_50px_rgba(0,0,0,0.08)]";

  return (
    <div
      className={`flex h-[280px] w-full flex-col justify-between rounded-2xl p-6 ${shadow} ${cardBg} transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_70px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_30px_70px_rgba(0,0,0,0.6)]`}
    >
      {/* Top: Stars + Date */}
      <div className="flex items-center justify-between">
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < review.rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-gray-300 text-gray-300 dark:fill-gray-600 dark:text-gray-600"
              }`}
            />
          ))}
        </div>
        {review.date && (
          <span className={`text-xs ${textMuted}`}>{review.date}</span>
        )}
      </div>

      {/* Review Text */}
      <p className={`flex-1 text-sm leading-relaxed ${textColor} line-clamp-3`}>
        "{review.review}"
      </p>

      {/* Divider */}
      <div className={`h-px w-full ${dividerColor}`} />

      {/* Avatar & Name */}
      <div className="flex items-center gap-3">
        <div className="relative h-8 w-8 overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex-shrink-0">
          <Image
            src={review.image}
            alt={review.name}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className={`text-sm font-semibold truncate ${textColor}`}>
            {review.name}
          </h4>
          <p className={`text-xs truncate ${textSecondary}`}>
            {review.location}
          </p>
        </div>
        <div className="flex-shrink-0">
          <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <svg
              className="w-3 h-3 text-green-600 dark:text-green-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 15l-5.5 3.5 1.5-6.5L1 7l6.5-1L10 0l2.5 6L19 7l-5 5 1.5 6.5z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
