import React, { useState, useEffect, useRef } from "react";
import {
  Menu,
  X,
  ArrowRight,
  Volume2,
  VolumeX,
  ChevronDown,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";

import heroVideo from "./assets/hero.mp4";


// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// ---------- 3D Car Component ----------
function CarModel() {
  const { scene } = useGLTF("/models/scene.gltf");
  return <primitive object={scene} scale={0.8} />;
}

function ThreeScene() {
  return (
    <div className="h-[400px] w-full md:h-[500px]">
      <Canvas camera={{ position: [0, 1, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <Environment preset="city" />
        <CarModel />
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={2} />
      </Canvas>
    </div>
  );
}

// ---------- FAQ Accordion Item ----------
function FAQItem({ question, answer, isOpen, toggle }) {
  return (
    <div className="border-b border-white/10">
      <button
        onClick={toggle}
        className="w-full py-6 flex items-center justify-between text-left text-white hover:text-white/80 transition-colors"
      >
        <span className="text-lg font-medium">{question}</span>
        <ChevronDown
          className={`w-5 h-5 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-40 pb-6" : "max-h-0"
        }`}
      >
        <p className="text-white/70 leading-relaxed">{answer}</p>
      </div>
    </div>
  );
}

// ---------- Main App ----------
export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [faqOpen, setFaqOpen] = useState(null); // index of open FAQ

  // Refs for sections (used in GSAP animations)
  const heroRef = useRef(null);
  const storyRef = useRef(null);
  const ratesRef = useRef(null);
  const benefitsRef = useRef(null);
  const faqRef = useRef(null);
  const footerRef = useRef(null);

  // Refs for hero elements (already in your code)
  const labelRef = useRef(null);
  const heading1Ref = useRef(null);
  const heading2Ref = useRef(null);
  const subtitleRef = useRef(null);
  const buttonsRef = useRef(null);
  const statsRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    // 1. Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // 2. Hero entrance animations (existing)
    const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
    heroTl
      .fromTo(
        labelRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8 },
      )
      .fromTo(
        heading1Ref.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.9 },
        "-=0.5",
      )
      .fromTo(
        heading2Ref.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.9 },
        "-=0.6",
      )
      .fromTo(
        subtitleRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8 },
        "-=0.4",
      )
      .fromTo(
        buttonsRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7 },
        "-=0.3",
      )
      .fromTo(
        statsRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7 },
        "-=0.2",
      );

    // 3. Video slow zoom
    gsap.to(videoRef.current, {
      scale: 1.1,
      duration: 20,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    // 4. Scroll‑triggered animations for other sections
    const sections = [
      { ref: storyRef, id: "story" },
      { ref: ratesRef, id: "rates" },
      { ref: benefitsRef, id: "benefits" },
      { ref: faqRef, id: "faq" },
      { ref: footerRef, id: "footer" },
    ];

    sections.forEach(({ ref }) => {
      if (ref.current) {
        gsap.fromTo(
          ref.current,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: ref.current,
              start: "top 80%",
              toggleActions: "play none none none",
            },
          },
        );
      }
    });

    // 5. Story section: 3D scene entrance (optional)
    if (storyRef.current) {
      gsap.fromTo(
        storyRef.current.querySelector(".story-3d"),
        { opacity: 0, scale: 0.9 },
        {
          opacity: 1,
          scale: 1,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: storyRef.current,
            start: "top 75%",
          },
        },
      );
    }

    // Cleanup
    return () => {
      lenis.destroy();
      heroTl.kill();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  // FAQ toggle handler
  const toggleFAQ = (index) => {
    setFaqOpen(faqOpen === index ? null : index);
  };

  // FAQ data
  const faqs = [
    {
      question: "How do I book a ride?",
      answer:
        "Simply click 'Book Now' and fill out the form with your details. Our team will confirm your booking within 30 minutes.",
    },
    {
      question: "What vehicles are available?",
      answer:
        "We offer a fleet of luxury sedans, SUVs, and limousines. All are meticulously maintained and driven by professional chauffeurs.",
    },
    {
      question: "Do you offer airport transfers?",
      answer:
        "Yes, we specialise in airport transfers. We track your flight and adjust for delays, so you're always met on time.",
    },
    {
      question: "Is there a cancellation policy?",
      answer:
        "You can cancel for free up to 2 hours before your scheduled pickup. Later cancellations may incur a small fee.",
    },
  ];

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          * { font-family: 'Inter', sans-serif; }
          html { scroll-behavior: smooth; }
          body { background: #000; color: #fff; }
        `}
      </style>

      {/* Global Floating Sound Toggle – bottom right */}
      <button
        onClick={() => setIsMuted(!isMuted)}
        className="fixed bottom-8 right-8 z-50 p-3 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all duration-300 shadow-lg hover:scale-110"
        aria-label="Toggle sound"
      >
        {isMuted ? (
          <VolumeX className="w-5 h-5" />
        ) : (
          <Volume2 className="w-5 h-5" />
        )}
      </button>

      {/* ========== HERO SECTION ========== */}
      <section ref={heroRef} className="relative h-screen overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          muted={isMuted}
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src={heroVideo} type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/60" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-white/10 blur-3xl rounded-full" />

        <div className="relative z-20 h-full flex flex-col">
          <header className="w-full">
            <div className="max-w-7xl mx-auto px-8 py-7 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center backdrop-blur-md bg-white/10">
                  <span className="text-white font-semibold text-sm">WC</span>
                </div>
                <h1 className="text-2xl font-semibold tracking-wide text-white">
                  Western Cars
                </h1>
              </div>

              <nav className="hidden md:flex items-center gap-10">
                {["Story", "Rates", "Benefits", "FAQ"].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className="text-white/90 hover:text-white transition-colors text-sm tracking-wide font-medium"
                  >
                    {item}
                  </a>
                ))}
              </nav>

              <div className="hidden md:flex items-center gap-4">
                <button className="px-5 py-2.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-colors text-sm font-medium">
                  Reserve Ride
                </button>
              </div>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-white"
              >
                {mobileMenuOpen ? (
                  <X className="w-7 h-7" />
                ) : (
                  <Menu className="w-7 h-7" />
                )}
              </button>
            </div>

            {mobileMenuOpen && (
              <div className="md:hidden px-6">
                <div className="bg-white/10 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl">
                  <nav className="flex flex-col gap-6">
                    {["Story", "Rates", "Benefits", "FAQ"].map((item) => (
                      <a
                        key={item}
                        href={`#${item.toLowerCase()}`}
                        className="text-white/90 hover:text-white transition-colors text-lg"
                      >
                        {item}
                      </a>
                    ))}
                    <button className="mt-2 px-5 py-3 rounded-full bg-white text-black font-medium hover:bg-gray-200 transition-colors">
                      Reserve Ride
                    </button>
                  </nav>
                </div>
              </div>
            )}
          </header>

          <main className="flex-1 flex items-center justify-center">
            <div className="max-w-6xl mx-auto px-6 text-center -mt-24">
              <div
                ref={labelRef}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 bg-white/10 backdrop-blur-md mb-8"
              >
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span className="text-xs tracking-[0.25em] uppercase text-white/80 font-semibold">
                  Private Taxi Hire
                </span>
              </div>

              <div className="space-y-0 leading-none tracking-[-0.06em]">
                <h1
                  ref={heading1Ref}
                  className="text-6xl sm:text-7xl md:text-8xl lg:text-[9rem] font-medium text-white/70"
                >
                  Premium.
                </h1>
                <h1
                  ref={heading2Ref}
                  className="text-6xl sm:text-7xl md:text-8xl lg:text-[9rem] font-medium text-white -mt-5 md:-mt-8"
                >
                  Accessible.
                </h1>
              </div>

              <p
                ref={subtitleRef}
                className="mt-8 text-lg md:text-xl text-white/75 max-w-2xl mx-auto leading-relaxed"
              >
                Luxury airport transfers and executive private travel designed
                for comfort, elegance, and seamless journeys.
              </p>

              <div
                ref={buttonsRef}
                className="mt-10 flex flex-wrap items-center justify-center gap-4"
              >
                <button className="group px-7 py-3.5 rounded-full bg-white text-black font-medium hover:bg-gray-200 transition-colors flex items-center gap-2 shadow-2xl hover:scale-105 transition-transform">
                  Discover
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
                <button className="px-7 py-3.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-colors font-medium hover:scale-105 transition-transform">
                  Book Now
                </button>
              </div>

              <div
                ref={statsRef}
                className="mt-20 flex flex-wrap items-center justify-center gap-10 text-white/70"
              >
                <div>
                  <h3 className="text-2xl font-semibold text-white">24/7</h3>
                  <p className="text-sm mt-1">Luxury Service</p>
                </div>
                <div className="w-px h-10 bg-white/20 hidden sm:block" />
                <div>
                  <h3 className="text-2xl font-semibold text-white">500+</h3>
                  <p className="text-sm mt-1">Premium Transfers</p>
                </div>
                <div className="w-px h-10 bg-white/20 hidden sm:block" />
                <div>
                  <h3 className="text-2xl font-semibold text-white">VIP</h3>
                  <p className="text-sm mt-1">Executive Experience</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </section>

      {/* ========== STORY SECTION ========== */}
      <section id="story" ref={storyRef} className="py-24 bg-black/95">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-sm tracking-[0.2em] uppercase text-white/50 mb-4 block">
                Our Story
              </span>
              <h2 className="text-4xl sm:text-5xl font-medium mb-6">
                More Than a Ride
              </h2>
              <p className="text-white/70 text-lg leading-relaxed mb-6">
                Western Cars was born from a simple idea: travel should be
                effortless, elegant, and personal. We combine premium vehicles
                with exceptional service to create journeys that are as
                memorable as the destinations.
              </p>
              <p className="text-white/70 text-lg leading-relaxed">
                Our fleet is meticulously maintained, our chauffeurs are
                professionally trained, and every ride is tailored to your
                needs. Whether it’s a quick airport transfer or a full day of
                executive travel, we deliver a seamless experience.
              </p>
            </div>
            <div className="story-3d">
              <ThreeScene />
            </div>
          </div>
        </div>
      </section>

      {/* ========== RATES SECTION ========== */}
      <section id="rates" ref={ratesRef} className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-sm tracking-[0.2em] uppercase text-white/50">
              Transparent Pricing
            </span>
            <h2 className="text-4xl sm:text-5xl font-medium mt-2">
              Choose Your Ride
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Business Sedan",
                price: "£45",
                features: [
                  "Up to 3 passengers",
                  "Professional chauffeur",
                  "Free WiFi",
                  "Bottled water",
                ],
              },
              {
                name: "Executive SUV",
                price: "£75",
                features: [
                  "Up to 6 passengers",
                  "Spacious interior",
                  "Leather seats",
                  "Refreshments",
                ],
              },
              {
                name: "Limousine",
                price: "£120",
                features: [
                  "Up to 8 passengers",
                  "VIP treatment",
                  "Champagne service",
                  "Entertainment system",
                ],
              },
            ].map((plan, idx) => (
              <div
                key={idx}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 hover:scale-105 transition-transform duration-300"
              >
                <h3 className="text-xl font-semibold text-white">
                  {plan.name}
                </h3>
                <p className="text-4xl font-light mt-4 text-white">
                  {plan.price}{" "}
                  <span className="text-sm text-white/50">/ ride</span>
                </p>
                <ul className="mt-6 space-y-3 text-white/70">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <button className="mt-8 w-full py-3 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-colors">
                  Select
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== BENEFITS SECTION ========== */}
      <section id="benefits" ref={benefitsRef} className="py-24 bg-black/95">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-sm tracking-[0.2em] uppercase text-white/50">
              Why Choose Us
            </span>
            <h2 className="text-4xl sm:text-5xl font-medium mt-2">
              Elevate Your Journey
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: "🚗",
                title: "Premium Fleet",
                desc: "Latest luxury models with advanced features.",
              },
              {
                icon: "👔",
                title: "Professional Chauffeurs",
                desc: "Trained, courteous, and discreet.",
              },
              {
                icon: "⏱️",
                title: "On-Time Guarantee",
                desc: "We track your schedule and adjust.",
              },
              {
                icon: "✨",
                title: "Personalized Service",
                desc: "Tailored to your preferences.",
              },
            ].map((benefit, idx) => (
              <div
                key={idx}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center hover:scale-105 transition-transform duration-300"
              >
                <div className="text-4xl mb-4">{benefit.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {benefit.title}
                </h3>
                <p className="text-white/70 text-sm">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FAQ SECTION ========== */}
      <section id="faq" ref={faqRef} className="py-24 bg-black">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-sm tracking-[0.2em] uppercase text-white/50">
              FAQ
            </span>
            <h2 className="text-4xl sm:text-5xl font-medium mt-2">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="space-y-2">
            {faqs.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={faqOpen === index}
                toggle={() => toggleFAQ(index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer
        ref={footerRef}
        className="py-16 bg-black/95 border-t border-white/10"
      >
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center bg-white/10">
                <span className="text-white font-semibold text-sm">WC</span>
              </div>
              <h1 className="text-xl font-semibold tracking-wide text-white">
                Western Cars
              </h1>
            </div>
            <p className="text-white/50 text-sm">
              Luxury rides, delivered with care.
            </p>
          </div>
          <div>
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
          </div>
          <div>
            <h4 className="text-white font-medium mb-4">Contact</h4>
            <ul className="space-y-2 text-white/50 text-sm">
              <li>hello@westerncars.com</li>
              <li>+44 20 1234 5678</li>
              <li>London, UK</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-4">Follow Us</h4>
            <div className="flex gap-4">
              <a
                href="#"
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
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-8 pt-8 border-t border-white/10 text-center text-white/40 text-sm">
          &copy; 2026 Western Cars. All rights reserved.
        </div>
      </footer>
    </>
  );
}
