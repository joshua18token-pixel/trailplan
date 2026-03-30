"use client";

import { useState } from "react";
import Link from "next/link";
import {
  User, Mail, Lock, Eye, EyeOff, LogOut, MapPin, Calendar,
  Star, Settings, ChevronRight, Mountain, Shield, Edit3,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function ProfilePage() {
  const { user, profile, loading, signUp, signIn, signOut, updateProfile } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Editing profile
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    if (mode === "signup") {
      if (!name.trim()) { setError("Please enter your name"); setSubmitting(false); return; }
      if (password.length < 6) { setError("Password must be at least 6 characters"); setSubmitting(false); return; }
      const result = await signUp(email, password, name);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess("Account created! Check your email to confirm, then sign in.");
      }
    } else {
      const result = await signIn(email, password);
      if (result.error) {
        setError(result.error);
      }
    }
    setSubmitting(false);
  };

  const handleUpdateName = async () => {
    if (!newName.trim()) return;
    const result = await updateProfile({ display_name: newName.trim() });
    if (!result.error) {
      setEditingName(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-3 border-forest border-t-transparent rounded-full" />
      </div>
    );
  }

  // ====== LOGGED IN VIEW ======
  if (user && profile) {
    return (
      <div className="min-h-screen bg-cream">
        <div className="max-w-2xl mx-auto px-4 py-10">
          {/* Profile Header */}
          <div className="bg-white rounded-2xl p-6 shadow-md mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-forest/10 flex items-center justify-center">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-16 h-16 rounded-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-forest">
                    {(profile.display_name || profile.email || "U")[0].toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1">
                {editingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                      placeholder="Your name"
                      autoFocus
                    />
                    <button onClick={handleUpdateName} className="text-xs px-3 py-1.5 rounded-lg bg-forest text-white">Save</button>
                    <button onClick={() => setEditingName(false)} className="text-xs px-3 py-1.5 rounded-lg bg-gray-100">Cancel</button>
                  </div>
                ) : (
                  <h1 className="text-xl font-bold text-night flex items-center gap-2">
                    {profile.display_name || "Trail Explorer"}
                    <button onClick={() => { setNewName(profile.display_name || ""); setEditingName(true); }} className="p-1 rounded-lg hover:bg-gray-100">
                      <Edit3 className="w-3.5 h-3.5 text-night/30" />
                    </button>
                  </h1>
                )}
                <p className="text-sm text-night/50">{profile.email}</p>
              </div>
            </div>

            {/* Plan Badge */}
            <div className="mt-4 p-3 rounded-xl bg-cream flex items-center justify-between">
              <div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${profile.plan === "pro" ? "bg-sunset text-white" : "bg-forest/10 text-forest"}`}>
                  {profile.plan === "pro" ? "⭐ PRO" : "FREE"}
                </span>
                <span className="text-sm text-night/50 ml-2">
                  {profile.plan === "pro" ? "Unlimited trips & features" : `${profile.trip_count}/5 free trips used`}
                </span>
              </div>
              {profile.plan !== "pro" && (
                <button className="text-xs px-3 py-1.5 rounded-lg bg-sunset text-white font-medium hover:bg-sunset-light transition-colors">
                  Upgrade to Pro
                </button>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-6">
            <Link href="/my-trips" className="flex items-center justify-between p-4 hover:bg-cream transition-colors border-b border-cream-dark">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-forest" />
                <span className="font-medium text-night">My Trips</span>
              </div>
              <ChevronRight className="w-4 h-4 text-night/30" />
            </Link>
            <Link href="/trip/new" className="flex items-center justify-between p-4 hover:bg-cream transition-colors border-b border-cream-dark">
              <div className="flex items-center gap-3">
                <Mountain className="w-5 h-5 text-sunset" />
                <span className="font-medium text-night">Plan New Trip</span>
              </div>
              <ChevronRight className="w-4 h-4 text-night/30" />
            </Link>
            <Link href="/community" className="flex items-center justify-between p-4 hover:bg-cream transition-colors border-b border-cream-dark">
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-gold" />
                <span className="font-medium text-night">Community Trips</span>
              </div>
              <ChevronRight className="w-4 h-4 text-night/30" />
            </Link>
            <Link href="/explore" className="flex items-center justify-between p-4 hover:bg-cream transition-colors">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-lake" />
                <span className="font-medium text-night">Explore Parks</span>
              </div>
              <ChevronRight className="w-4 h-4 text-night/30" />
            </Link>
          </div>

          {/* Sign Out */}
          <button
            onClick={signOut}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  // ====== AUTH FORM (NOT LOGGED IN) ======
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-forest/10 flex items-center justify-center mx-auto mb-4">
            <Mountain className="w-8 h-8 text-forest" />
          </div>
          <h1 className="text-2xl font-bold text-night">
            {mode === "signup" ? "Join TrailPlan" : "Welcome Back"}
          </h1>
          <p className="text-sm text-night/50 mt-1">
            {mode === "signup" ? "Start planning your perfect outdoor adventures" : "Sign in to access your trips"}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl p-6 shadow-md">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>
          )}
          {success && (
            <div className="mb-4 p-3 rounded-lg bg-green-50 text-green-600 text-sm">{success}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-sm font-medium text-night/70 mb-1">Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-night/30" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-forest focus:bg-white transition-all"
                    placeholder="Your name"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-night/70 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-night/30" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-forest focus:bg-white transition-all"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-night/70 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-night/30" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-forest focus:bg-white transition-all"
                  placeholder={mode === "signup" ? "At least 6 characters" : "Your password"}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-gray-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 text-night/30" /> : <Eye className="w-4 h-4 text-night/30" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-forest text-white font-semibold text-sm hover:bg-forest-light transition-colors disabled:opacity-50"
            >
              {submitting ? "..." : mode === "signup" ? "Create Account" : "Sign In"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-night/40">
              {mode === "signup" ? "Already have an account?" : "Don't have an account?"}
              <button
                onClick={() => { setMode(mode === "signup" ? "signin" : "signup"); setError(""); setSuccess(""); }}
                className="text-forest font-medium ml-1 hover:underline"
              >
                {mode === "signup" ? "Sign In" : "Sign Up"}
              </button>
            </p>
          </div>

          {mode === "signup" && (
            <p className="mt-4 text-center text-xs text-night/30">
              ✨ Get 5 free trips — no credit card required
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
