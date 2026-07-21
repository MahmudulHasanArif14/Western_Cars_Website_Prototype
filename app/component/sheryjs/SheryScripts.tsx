"use client";

import Script from "next/script";

export default function SheryScripts() {
  return (
    <>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"
        strategy="afterInteractive"
      />

      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/gsap.min.js"
        strategy="afterInteractive"
      />

      <Script
        src="https://unpkg.com/sheryjs/dist/Shery.js"
        strategy="afterInteractive"
        onLoad={() => {
          window.dispatchEvent(new Event("shery-loaded"));
        }}
      />
    </>
  );
}
