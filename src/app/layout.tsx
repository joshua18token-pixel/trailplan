import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ScrollToTop from "@/components/ScrollToTop";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "TrailPlan — Plan Your Perfect Outdoor Adventure",
  description: "Discover trails, build itineraries, and plan unforgettable trips to America's national parks.",
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
