import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ScrollToTop from "@/components/ScrollToTop";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "ParkPlan — Plan Your Perfect Park Adventure",
  description: "Discover parks, build itineraries, and plan unforgettable trips to America's national and state parks.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen w-full">
        <Providers>
          <ScrollToTop />
          <Navbar />
          <main className="w-full">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
