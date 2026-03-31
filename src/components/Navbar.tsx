"use client";

import Link from "next/link";
import { Mountain, Compass, Map, PlusCircle, User, Menu, X, Users, LogOut, Shield } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, profile, signOut } = useAuth();

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
              href="/my-trips"
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

            {/* Auth Button */}
            {user ? (
              <div className="ml-4 flex items-center gap-2">
                {profile?.role === "super_admin" && (
                  <Link href="/admin" className="p-2 rounded-lg bg-gold/10 text-gold hover:bg-gold/20 transition-colors" title="Admin Panel">
                    <Shield className="w-4 h-4" />
                  </Link>
                )}
                <Link href="/profile" className="w-9 h-9 rounded-full bg-forest/10 flex items-center justify-center hover:bg-forest/20 transition-colors" title={profile?.display_name || "Profile"}>
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover" />
                  ) : (
                    <span className="text-sm font-bold text-forest">
                      {(profile?.display_name || profile?.email || "U")[0].toUpperCase()}
                    </span>
                  )}
                </Link>
              </div>
            ) : (
              <Link href="/profile" className="ml-4 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sunset/10 text-sunset hover:bg-sunset/20 transition-all font-medium text-sm">
                <User className="w-4 h-4" />
                Sign In
              </Link>
            )}
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
            <Link href="/explore" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-night/70 hover:bg-forest/5 transition-all">
              <Compass className="w-5 h-5" /> Explore
            </Link>
            <Link href="/community" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-night/70 hover:bg-forest/5 transition-all">
              <Users className="w-5 h-5" /> Community
            </Link>
            <Link href="/my-trips" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-night/70 hover:bg-forest/5 transition-all">
              <Map className="w-5 h-5" /> My Trips
            </Link>
            <Link href="/trip/new" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-forest text-white">
              <PlusCircle className="w-5 h-5" /> Create Trip
            </Link>
            <hr className="border-cream-dark my-2" />
            {user ? (
              <>
                <Link href="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-night/70 hover:bg-forest/5 transition-all">
                  <User className="w-5 h-5" />
                  <div>
                    <div className="font-medium">{profile?.display_name || "Profile"}</div>
                    <div className="text-xs text-night/40">{profile?.email}</div>
                  </div>
                </Link>
                <button
                  onClick={() => { signOut(); setMobileOpen(false); }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 transition-all w-full text-left"
                >
                  <LogOut className="w-5 h-5" /> Sign Out
                </button>
              </>
            ) : (
              <Link href="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sunset hover:bg-sunset/5 transition-all">
                <User className="w-5 h-5" /> Sign In / Sign Up
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
