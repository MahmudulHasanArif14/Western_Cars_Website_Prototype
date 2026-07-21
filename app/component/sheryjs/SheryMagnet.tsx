"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    Shery: any;
  }
}

export default function SheryMagnet() {
    useEffect(() => {
      console.log("Shery:", window.Shery);
    const init = () => {
        if (!window.Shery) return;
         console.log("Shery:", window.Shery);

        window.Shery.makeMagnet("a", {});
        window.Shery.makeMagnet(".magnet", {});
      window.Shery.mouseFollower();
    };

    // If already loaded
    if (window.Shery) {
      init();
      return;
    }

    // Wait until the script finishes loading
    window.addEventListener("shery-loaded", init);

    return () => {
      window.removeEventListener("shery-loaded", init);
    };
  }, []);

  return null;
}
