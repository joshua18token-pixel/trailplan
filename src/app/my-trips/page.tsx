"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  MapPin, Calendar, Plus, Trash2, Edit3, Share2, Lock,
  ChevronRight, Mountain, Clock, Users, Star, Plane, Car,
  Eye, EyeOff, Crown, Search,
} from "lucide-react";

interface SavedTrip {
  id: string;
  slug: string;
  name: string;
  customName?: string;
  parks: { name: string; state: string; type: string }[];
  startDate: string;
  endDate: string;
  duration: number;
  status: "planning" | "upcoming" | "completed" | "draft";
  shared: boolean;
  travelFrom?: { location: string; mode: "fly" | "drive" | "bus" | "train"; notes?: string };
  travelTo?: { location: string; mode: "fly" | "drive" | "bus" | "train"; notes?: string };
  createdAt: string;
  activities: number;
  difficulty: string;
  coverImage?: string;
  fromTemplate?: string;
}

// Mock saved trips
const mockTrips: SavedTrip[] = [
  {
    id: "1",
    slug: "yosemite-adventure",
    name: "Yosemite Adventure — 5 Days",
    parks: [{ name: "Yosemite National Park", state: "California", type: "National Park" }],
    startDate: "2025-07-14",
    endDate: "2025-07-18",
    duration: 5,
    status: "upcoming",
    shared: true,
    travelFrom: { location: "San Francisco, CA", mode: "drive", notes: "~3.5 hours via I-580" },
    createdAt: "2025-06-01",
    activities: 8,
    difficulty: "Moderate",
    coverImage: "https://images.unsplash.com/photo-1562310503-a918c4c61e38?w=400&q=80",
  },
  {
    id: "2",
    slug: "highlands-hammock-adventure",
    name: "Highlands Hammock Adventure — 3 Days",
    customName: "Florida Weekend Getaway",
    parks: [
      { name: "Highlands Hammock State Park", state: "Florida", type: "State Park" },
    ],
    startDate: "2025-10-10",
    endDate: "2025-10-12",
    duration: 3,
    status: "planning",
    shared: false,
    travelFrom: { location: "Sebring, FL", mode: "drive", notes: "15 minutes" },
    createdAt: "2025-09-15",
    activities: 5,
    difficulty: "Easy",
    fromTemplate: "Florida State Parks Road Trip",
  },
  {
    id: "3",
    slug: "grand-canyon-rim-to-rim",
    name: "Grand Canyon Rim-to-Rim — 3 Days",
    parks: [{ name: "Grand Canyon National Park", state: "Arizona", type: "National Park" }],
    startDate: "2025-04-20",
    endDate: "2025-04-22",
    duration: 3,
    status: "completed",
    shared: true,
    travelFrom: { location: "Phoenix, AZ", mode: "drive", notes: "4 hours to South Rim" },
    createdAt: "2025-03-01",
    activities: 6,
    difficulty: "Hard",
    coverImage: "https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?w=400&q=80",
  },
];

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  planning: { bg: "bg-blue-100", text: "text-blue-700", label: "Planning" },
  upcoming: { bg: "bg-green-100", text: "text-green-700", label: "Upcoming" },
  completed: { bg: "bg-gray-100", text: "text-gray-600", label: "Completed" },
  draft: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Draft" },
};

const travelModeIcons: Record<string, React.ReactNode> = {
  fly: <Plane className="w-3.5 h-3.5" />,
  drive: <Car className="w-3.5 h-3.5" />,
  bus: <Car className="w-3.5 h-3.5" />,
  train: <Car className="w-3.5 h-3.5" />,
};

const MAX_FREE_TRIPS = 5;

