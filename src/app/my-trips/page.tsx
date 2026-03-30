"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  MapPin, Calendar, Plus, Trash2, Edit3, Share2, Lock,
  ChevronRight, Mountain, Clock, Users, Star, Plane, Car,
  Eye, EyeOff, Crown, Search, LogIn,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";

interface SavedTrip {
  id: string;
  slug: string;
  name: string;
  parks: { name: string; state: string; type: string }[];
  startDate: string;
  endDate: string;
  duration: number;
  status: "planning" | "upcoming" | "completed" | "draft";
  shared: boolean;
  createdAt: string;
  activities: number;
  difficulty: string;
  coverImage?: string;
}

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  planning: { bg: "bg-lake/10", text: "text-lake", label: "Planning" },
  upcoming: { bg: "bg-forest/10", text: "text-forest", label: "Upcoming" },
  completed: { bg: "bg-trail/10", text: "text-trail", label: "Completed" },
  draft: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Draft" },
};

const MAX_FREE_TRIPS = 5;

// Park images for display
const parkImages: Record<string, string> = {
  yosemite: "https://images.unsplash.com/photo-1562310503-a918c4c61e38?w=400&q=80",
  zion: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=400&q=80",
  "grand-canyon": "https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?w=400&q=80",
  glacier: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&q=80",
  yellowstone: "https://images.unsplash.com/photo-1533419271378-21a4f5e204d1?w=400&q=80",
  acadia: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80",
};

