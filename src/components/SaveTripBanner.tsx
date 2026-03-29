"use client";

import { useState } from "react";
import { X, Bookmark, Lock, Crown, Gift } from "lucide-react";

interface SaveTripBannerProps {
  onSignUp: () => void;
  onDismiss: () => void;
}

export function SaveTripBanner({ onSignUp, onDismiss }: SaveTripBannerProps) {
  return (
    <div className="bg-gradient-to-r from-forest to-forest-light rounded-xl sm:rounded-2xl p-4 sm:p-5 text-white relative overflow-hidden">
      <button
        onClick={onDismiss}
        className="absolute top-3 right-3 p-1 rounded-lg hover:bg-white/20 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <Bookmark className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base sm:text-lg">Save your trip!</h3>
          <p className="text-white/80 text-xs sm:text-sm mt-1">Create a free account to save this itinerary, access it from any device, and share it with friends.</p>
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <button
              onClick={onSignUp}
              className="px-4 py-2 rounded-lg bg-white text-forest font-medium text-sm hover:bg-white/90 transition-colors shadow-md"
            >
              Create Free Account
            </button>
            <button
              onClick={onSignUp}
              className="px-4 py-2 rounded-lg bg-white/20 text-white font-medium text-sm hover:bg-white/30 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface AuthModalProps {
  mode: "signup" | "signin";
  onClose: () => void;
}

export function AuthModal({ mode, onClose }: AuthModalProps) {
  const [currentMode, setCurrentMode] = useState(mode);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Prototype — just close the modal and show a success state
    alert(currentMode === "signup"
      ? "🎉 Account created! (This is a prototype — real auth coming soon)"
      : "✅ Signed in! (This is a prototype — real auth coming soon)"
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-forest to-forest-light p-6 text-white text-center relative">
          <button onClick={onClose} className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-white/20 transition-colors">
            <X className="w-5 h-5" />
          </button>
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-3">
            {currentMode === "signup" ? <Gift className="w-7 h-7" /> : <Lock className="w-7 h-7" />}
          </div>
          <h2 className="text-xl font-bold">{currentMode === "signup" ? "Create Your Account" : "Welcome Back"}</h2>
          <p className="text-white/80 text-sm mt-1">
            {currentMode === "signup" ? "Start saving trips for free" : "Sign in to access your trips"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {currentMode === "signup" && (
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

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-forest text-white font-medium hover:bg-forest-light transition-colors shadow-md"
          >
            {currentMode === "signup" ? "Create Account — Free" : "Sign In"}
          </button>

          {/* Free vs Pro comparison (on signup) */}
          {currentMode === "signup" && (
            <div className="pt-3 border-t border-gray-100">
              <p className="text-xs font-medium text-night/50 mb-3 text-center">What you get</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border border-gray-100 bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="w-4 h-4 text-forest" />
                    <span className="text-xs font-bold text-forest">Free</span>
                  </div>
                  <ul className="space-y-1 text-[11px] text-night/60">
                    <li>✓ Save up to 5 trips</li>
                    <li>✓ Full itinerary builder</li>
                    <li>✓ Restaurant finder</li>
                    <li>✓ Share with friends</li>
                    <li className="text-night/30">✗ Ads displayed</li>
                  </ul>
                </div>
                <div className="p-3 rounded-xl border-2 border-sunset bg-sunset/5 relative">
                  <div className="absolute -top-2 right-2 px-2 py-0.5 rounded-full bg-sunset text-white text-[9px] font-bold">BEST VALUE</div>
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="w-4 h-4 text-sunset" />
                    <span className="text-xs font-bold text-sunset">Pro — $20/yr</span>
                  </div>
                  <ul className="space-y-1 text-[11px] text-night/60">
                    <li>✓ <strong>Unlimited</strong> trips</li>
                    <li>✓ <strong>Ad-free</strong> experience</li>
                    <li>✓ Offline access</li>
                    <li>✓ Gear checklists</li>
                    <li>✓ Priority support</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </form>

        <div className="px-6 pb-5 text-center">
          <button
            onClick={() => setCurrentMode(currentMode === "signup" ? "signin" : "signup")}
            className="text-sm text-forest hover:underline"
          >
            {currentMode === "signup" ? "Already have an account? Sign in" : "Don't have an account? Sign up free"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Affiliate ad banner component
export function AffiliateAdBanner() {
  const ads = [
    {
      title: "🛶 Yosemite Kayak Rentals",
      description: "Half-day & full-day kayak rentals on Tenaya Lake. Book online for 15% off!",
      cta: "Book Now →",
      url: "#",
      sponsor: "Sierra Paddle Co.",
      bg: "from-lake/10 to-lake/5 border-lake/20",
      ctaColor: "bg-lake text-white",
    },
    {
      title: "🚴 Mountain Bike Yosemite Valley",
      description: "Rent premium mountain bikes and explore 12+ miles of valley trails.",
      cta: "Reserve Bikes →",
      url: "#",
      sponsor: "Yosemite Bike Share",
      bg: "from-forest/10 to-forest/5 border-forest/20",
      ctaColor: "bg-forest text-white",
    },
    {
      title: "🏕️ Glamping Near Yosemite",
      description: "Luxury tent cabins with real beds, hot showers, and stargazing decks.",
      cta: "Check Availability →",
      url: "#",
      sponsor: "AutoCamp Yosemite",
      bg: "from-sunset/10 to-sunset/5 border-sunset/20",
      ctaColor: "bg-sunset text-white",
    },
  ];

  const [adIndex] = useState(() => Math.floor(Math.random() * ads.length));
  const ad = ads[adIndex];

  return (
    <div className={`bg-gradient-to-r ${ad.bg} rounded-xl sm:rounded-2xl p-4 border`}>
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-night/5 text-night/40 font-medium">SPONSORED</span>
        <span className="text-[10px] text-night/30">{ad.sponsor}</span>
      </div>
      <h4 className="font-bold text-night text-sm">{ad.title}</h4>
      <p className="text-xs text-night/60 mt-1">{ad.description}</p>
      <a
        href={ad.url}
        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg ${ad.ctaColor} text-xs font-medium mt-2 hover:opacity-90 transition-opacity`}
      >
        {ad.cta}
      </a>
    </div>
  );
}
