
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "next-themes";
import Cursor from "./component/Cursor";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import SheryMagnet from "./component/sheryjs/SheryMagnet";
import SheryScripts from "./component/sheryjs/SheryScripts";
import SmoothScroll from "./component/lenis/SmoothScroll";
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Western Cars - Premium Luxury Car Service",
  description:
    "Luxury airport transfers and executive private travel designed for comfort, elegance, and seamless journeys.",
  keywords:
    "luxury car service, airport transfer, executive travel, chauffeur service",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/sheryjs/dist/Shery.css"
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SmoothScroll />
          <SheryScripts />
          <Cursor />
          <SheryMagnet />
          {children}
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
