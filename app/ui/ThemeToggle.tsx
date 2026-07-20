"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="fixed bottom-8 left-8 z-50 p-3 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-white"
    >
      {isDark ? "🌙" : "☀️"}
    </button>
  );
}
