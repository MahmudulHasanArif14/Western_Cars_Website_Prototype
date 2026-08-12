"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

import ThemeToggle from "../ui/ThemeToggle";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function BookError({ error, reset }: ErrorPageProps) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    console.error("Booking page error:", error);
  }, [error]);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <main
      className={`
        flex min-h-screen w-full flex-col items-center justify-center
        px-6 text-center
        transition-colors duration-300
        ${isDark ? "bg-gray-900 text-white" : "bg-white text-gray-900"}
      `}
    >
      <h1
        className={`
          text-4xl font-bold sm:text-5xl
          ${isDark ? "text-white" : "text-gray-900"}
        `}
      >
        Booking Page Error
      </h1>

      <p
        className={`
          mt-4 max-w-md
          ${isDark ? "text-gray-300" : "text-gray-600"}
        `}
      >
        Sorry, something went wrong while loading the booking page.
      </p>

      {/* Theme-specific error image */}
      {mounted && (
        <Image
          key={isDark ? "dark-error" : "light-error"}
          width={400}
          height={400}
          src={
            isDark
              ? "https://cdn.dribbble.com/userupload/21979662/file/original-539c2d14b53b70b385cede788920b22f.png?resize=752x564&vertical=center"
              : "https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif"
          }
          alt="Something went wrong"
          priority
          unoptimized
          className="mt-6 h-auto w-[280px] sm:w-[350px]"
        />
      )}

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="
            rounded-xl
            bg-[#1e3a5f]
            px-5 py-2.5
            font-semibold
            text-white
            transition
            hover:bg-[#162d49]
          "
        >
          Try Again
        </button>

        <Link
          href="/"
          className={`
            rounded-xl
            px-5 py-2.5
            font-semibold
            transition
            ${
              isDark
                ? "bg-gray-700 text-white hover:bg-gray-600"
                : "bg-gray-200 text-gray-900 hover:bg-gray-300"
            }
          `}
        >
          Go Home
        </Link>
      </div>

      <div className="mt-8">
        <ThemeToggle />
      </div>
    </main>
  );
}
