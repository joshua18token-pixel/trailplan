"use client";

import { useState } from "react";
import Link from "next/link";
import {
  User, Mail, MapPin, Calendar, Settings, LogOut, Crown,
  ChevronRight, Shield, Eye, Mountain, Gift, Star, Map,
} from "lucide-react";

export default function ProfilePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggedIn(true);
  };

  // Logged-in view
  if (isLoggedIn) {
    return (
      <div className="min-h-screen bg-cream">
        <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
          {/* Profile Header */}
          <div className="bg-white rounded-2xl border border-cream-dark overflow-hidden">
            <div className="bg-gradient-to-r from-forest to-forest-light h-32 sm:h-40 relative">
              <div className="absolute -bottom-10 left-6">
                <div className="w-20 h-20 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center">
                  <User className="w-10 h-10 text-forest" />
                </div>
              </div>
            </div>
            <div className="pt-14 pb-6 px-6">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-xl font-bold text-night">{name || "Adventurer"}</h1>
                  <p className="text-sm text-night/50 mt-0.5">{email || "adventurer@trailplan.app"}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-night/40">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Joined March 2026</span>
                    <span className="flex items-center gap-1"><Map className="w-3 h-3" />3 trips</span>
                    <span className="flex items-center gap-1"><Star className="w-3 h-3" />2 shared</span>
                  </div>
                </div>
                <button className="px-4 py-2 rounded-xl border border-cream-dark text-sm font-medium text-night/60 hover:bg-cream transition-colors flex items-center gap-2">
                  <Settings className="w-4 h-4" /> Settings
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid sm:grid-cols-3 gap-4 mt-6">
            <Link href="/my-trips" className="bg-white rounded-2xl border border-cream-dark p-5 hover:shadow-md transition-all group">
              <Map className="w-8 h-8 text-forest mb-3" />
              <h3 className="font-bold text-night group-hover:text-forest transition-colors">My Trips</h3>
              <p className="text-xs text-night/50 mt-1">View and manage your saved trips</p>
              <span className="text-xs text-forest mt-3 flex items-center gap-1">3 trips <ChevronRight className="w-3 h-3" /></span>
            </Link>
            <Link href="/community" className="bg-white rounded-2xl border border-cream-dark p-5 hover:shadow-md transition-all group">
              <Eye className="w-8 h-8 text-lake mb-3" />
              <h3 className="font-bold text-night group-hover:text-lake transition-colors">Shared Trips</h3>
              <p className="text-xs text-night/50 mt-1">Trips you&apos;ve shared with the community</p>
              <span className="text-xs text-lake mt-3 flex items-center gap-1">2 shared <ChevronRight className="w-3 h-3" /></span>
            </Link>
            <Link href="/trip/new" className="bg-white rounded-2xl border border-cream-dark p-5 hover:shadow-md transition-all group">
              <Mountain className="w-8 h-8 text-sunset mb-3" />
              <h3 className="font-bold text-night group-hover:text-sunset transition-colors">New Trip</h3>
              <p className="text-xs text-night/50 mt-1">Plan your next adventure</p>
              <span className="text-xs text-sunset mt-3 flex items-center gap-1">Create trip <ChevronRight className="w-3 h-3" /></span>
            </Link>
          </div>

          {/* Plan Info */}
          <div className="mt-6 bg-white rounded-2xl border border-cream-dark p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-night flex items-center gap-2">
                  <Gift className="w-5 h-5 text-forest" /> Free Plan
                </h3>
                <p className="text-sm text-night/50 mt-1">3 of 5 free trips used</p>
              </div>
              <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sunset to-sunset-light text-white font-medium text-sm hover:shadow-lg transition-all flex items-center gap-2">
                <Crown className="w-4 h-4" /> Upgrade to Pro — $20/yr
              </button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="p-3 rounded-xl bg-cream">
                <h4 className="text-xs font-semibold text-night/50">FREE</h4>
                <ul className="mt-2 space-y-1.5 text-xs text-night/60">
                  <li>✓ Up to 5 trips</li>
                  <li>✓ Full itinerary builder</li>
                  <li>✓ Share with community</li>
                  <li>✗ Ads displayed</li>
                </ul>
              </div>
              <div className="p-3 rounded-xl bg-sunset/5 border border-sunset/20">
                <h4 className="text-xs font-semibold text-sunset flex items-center gap-1"><Crown className="w-3 h-3" /> PRO — $20/yr</h4>
                <ul className="mt-2 space-y-1.5 text-xs text-night/60">
                  <li>✓ <strong>Unlimited</strong> trips</li>
                  <li>✓ <strong>Ad-free</strong></li>
                  <li>✓ Offline access</li>
                  <li>✓ Gear checklists</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Sign Out */}
          <button
            onClick={() => setIsLoggedIn(false)}
            className="mt-6 flex items-center gap-2 text-sm text-night/40 hover:text-red-500 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>
    );
  }

  // Not logged in — sign up / sign in
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center py-10 px-3">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-forest to-forest-light p-8 text-white text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4">
              {mode === "signup" ? <Gift className="w-8 h-8" /> : <Shield className="w-8 h-8" />}
            </div>
            <h1 className="text-2xl font-bold">{mode === "signup" ? "Join TrailPlan" : "Welcome Back"}</h1>
            <p className="text-white/80 text-sm mt-1">
              {mode === "signup" ? "Create a free account to save your trips" : "Sign in to access your adventures"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {mode === "signup" && (
              <div>
                <label className="text-xs font-medium text-night/60 mb-1 block">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest focus:border-forest"
                  placeholder="Your name"
                />
              </div>
            )}
            <div>
              <label className="text-xs font-medium text-night/60 mb-1 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest focus:border-forest"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-night/60 mb-1 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest focus:border-forest"
                placeholder="••••••••"
              />
            </div>

            <button type="submit" className="w-full py-3 rounded-xl bg-forest text-white font-medium hover:bg-forest-light transition-colors shadow-md">
              {mode === "signup" ? "Create Free Account" : "Sign In"}
            </button>

            {mode === "signup" && (
              <div className="text-center">
                <p className="text-xs text-night/40 mt-2">✨ Get 5 free trips — no credit card required</p>
              </div>
            )}
          </form>

          <div className="px-6 pb-6 text-center">
            <button
              onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
              className="text-sm text-forest hover:underline"
            >
              {mode === "signup" ? "Already have an account? Sign in" : "Don't have an account? Sign up free"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
