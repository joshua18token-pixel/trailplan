"use client";

import { use, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft, MapPin, Calendar, Mountain, TreePine, Star,
  ChevronRight, ThumbsUp, Users, Clock, ExternalLink,
  Globe, DollarSign, Navigation, Loader2,
} from "lucide-react";

interface ParkData {
  id: string;
  name: string;
  fullName: string;
  type: string;
  state: string;
  description: string;
  coordinates: { lat: number; lng: number };
  activities: string[];
  bestSeason: string;
  image?: string;
}

interface CommunityTrip {
  id: number;
  title: string;
  author_name: string;
  description: string;
  duration_days: number;
  difficulty: string;
  vote_count: number;
  tags: string[];
  cover_image: string;
}

const activityEmoji: Record<string, string> = {
  hiking: "🥾", biking: "🚴", fishing: "🎣", kayaking: "🛶", sightseeing: "📸",
  camping: "⛺", "wildlife watching": "🦌", "wildlife viewing": "🦌", "horseback riding": "🐴",
  "rock climbing": "🧗", climbing: "🧗", swimming: "🏊", snorkeling: "🤿",
  canoeing: "🛶", boating: "⛵", photography: "📷", rafting: "🚣",
  "tide pooling": "🦀", canyoneering: "🏔️",
};

const typeLabels: Record<string, string> = {
  national_park: "National Park",
  state_park: "State Park",
  national_forest: "National Forest",
  recreation_area: "Recreation Area",
  monument: "National Monument",
};

const typeBadgeColors: Record<string, string> = {
  national_park: "bg-forest/10 text-forest",
  state_park: "bg-lake/10 text-lake",
  national_forest: "bg-trail/10 text-trail",
  recreation_area: "bg-sunset/10 text-sunset",
  monument: "bg-gold/10 text-gold",
};

