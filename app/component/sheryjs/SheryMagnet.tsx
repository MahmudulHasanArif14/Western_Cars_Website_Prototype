"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    Shery: any;
  }
}

export default function SheryMagnet() {
  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");

    // Don't initialize on touch devices
    if (!media.matches) return;

    const init = () => {
      if (!window.Shery) return;

      window.Shery.makeMagnet("a", {});
      window.Shery.mouseFollower();
    };

    if (window.Shery) {
      init();
    } else {
      window.addEventListener("shery-loaded", init);
    }

    return () => {
      window.removeEventListener("shery-loaded", init);
    };
  }, []);

  return null;
}
