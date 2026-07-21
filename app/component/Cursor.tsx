"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";



export default function Cursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");

    const update = () => {
      setIsDesktop(media.matches);
    };

    update();

    media.addEventListener("change", update);

    return () => {
      media.removeEventListener("change", update);
    };
  }, []);









  useEffect(() => {
    if (!isDesktop) return;
    
    const cursor = cursorRef.current;
    if (!cursor) return;

    const handleMouseMove = (e: MouseEvent) => {
      gsap.to(cursor, {
        x: e.clientX - cursor.offsetWidth / 2,
        y: e.clientY - cursor.offsetHeight / 2,
        duration: 0.12,
        ease: "power2.out",
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isDesktop]);

  // Don't render anything on mobile
  if (!isDesktop) return null;

  return <div ref={cursorRef} className="cursor" />;
}
