"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const reviews = [
  {
    name: "Andrea Frontelo",
    userLink: "https://www.trustpilot.com/users/64dcc4043610b700117c3a85",
    location: "East Grinstead • Gatwick Transfer",
    title: "Great service",
    review:
      "I use western cats frequently and find the service great. Easy to use app, great communication and always on time!",
    image:
      "https://user-images.trustpilot.com/64dcc4043610b700117c3a85/73x73.png",
  },
  {
    name: "Mrs STACEY",
    userLink: "https://www.trustpilot.com/users/5226144000006400014aa3bf",
    location: "Corporate Account",
    title: "Would highly recommend",
    review:
      "Super lady driver. Motor car clean & tidy. Felt save & comfortable. Great service. Reasonably priced.",
    image:
      "https://user-images.trustpilot.com/5226144000006400014aa3bf/73x73.png",
    featured: true,
  },
  {
    name: "Megan Watkinson",
    location: "London • Heathrow Transfer",
    review:
      "Our driver drove us home safely and efficiently. Very friendly and helpful. Good value for money and smooth pleasant journey to our destination",
    image:
      "https://user-images.trustpilot.com/5ccae1c84e08cbdd84935edf/73x73.png",
  },
  {
    name: "Tish Hands",
    location: "Lingfield • Heathrow Return",
    review:
      "We missed the last train whilst in Horsham last night and felt stranded! We phoned Western Cars and they despatched a driver to collect us straight away. The communication was amazing and we were advised of when our taxi arrived and the reg plate. The driver was friendly and ensured that we had got in the front door safely before he left. We were quoted a fixed price which was the price we paid. I will definitely be saving their number in my phone for when we next need a taxi.",
    image:
      "https://user-images.trustpilot.com/657e03462a9e12001141a5df/73x73.png",
  },
  {
    name: "Mr Treharne",
    location: "Brighton",
    title: "Good journey to Brighton and return",
    review:
      "Good journey to Brighton and return. Excellent BMW 5 series. Very clean and driver was very helpful, friendly and accomplished.Booking was effortless and the chauffeur was fantastic.",
    image:
      "https://user-images.trustpilot.com/4f323cde0000640001139a87/73x73.png",
  },
  {
    name: "swetha k",
    location: "Crawley Local Taxi",
    title: "Excellent service",
    review:
      "Mr yogesh was extremely helpful while coming to Heathrow airport and helped us. I can highly recommend this service. Thank you for your help and support. I will definitely use this service again.",
    image:
      "https://user-images.trustpilot.com/6a6036d37b418cfba6878678/73x73.png",
  },
];
export default function ClientReviews() {
  const section = useRef<HTMLDivElement>(null);
  const slider = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!section.current || !slider.current) return;

    const ctx = gsap.context(() => {
      const distance = slider.current!.scrollWidth - window.innerWidth;

      gsap.to(slider.current, {
        x: -distance,
        ease: "none",
        scrollTrigger: {
          trigger: section.current,
          start: "top top",
          end: () => `+=${distance}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <motion.section
      ref={section}
        initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1 }}


      className="relative overflow-hidden bg-black py-24 "
    >
      <div className="text-center mb-16">
        <span className="rounded-full bg-blue-100 px-5 py-2 text-sm font-semibold">
          CLIENT REVIEWS
        </span>

        <h2 className="mt-6 text-5xl font-bold">Trusted by Thousands</h2>

        <div className="mt-4 flex items-center justify-center gap-2">
          ⭐⭐⭐⭐⭐
          <span className="text-slate-500">4.9 / 5 from 847 reviews</span>
        </div>
      </div>

      <div ref={slider} className="flex gap-8 w-max px-[10vw]">
        {reviews.map((review, index) => (
          <div
            key={index}
            className={`w-[430px] rounded-3xl p-10 shadow-xl flex-shrink-0 ${
              review.featured
                ? "bg-[#162447] text-white"
                : "bg-white text-slate-800"
            }`}
          >
            <div className="text-yellow-400 text-xl mb-6">⭐⭐⭐⭐⭐</div>

            <p className="leading-8 text-lg">"{review.review}"</p>

            <div className="mt-10 flex items-center gap-4">
              <img
                src={review.image}
                className="h-14 w-14 rounded-full object-cover"
                alt=""
              />

              <div>
                <h4 className="font-semibold">{review.name}</h4>

                <p className="text-sm opacity-70">{review.location}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  );
}
