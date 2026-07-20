"use client";

import { ReactNode, useEffect } from "react";

import { useDarkMode } from "../hooks/useDarkMode";


export default function Providers({ children }: { children: ReactNode }) {
  const [isDark] = useDarkMode();

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  return <>{children}</>;
}