export default function MyTripsPage() {
  const [trips, setTrips] = useState<SavedTrip[]>(mockTrips);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [showTravelEditor, setShowTravelEditor] = useState<string | null>(null);
  const [isLoggedIn] = useState(true); // Prototype: assume logged in

  // Load any trips from localStorage (generated trips)
  useEffect(() => {
    try {
      const keys = Object.keys(localStorage).filter((k) => k.startsWith("trailplan-trip-"));
      for (const key of keys) {
        const slug = key.replace("trailplan-trip-", "");
        if (!trips.find((t) => t.slug === slug) && slug !== "yosemite-adventure") {
          const data = JSON.parse(localStorage.getItem(key) || "{}");
          if (data.name) {
            setTrips((prev) => [...prev, {
              id: slug,
              slug,
              name: data.name,
              parks: data.parks?.map((p: any) => ({ name: p.fullName || p.name, state: p.state, type: p.type })) || [],
              startDate: data.settings?.startDate || "2025-07-14",
              endDate: data.settings?.endDate || "2025-07-18",
              duration: data.days?.length || 5,
              status: "planning" as const,
              shared: false,
              createdAt: data.createdAt || new Date().toISOString(),
              activities: data.days?.reduce((sum: number, d: any) => sum + (d.slots?.length || 0), 0) || 0,
              difficulty: data.settings?.fitness || "Moderate",
            }]);
          }
        }
      }
    } catch {}
  }, []);

  const filtered = trips.filter((t) => !activeFilter || t.status === activeFilter);
  const tripsUsed = trips.length;
  const canCreateMore = tripsUsed < MAX_FREE_TRIPS;

  const handleRename = (tripId: string) => {
    setTrips((prev) => prev.map((t) =>
      t.id === tripId ? { ...t, customName: nameInput || undefined } : t
    ));
    setEditingName(null);
  };

  const handleToggleShare = (tripId: string) => {
    setTrips((prev) => prev.map((t) =>
      t.id === tripId ? { ...t, shared: !t.shared } : t
    ));
  };

  const handleDelete = (tripId: string) => {
    if (confirm("Delete this trip? This can't be undone.")) {
      setTrips((prev) => prev.filter((t) => t.id !== tripId));
    }
  };

  const formatDate = (d: string) => new Date(d + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const formatDateRange = (start: string, end: string) => {
    const s = new Date(start + "T12:00:00");
    const e = new Date(end + "T12:00:00");
    const sameMonth = s.getMonth() === e.getMonth();
    if (sameMonth) {
      return `${s.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${e.getDate()}, ${e.getFullYear()}`;
    }
    return `${s.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${e.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
  };

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-night">My Trips</h1>
            <p className="text-sm text-night/50 mt-1">
              {tripsUsed} of {MAX_FREE_TRIPS} free trips used
              {!canCreateMore && (
                <span className="ml-2 text-sunset font-medium">
                  <Crown className="w-3.5 h-3.5 inline" /> Upgrade to Pro for unlimited trips
                </span>
              )}
            </p>
          </div>
          <Link
            href="/trip/new"
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all shadow-md ${
              canCreateMore
                ? "bg-forest text-white hover:bg-forest-light"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
          >
            <Plus className="w-4 h-4" />
            New Trip
          </Link>
        </div>

        {/* Usage Bar */}
        <div className="mb-6 p-4 rounded-2xl bg-white border border-cream-dark">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-night/50">Trip Slots</span>
            <span className="text-xs text-night/40">{tripsUsed}/{MAX_FREE_TRIPS} free</span>
          </div>
          <div className="h-2 rounded-full bg-cream-dark overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${tripsUsed >= MAX_FREE_TRIPS ? "bg-sunset" : "bg-forest"}`}
              style={{ width: `${Math.min(100, (tripsUsed / MAX_FREE_TRIPS) * 100)}%` }}
            />
          </div>
          {tripsUsed >= MAX_FREE_TRIPS - 1 && (
            <p className="text-xs text-sunset mt-2 flex items-center gap-1">
              <Crown className="w-3.5 h-3.5" />
              Upgrade to Pro ($20/yr) for unlimited trips, ad-free, and offline access
            </p>
          )}
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setActiveFilter(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              !activeFilter ? "bg-forest text-white" : "bg-white border border-cream-dark text-night/50 hover:bg-cream"
            }`}
          >
            All ({trips.length})
          </button>
          {Object.entries(statusColors).map(([key, val]) => {
            const count = trips.filter((t) => t.status === key).length;
            if (count === 0) return null;
            return (
              <button
                key={key}
                onClick={() => setActiveFilter(activeFilter === key ? null : key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeFilter === key ? `${val.bg} ${val.text}` : "bg-white border border-cream-dark text-night/50 hover:bg-cream"
                }`}
              >
                {val.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Trip List */}
        <div className="space-y-4">
          {filtered.map((trip) => {
            const displayName = trip.customName || trip.name;
            const status = statusColors[trip.status];
            const isEditing = editingName === trip.id;

            return (
              <div key={trip.id} className="bg-white rounded-2xl border border-cream-dark overflow-hidden hover:shadow-md transition-all">
                <div className="flex flex-col sm:flex-row">
                  {/* Cover Image or Color Block */}
                  <div className="sm:w-48 h-32 sm:h-auto flex-shrink-0 relative">
                    {trip.coverImage ? (
                      <img src={trip.coverImage} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-forest/20 to-trail/20 flex items-center justify-center">
                        <Mountain className="w-10 h-10 text-forest/30" />
                      </div>
                    )}
                    <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold ${status.bg} ${status.text}`}>
                      {status.label.toUpperCase()}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {/* Name — editable */}
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={nameInput}
                              onChange={(e) => setNameInput(e.target.value)}
                              onKeyDown={(e) => { if (e.key === "Enter") handleRename(trip.id); if (e.key === "Escape") setEditingName(null); }}
                              className="flex-1 px-3 py-1.5 rounded-lg border border-forest text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                              placeholder={trip.name}
                              autoFocus
                            />
                            <button onClick={() => handleRename(trip.id)} className="px-3 py-1.5 rounded-lg bg-forest text-white text-xs font-medium">Save</button>
                            <button onClick={() => setEditingName(null)} className="text-xs text-night/40">Cancel</button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 group">
                            <Link href={`/trip/${trip.slug}`} className="font-bold text-night text-base sm:text-lg hover:text-forest transition-colors truncate">
                              {displayName}
                            </Link>
                            <button
                              onClick={() => { setEditingName(trip.id); setNameInput(trip.customName || ""); }}
                              className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-cream transition-all"
                              title="Rename trip"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-night/30" />
                            </button>
                          </div>
                        )}

                        {/* Parks */}
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {trip.parks.map((p) => (
                            <span key={p.name} className="text-xs text-night/40 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />{p.name}
                            </span>
                          ))}
                        </div>

                        {/* Dates — prominent */}
                        <div className="flex items-center gap-4 mt-2.5 text-sm">
                          <span className="flex items-center gap-1.5 font-medium text-night">
                            <Calendar className="w-4 h-4 text-forest" />
                            {formatDateRange(trip.startDate, trip.endDate)}
                          </span>
                          <span className="text-night/40">·</span>
                          <span className="text-night/50">{trip.duration} days</span>
                          <span className="text-night/40">·</span>
                          <span className="text-night/50">{trip.activities} activities</span>
                        </div>

                        {/* Travel info */}
                        {trip.travelFrom && (
                          <div className="flex items-center gap-2 mt-2 text-xs text-night/40">
                            {travelModeIcons[trip.travelFrom.mode]}
                            <span>From: {trip.travelFrom.location}</span>
                            {trip.travelFrom.notes && <span className="text-night/25">({trip.travelFrom.notes})</span>}
                            <Lock className="w-3 h-3 text-night/20" />
                          </div>
                        )}

                        {trip.fromTemplate && (
                          <span className="inline-flex items-center gap-1 mt-2 text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-500">
                            <Star className="w-2.5 h-2.5" /> From template: {trip.fromTemplate}
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => handleToggleShare(trip.id)}
                          className={`p-2 rounded-lg transition-all ${trip.shared ? "bg-forest/10 text-forest" : "bg-gray-50 text-night/30 hover:bg-gray-100"}`}
                          title={trip.shared ? "Shared publicly" : "Private"}
                        >
                          {trip.shared ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDelete(trip.id)}
                          className="p-2 rounded-lg bg-gray-50 text-night/30 hover:bg-red-50 hover:text-red-500 transition-all"
                          title="Delete trip"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <Link
                          href={`/trip/${trip.slug}`}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-forest text-white text-xs font-medium hover:bg-forest-light transition-colors"
                        >
                          Open <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-cream-dark">
            <Mountain className="w-12 h-12 text-night/15 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-night/50">No trips yet</h3>
            <p className="text-sm text-night/30 mt-1">Create your first trip or copy one from the community!</p>
            <div className="flex items-center justify-center gap-3 mt-5">
              <Link href="/trip/new" className="px-5 py-2.5 rounded-xl bg-forest text-white text-sm font-medium hover:bg-forest-light transition-colors">
                Create Trip
              </Link>
              <Link href="/community" className="px-5 py-2.5 rounded-xl border border-cream-dark text-sm font-medium text-night/60 hover:bg-cream transition-colors">
                Browse Community
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
