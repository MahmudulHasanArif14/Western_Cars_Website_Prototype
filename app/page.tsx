"use client";

import { useState } from "react";

import Header from "./component/layout/Header";
import Footer from "./component/layout/Footer";
import ClientReview from "./component/sections/ClientReviews"

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

  return (
    <>
      <ThemeToggle />
      <SoundToggle />

      <main className="min-h-screen">
        <Hero setBookingOpen={setBookingOpen} />
        <Story />
        <Rates setBookingOpen={setBookingOpen} />
        <ClientReview/>
        <Benefits />
        <FAQ faqOpen={faqOpen} setFaqOpen={setFaqOpen} faqs={FAQData} />
        <Footer />
      </main>
    </>
  );
}
