"use client";

import { useState, useRef } from "react";

import Header from "./component/layout/Header";
import Footer from "./component/layout/Footer";
import ClientReview from "./component/sections/ClientReviews";

import Hero from "./component/sections/Hero";

import Story from "./component/sections/Story";
import Rates from "./component/sections/Rates";
import Benefits from "./component/sections/Benefits";
import FAQ from "./component/sections/FAQ";
import ThemeToggle from "./ui/ThemeToggle";
import SoundToggle from "./ui/SoundToggle";
import { FAQData } from "./data/faqData";

export default function Home() {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const toggleSound = () => {
    if (videoRef.current) {
      const newMutedState = !isMuted;
      videoRef.current.muted = newMutedState;
      setIsMuted(newMutedState);

      // If unmuting, try to play (required for autoplay policies)
      if (!newMutedState) {
        videoRef.current.play().catch((error) => {
          console.log("Autoplay prevented:", error);
          // Revert to muted if play fails
          videoRef.current!.muted = true;
          setIsMuted(true);
        });
      }
    }
  };

  return (
    <>
      <ThemeToggle />
      <SoundToggle isMuted={isMuted} onToggle={toggleSound} />

      <main className="min-h-screen">
        <Hero
          setBookingOpen={setBookingOpen}
          videoRef={videoRef}
          isMuted={isMuted}
          setIsMuted={setIsMuted}
        />
        <Story />
        <Rates setBookingOpen={setBookingOpen} />
        <ClientReview />
        <Benefits />
        <FAQ faqOpen={faqOpen} setFaqOpen={setFaqOpen} faqs={FAQData} />
        <Footer />
      </main>
    </>
  );
}
