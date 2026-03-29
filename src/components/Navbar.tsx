"use client";

import Link from "next/link";
import { Mountain, Compass, Map, PlusCircle, User, Menu, X, Users } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-cream-dark w-full">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-forest flex items-center justify-center group-hover:bg-forest-light transition-colors">
              <Mountain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-night">
              Trail<span className="text-forest">Plan</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/explore"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-night/70 hover:text-forest hover:bg-forest/5 transition-all font-medium"
            >
              <Compass className="w-4 h-4" />
              Explore
            </Link>
            <Link
              href="/community"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-night/70 hover:text-forest hover:bg-forest/5 transition-all font-medium"
            >
              <Users className="w-4 h-4" />
              Community
            </Link>
            <Link
              href="/trip/yosemite-adventure"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-night/70 hover:text-forest hover:bg-forest/5 transition-all font-medium"
            >
              <Map className="w-4 h-4" />
              My Trips
            </Link>
            <Link
              href="/trip/new"
              className="flex items-center gap-2 px-4 py-2 ml-2 rounded-lg bg-forest text-white hover:bg-forest-light transition-all font-medium"
            >
              <PlusCircle className="w-4 h-4" />
              Create Trip
            </Link>
            <button className="ml-4 w-9 h-9 rounded-full bg-sunset/10 flex items-center justify-center hover:bg-sunset/20 transition-colors">
              <User className="w-5 h-5 text-sunset" />
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-cream-dark transition-colors"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-cream-dark bg-white/95 backdrop-blur-lg">
          <div className="px-4 py-3 space-y-1">
            <Link
              href="/explore"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-night/70 hover:bg-forest/5 transition-all"
            >
              <Compass className="w-5 h-5" />
              Explore
            </Link>
            <Link
              href="/community"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-night/70 hover:bg-forest/5 transition-all"
            >
              <Users className="w-5 h-5" />
              Community
            </Link>
            <Link
              href="/trip/yosemite-adventure"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-night/70 hover:bg-forest/5 transition-all"
            >
              <Map className="w-5 h-5" />
              My Trips
            </Link>
            <Link
              href="/trip/new"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-forest text-white"
            >
              <PlusCircle className="w-5 h-5" />
              Create Trip
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