export default function MyTripsPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Load trips from Supabase + localStorage
  useEffect(() => {
    async function loadTrips() {
      const allTrips: SavedTrip[] = [];

      // Load from Supabase if logged in
      if (user) {
        const { data } = await supabase
          .from("trips")
          .select("*")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false });

        if (data) {
          for (const t of data) {
            allTrips.push({
              id: t.id,
              slug: t.slug || t.id,
              name: t.name,
              parks: (t.parks || []).map((p: any) => ({ name: p.fullName || p.name, state: p.state, type: p.type })),
              startDate: t.dates?.start || "2025-07-14",
              endDate: t.dates?.end || "2025-07-18",
              duration: t.days?.length || 1,
              status: (t.status || "planning") as SavedTrip["status"],
              shared: t.shared || false,
              createdAt: t.created_at,
              activities: t.days?.reduce((sum: number, d: any) => sum + (d.slots?.length || 0), 0) || 0,
              difficulty: t.settings?.fitness || "Moderate",
              coverImage: parkImages[t.main_park_id] || undefined,
            });
          }
        }
      }

      // Also load from localStorage (for trips not yet associated with account)
      try {
        const keys = Object.keys(localStorage).filter((k) => k.startsWith("trailplan-trip-"));
        for (const key of keys) {
          const slug = key.replace("trailplan-trip-", "");
          // Skip if already loaded from Supabase
          if (allTrips.find((t) => t.slug === slug || t.id === slug)) continue;
          const data = JSON.parse(localStorage.getItem(key) || "{}");
          if (data.name) {
            allTrips.push({
              id: data.id || slug,
              slug,
              name: data.name,
              parks: data.parks?.map((p: any) => ({ name: p.fullName || p.name, state: p.state, type: p.type })) || [],
              startDate: data.settings?.startDate || "2025-07-14",
              endDate: data.settings?.endDate || "2025-07-18",
              duration: data.days?.length || 1,
              status: "planning",
              shared: false,
              createdAt: data.createdAt || new Date().toISOString(),
              activities: data.days?.reduce((sum: number, d: any) => sum + (d.slots?.length || 0), 0) || 0,
              difficulty: data.settings?.fitness || "Moderate",
            });
          }
        }
      } catch {}

      setTrips(allTrips);
      setLoading(false);
    }

    if (!authLoading) loadTrips();
  }, [user, authLoading]);

  const handleDelete = async (tripId: string) => {
    if (!confirm("Delete this trip? This cannot be undone.")) return;

    // Delete from Supabase
    if (user) {
      await supabase.from("trips").delete().eq("id", tripId);
    }

    // Delete from localStorage
    const trip = trips.find((t) => t.id === tripId);
    if (trip) {
      localStorage.removeItem(`trailplan-trip-${trip.slug}`);
      localStorage.removeItem(`trailplan-trip-${trip.id}`);
    }

    setTrips((prev) => prev.filter((t) => t.id !== tripId));
  };

  const filtered = trips.filter((t) => !activeFilter || t.status === activeFilter);
  const statusCounts = {
    planning: trips.filter((t) => t.status === "planning").length,
    upcoming: trips.filter((t) => t.status === "upcoming").length,
    completed: trips.filter((t) => t.status === "completed").length,
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-3 border-forest border-t-transparent rounded-full" />
      </div>
    );
  }

  // ====== NOT LOGGED IN — EMPTY STATE ======
  if (!user) {
    return (
      <div className="min-h-screen bg-cream">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <div className="w-20 h-20 rounded-2xl bg-forest/10 flex items-center justify-center mx-auto mb-6">
            <Mountain className="w-10 h-10 text-forest" />
          </div>
          <h1 className="text-3xl font-bold text-night mb-3">My Trips</h1>
          <p className="text-night/50 mb-8 max-w-md mx-auto">
            Sign in to save your trips, access them from any device, and share them with the community.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/profile"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-forest text-white font-medium hover:bg-forest-light transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Sign In / Sign Up
            </Link>
            <Link
              href="/trip/new"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-cream-dark text-night/70 font-medium hover:bg-cream transition-colors"
            >
              <Plus className="w-4 h-4" />
              Plan a Trip
            </Link>
          </div>
          <p className="text-xs text-night/30 mt-6">✨ Get 5 free trips — no credit card required</p>
        </div>
      </div>
    );
  }

  // ====== LOGGED IN — NO TRIPS YET ======
  if (trips.length === 0) {
    return (
      <div className="min-h-screen bg-cream">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <div className="w-20 h-20 rounded-2xl bg-forest/10 flex items-center justify-center mx-auto mb-6">
            <MapPin className="w-10 h-10 text-forest" />
          </div>
          <h1 className="text-3xl font-bold text-night mb-3">No Trips Yet</h1>
          <p className="text-night/50 mb-8 max-w-md mx-auto">
            Start planning your first adventure! Search for any park and we&apos;ll build a custom itinerary for you.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/trip/new"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-forest text-white font-medium hover:bg-forest-light transition-colors"
            >
              <Plus className="w-4 h-4" />
              Plan Your First Trip
            </Link>
            <Link
              href="/community"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-cream-dark text-night/70 font-medium hover:bg-cream transition-colors"
            >
              <Star className="w-4 h-4" />
              Browse Community Trips
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ====== LOGGED IN — HAS TRIPS ======
  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-night">My Trips</h1>
            <p className="text-sm text-night/50 mt-1">{trips.length} of {MAX_FREE_TRIPS} free trips used</p>
          </div>
          <Link
            href="/trip/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-night text-white font-medium text-sm hover:bg-night/80 transition-colors"
          >
            <Plus className="w-4 h-4" /> New Trip
          </Link>
        </div>

        {/* Free tier progress */}
        {profile?.plan !== "pro" && (
          <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-night/60">Trip Slots</span>
              <span className="text-sm text-night/40">{trips.length}/{MAX_FREE_TRIPS} free</span>
            </div>
            <div className="h-2 bg-cream rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${trips.length >= MAX_FREE_TRIPS ? "bg-red-400" : "bg-forest"}`}
                style={{ width: `${Math.min(100, (trips.length / MAX_FREE_TRIPS) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setActiveFilter(null)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${!activeFilter ? "bg-forest text-white" : "bg-white border border-cream-dark text-night/60 hover:bg-cream"}`}
          >
            All ({trips.length})
          </button>
          {Object.entries(statusCounts).filter(([, count]) => count > 0).map(([status, count]) => (
            <button
              key={status}
              onClick={() => setActiveFilter(activeFilter === status ? null : status)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeFilter === status ? "bg-forest text-white" : "bg-white border border-cream-dark text-night/60 hover:bg-cream"}`}
            >
              {statusConfig[status]?.label} ({count})
            </button>
          ))}
        </div>

        {/* Trip Cards */}
        <div className="space-y-4">
          {filtered.map((trip) => {
            const sc = statusConfig[trip.status] || statusConfig.planning;
            return (
              <div key={trip.id} className="bg-white rounded-2xl overflow-hidden border border-cream-dark hover:shadow-md transition-all">
                <div className="flex flex-col sm:flex-row">
                  {/* Image */}
                  <div className="relative w-full sm:w-48 h-32 sm:h-auto flex-shrink-0">
                    {trip.coverImage ? (
                      <img src={trip.coverImage} alt={trip.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-cream flex items-center justify-center">
                        <Mountain className="w-10 h-10 text-night/10" />
                      </div>
                    )}
                    <span className={`absolute top-2 left-2 text-[10px] font-bold px-2.5 py-1 rounded-full ${sc.bg} ${sc.text}`}>
                      {sc.label.toUpperCase()}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-night text-base sm:text-lg">{trip.name}</h3>
                        <p className="text-xs text-night/40 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {trip.parks.map((p) => p.name).join(", ") || "Park"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => handleDelete(trip.id)}
                          className="p-2 rounded-lg bg-gray-50 text-night/30 hover:bg-red-50 hover:text-red-500 transition-all flex items-center gap-1 group"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="text-xs hidden group-hover:inline">Delete</span>
                        </button>
                        <Link
                          href={`/trip/${trip.slug}`}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-forest text-white text-sm font-medium hover:bg-forest-light transition-colors"
                        >
                          Open <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-3 text-sm text-night/50 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(trip.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} – {new Date(trip.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                      <span>{trip.duration} days</span>
                      <span>{trip.activities} activities</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