export default function ParkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [park, setPark] = useState<ParkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [communityTrips, setCommunityTrips] = useState<CommunityTrip[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "photos" | "discussion" | "trips">("overview");

  useEffect(() => {
    async function loadPark() {
      try {
        const res = await fetch(`/api/parks/search?q=${encodeURIComponent(id)}`);
        const data = await res.json();
        if (data.results?.length > 0) {
          setPark(data.results[0]);
        }
      } catch {}
      setLoading(false);
    }
    loadPark();

    // Load community trips (mock for now — will be from Supabase)
    setCommunityTrips([
      {
        id: 1,
        title: "Ultimate 7-Day Adventure",
        author_name: "TrailBlazer_Mike",
        description: "A week-long deep dive with the best trails, camping spots, and hidden gems.",
        duration_days: 7,
        difficulty: "Moderate",
        vote_count: 47,
        tags: ["multi-day", "camping", "photography"],
        cover_image: "",
      },
      {
        id: 2,
        title: "Weekend Family Trip",
        author_name: "OutdoorMom_Sarah",
        description: "Kid-friendly itinerary with easy trails, scenic drives, and great picnic spots.",
        duration_days: 3,
        difficulty: "Easy",
        vote_count: 32,
        tags: ["family", "easy", "scenic"],
        cover_image: "",
      },
      {
        id: 3,
        title: "Photography Tour",
        author_name: "NatureLens_Pro",
        description: "Hit all the best viewpoints at golden hour. Sunrise and sunset schedules included.",
        duration_days: 4,
        difficulty: "Easy",
        vote_count: 28,
        tags: ["photography", "scenic", "sunrise"],
        cover_image: "",
      },
      {
        id: 4,
        title: "Extreme Trails Challenge",
        author_name: "SummitSeeker",
        description: "The hardest trails and biggest elevation gains. Not for beginners!",
        duration_days: 5,
        difficulty: "Hard",
        vote_count: 19,
        tags: ["advanced", "climbing", "backcountry"],
        cover_image: "",
      },
    ]);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-forest" />
      </div>
    );
  }

  if (!park) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <Mountain className="w-16 h-16 text-night/10 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-night mb-2">Park Not Found</h1>
          <p className="text-night/50 mb-6">We couldn&apos;t find this park. Try searching for it.</p>
          <Link href="/explore" className="px-6 py-3 rounded-xl bg-forest text-white font-medium">
            Explore Parks
          </Link>
        </div>
      </div>
    );
  }

  const googleMapsUrl = `https://www.google.com/maps/@${park.coordinates.lat},${park.coordinates.lng},12z`;
  const officialSiteUrl = `https://www.google.com/search?q=${encodeURIComponent(park.fullName + " official site")}`;
  const isNational = park.type === "national_park";

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <div className="relative h-64 sm:h-80 lg:h-96 overflow-hidden bg-night">
        {park.image && park.image.trim() ? (
          <img 
            src={park.image} 
            alt={park.fullName} 
            className="w-full h-full object-cover opacity-80"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
        ) : null}
        <div className={`w-full h-full bg-gradient-to-br from-forest/80 to-night items-center justify-center ${park.image && park.image.trim() ? 'hidden' : 'flex'}`}>
          <Mountain className="w-24 h-24 text-white/20" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
          <div className="max-w-5xl mx-auto">
            <Link href="/explore" className="flex items-center gap-1.5 text-white/60 text-sm mb-3 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Explore
            </Link>
            <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full mb-2 ${typeBadgeColors[park.type] || "bg-white/20 text-white"}`}>
              {typeLabels[park.type] || park.type.replace(/_/g, " ")}
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">{park.fullName}</h1>
            <div className="flex items-center gap-4 mt-2 text-white/70 text-sm">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{park.state}</span>
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{park.bestSeason}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex-1 py-4 px-6 font-medium transition-colors ${activeTab === "overview" ? "text-forest border-b-2 border-forest bg-forest/5" : "text-night/40 hover:text-night/60"}`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("photos")}
              className={`flex-1 py-4 px-6 font-medium transition-colors ${activeTab === "photos" ? "text-forest border-b-2 border-forest bg-forest/5" : "text-night/40 hover:text-night/60"}`}
            >
              Photos
            </button>
            <button
              onClick={() => setActiveTab("discussion")}
              className={`flex-1 py-4 px-6 font-medium transition-colors ${activeTab === "discussion" ? "text-forest border-b-2 border-forest bg-forest/5" : "text-night/40 hover:text-night/60"}`}
            >
              Discussion
            </button>
            <button
              onClick={() => setActiveTab("trips")}
              className={`flex-1 py-4 px-6 font-medium transition-colors ${activeTab === "trips" ? "text-forest border-b-2 border-forest bg-forest/5" : "text-night/40 hover:text-night/60"}`}
            >
              Community Trips
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {activeTab === "overview" && (
              <>
            {/* Description */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-night mb-3">About the Park</h2>
              <p className="text-night/70 leading-relaxed">{park.description}</p>
              <div className="flex items-center gap-3 mt-4">
                <a href={officialSiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-forest hover:underline">
                  <Globe className="w-4 h-4" /> Official Website <ExternalLink className="w-3 h-3" />
                </a>
                <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-lake hover:underline">
                  <Navigation className="w-4 h-4" /> View on Maps <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Activities */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-night mb-4">Activities</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {park.activities.map((activity) => (
                  <div key={activity} className="flex items-center gap-3 p-3 rounded-xl bg-cream hover:bg-cream-dark transition-colors">
                    <span className="text-2xl">{activityEmoji[activity] || "🏞️"}</span>
                    <span className="font-medium text-night capitalize">{activity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Entry Fees Quick Info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-night mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-sunset" /> Entry Fees
              </h2>
              {isNational ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-cream">
                    <span className="text-sm text-night/70">Vehicle (7-day pass)</span>
                    <span className="font-bold text-night">$30 – $35</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-cream">
                    <span className="text-sm text-night/70">Per person (walk-in)</span>
                    <span className="font-bold text-night">$15 – $20</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-cream">
                    <span className="text-sm text-night/70">Children under 16</span>
                    <span className="font-bold text-forest">Free</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-forest/5">
                    <span className="text-sm text-forest font-medium">America the Beautiful Pass</span>
                    <span className="font-bold text-forest">$80/year</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-cream">
                    <span className="text-sm text-night/70">Vehicle entry</span>
                    <span className="font-bold text-night">$4 – $6</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-cream">
                    <span className="text-sm text-night/70">Pedestrian / Cyclist</span>
                    <span className="font-bold text-night">$2 – $4</span>
                  </div>
                  <p className="text-xs text-night/40">Fees vary by park. Check the official website for exact pricing.</p>
                </div>
              )}
            </div>

              </>
            )}

            {/* Photos Tab */}
            {activeTab === "photos" && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-night">Photo Gallery</h2>
                  <button className="px-4 py-2 rounded-lg bg-forest text-white text-sm font-medium hover:bg-forest-light transition-colors">
                    + Add Photos
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                    <div key={i} className="aspect-square rounded-xl bg-cream hover:opacity-80 transition-opacity cursor-pointer overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-br from-forest/20 to-lake/20 flex items-center justify-center text-night/20 text-xs font-medium">
                        Photo {i}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-center text-night/40 text-sm mt-6">Mock photos - upload feature coming soon</p>
              </div>
            )}

            {/* Discussion Tab */}
            {activeTab === "discussion" && (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-night mb-4">Start a Discussion</h2>
                  <textarea 
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-forest resize-none"
                    rows={3}
                    placeholder="Share your experience, ask questions, or give tips..."
                  />
                  <button className="mt-3 px-6 py-2 rounded-lg bg-forest text-white font-medium hover:bg-forest-light transition-colors">
                    Post
                  </button>
                </div>

                {/* Mock Discussion Posts */}
                {[
                  { author: "TrailBlazer_Mike", time: "2 hours ago", pinned: true, text: "Pro tip: Start the Half Dome hike before sunrise to beat the crowds and catch amazing golden hour photos at the cables!" },
                  { author: "OutdoorMom_Sarah", time: "1 day ago", pinned: false, text: "Just got back from a 4-day trip with my family. The Valley View trail is perfect for kids! Minimal elevation gain and stunning views." },
                  { author: "NatureLens_Pro", time: "3 days ago", pinned: false, text: "Anyone know if the Tuolumne Meadows road is open yet? Planning to visit next week." },
                ].map((post, i) => (
                  <div key={i} className={`bg-white rounded-2xl p-6 shadow-sm ${post.pinned ? "border-2 border-sunset" : ""}`}>
                    {post.pinned && (
                      <div className="flex items-center gap-1.5 text-sunset text-xs font-bold mb-2">
                        <span className="text-lg">📌</span> PINNED BY MODERATOR
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-forest/10 flex items-center justify-center text-forest font-bold flex-shrink-0">
                        {post.author[0]}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-night">{post.author}</span>
                          <span className="text-xs text-night/40">{post.time}</span>
                        </div>
                        <p className="text-night/70 mt-2">{post.text}</p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-night/40">
                          <button className="hover:text-forest transition-colors">👍 12</button>
                          <button className="hover:text-forest transition-colors">Reply</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Community Trips Tab */}
            {activeTab === "trips" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-night flex items-center gap-2">
                    <Users className="w-5 h-5 text-sunset" /> Community Trips
                  </h2>
                  <Link href="/community" className="text-sm text-forest hover:underline">View all →</Link>
                </div>
                <div className="space-y-3">
                  {communityTrips.sort((a, b) => b.vote_count - a.vote_count).map((trip, i) => (
                    <div key={trip.id} className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all border border-cream-dark">
                      <div className="flex items-start gap-4">
                        {/* Rank + Votes */}
                        <div className="flex flex-col items-center gap-1 min-w-[48px]">
                          <span className="text-xs font-bold text-night/30">#{i + 1}</span>
                          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-forest/10 text-forest">
                            <ThumbsUp className="w-3 h-3" />
                            <span className="text-xs font-bold">{trip.vote_count}</span>
                          </div>
                        </div>
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-night text-sm sm:text-base">{trip.title}</h3>
                          <p className="text-xs text-night/40 mt-0.5">by {trip.author_name} · {trip.duration_days} days · {trip.difficulty}</p>
                          <p className="text-sm text-night/60 mt-1.5 line-clamp-2">{trip.description}</p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            {trip.tags.map((tag) => (
                              <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-cream text-night/50">#{tag}</span>
                            ))}
                          </div>
                        </div>
                        {/* Action */}
                        <Link
                          href={`/community/${trip.id}`}
                          className="flex items-center gap-1 px-3 py-2 rounded-lg bg-cream text-night/50 hover:bg-forest/10 hover:text-forest transition-colors text-xs font-medium flex-shrink-0"
                        >
                          View <ChevronRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Plan Your Trip CTA */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-forest/20">
              <h3 className="font-bold text-night text-lg mb-2">Plan Your Trip</h3>
              <p className="text-sm text-night/50 mb-4">Create a personalized itinerary for {park.fullName} in minutes.</p>
              <Link
                href={`/trip/new?park=${park.id}`}
                className="block w-full py-3.5 rounded-xl bg-forest text-white text-center font-semibold text-base hover:bg-forest-light transition-colors shadow-lg shadow-forest/20"
              >
                🗺️ Start Planning
              </Link>
              <p className="text-xs text-night/30 text-center mt-3">Free · No account needed</p>
            </div>

            {/* Quick Facts */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-night mb-4">Quick Facts</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-forest flex-shrink-0" />
                  <div>
                    <p className="text-xs text-night/40">Location</p>
                    <p className="text-sm font-medium text-night">{park.state}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-sunset flex-shrink-0" />
                  <div>
                    <p className="text-xs text-night/40">Best Season</p>
                    <p className="text-sm font-medium text-night">{park.bestSeason}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <TreePine className="w-4 h-4 text-trail flex-shrink-0" />
                  <div>
                    <p className="text-xs text-night/40">Activities</p>
                    <p className="text-sm font-medium text-night">{park.activities.length} available</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Star className="w-4 h-4 text-gold flex-shrink-0" />
                  <div>
                    <p className="text-xs text-night/40">Type</p>
                    <p className="text-sm font-medium text-night">{typeLabels[park.type] || park.type}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Coordinates / Map Link */}
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all border border-cream-dark group"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-lake/10 flex items-center justify-center group-hover:bg-lake/20 transition-colors">
                  <Navigation className="w-6 h-6 text-lake" />
                </div>
                <div>
                  <p className="text-sm font-medium text-night group-hover:text-lake transition-colors">View on Google Maps</p>
                  <p className="text-xs text-night/40">{park.coordinates.lat.toFixed(4)}°N, {Math.abs(park.coordinates.lng).toFixed(4)}°W</p>
                </div>
                <ExternalLink className="w-4 h-4 text-night/20 ml-auto group-hover:text-lake transition-colors" />
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
