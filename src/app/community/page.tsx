"use client";

import { useState } from "react";
import {
  Search, Heart, MessageCircle, Copy, ArrowUpDown, Filter,
  MapPin, Calendar, Users, Star, TrendingUp, Eye, ChevronRight,
  Crown, Flame, Clock, ThumbsUp,
} from "lucide-react";
import Link from "next/link";

interface CommunityTrip {
  id: string;
  title: string;
  author: string;
  authorAvatar: string;
  parks: { name: string; state: string; type: string }[];
  duration: number;
  groupSize: string;
  activities: string[];
  difficulty: string;
  votes: number;
  views: number;
  comments: number;
  copies: number;
  createdAt: string;
  description: string;
  coverImage: string;
  featured: boolean;
  tags: string[];
}

const communityTrips: CommunityTrip[] = [
  {
    id: "1",
    title: "Ultimate Yosemite Family Adventure",
    author: "SierraHiker92",
    authorAvatar: "🏔️",
    parks: [{ name: "Yosemite National Park", state: "California", type: "National Park" }],
    duration: 5,
    groupSize: "Family (2 adults, 2 kids)",
    activities: ["hiking", "sightseeing", "swimming", "camping"],
    difficulty: "Easy-Moderate",
    votes: 342,
    views: 4821,
    comments: 47,
    copies: 128,
    createdAt: "2025-06-15",
    description: "Perfect family trip to Yosemite — kid-friendly hikes, waterfalls, and stargazing. We did Half Dome views without the strenuous climb!",
    coverImage: "https://images.unsplash.com/photo-1562310503-a918c4c61e38?w=600&q=80",
    featured: true,
    tags: ["family-friendly", "waterfalls", "camping", "beginner"],
  },
  {
    id: "2",
    title: "Zion Canyoneering Expedition",
    author: "RedRockRanger",
    authorAvatar: "🧗",
    parks: [{ name: "Zion National Park", state: "Utah", type: "National Park" }],
    duration: 4,
    groupSize: "Group of 4",
    activities: ["hiking", "canyoneering", "sightseeing"],
    difficulty: "Hard",
    votes: 289,
    views: 3654,
    comments: 31,
    copies: 87,
    createdAt: "2025-07-22",
    description: "The Narrows, Angel's Landing, and a guided canyoneering day. Not for the faint of heart but absolutely worth it.",
    coverImage: "https://images.unsplash.com/photo-1535913989690-f90e1c2d4cfa?w=600&q=80",
    featured: false,
    tags: ["advanced", "canyoneering", "photography", "adventure"],
  },
  {
    id: "3",
    title: "Florida State Parks Road Trip",
    author: "SunshineTrails",
    authorAvatar: "🌴",
    parks: [
      { name: "Highlands Hammock State Park", state: "Florida", type: "State Park" },
      { name: "Myakka River State Park", state: "Florida", type: "State Park" },
      { name: "Everglades National Park", state: "Florida", type: "National Park" },
    ],
    duration: 7,
    groupSize: "Couple",
    activities: ["hiking", "kayaking", "wildlife watching", "camping", "biking"],
    difficulty: "Easy",
    votes: 198,
    views: 2891,
    comments: 23,
    copies: 64,
    createdAt: "2025-10-05",
    description: "A week-long road trip through Florida's best parks. Ancient oaks, gators, and the most incredible sunsets. Brought our bikes and kayaks!",
    coverImage: "https://images.unsplash.com/photo-1590517862150-888cd521cc90?w=600&q=80",
    featured: true,
    tags: ["road-trip", "wildlife", "kayaking", "beginner", "florida"],
  },
  {
    id: "4",
    title: "Glacier National Park Backpacking",
    author: "MontanaWild",
    authorAvatar: "🐻",
    parks: [{ name: "Glacier National Park", state: "Montana", type: "National Park" }],
    duration: 6,
    groupSize: "2 hikers",
    activities: ["hiking", "camping", "fishing", "wildlife watching"],
    difficulty: "Expert",
    votes: 456,
    views: 6102,
    comments: 62,
    copies: 201,
    createdAt: "2025-08-10",
    description: "6-day backcountry trek through Glacier's most remote trails. Grizzly encounters, pristine alpine lakes, and zero cell service. Pure wilderness.",
    coverImage: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&q=80",
    featured: false,
    tags: ["backcountry", "expert", "wilderness", "photography"],
  },
  {
    id: "5",
    title: "Grand Canyon Rim-to-Rim",
    author: "DesertWanderer",
    authorAvatar: "🌵",
    parks: [{ name: "Grand Canyon National Park", state: "Arizona", type: "National Park" }],
    duration: 3,
    groupSize: "Group of 6",
    activities: ["hiking", "camping", "sightseeing"],
    difficulty: "Hard",
    votes: 521,
    views: 7890,
    comments: 89,
    copies: 312,
    createdAt: "2025-05-20",
    description: "The classic rim-to-rim crossing. North Kaibab to South Kaibab with a night at Phantom Ranch. Life-changing experience.",
    coverImage: "https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?w=600&q=80",
    featured: true,
    tags: ["bucket-list", "challenging", "iconic", "desert"],
  },
  {
    id: "6",
    title: "Acadia Autumn Colors",
    author: "NewEnglandNomad",
    authorAvatar: "🍂",
    parks: [{ name: "Acadia National Park", state: "Maine", type: "National Park" }],
    duration: 4,
    groupSize: "Couple",
    activities: ["hiking", "biking", "kayaking", "sightseeing"],
    difficulty: "Moderate",
    votes: 267,
    views: 3450,
    comments: 35,
    copies: 95,
    createdAt: "2025-09-30",
    description: "Peak fall foliage in Acadia. Cadillac Mountain sunrise, carriage roads by bike, and lobster every night. The most magical time to visit.",
    coverImage: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80",
    featured: false,
    tags: ["fall-foliage", "romantic", "coastal", "food"],
  },
];

const difficultyColors: Record<string, string> = {
  "Easy": "bg-green-100 text-green-700",
  "Easy-Moderate": "bg-lime-100 text-lime-700",
  "Moderate": "bg-yellow-100 text-yellow-700",
  "Hard": "bg-orange-100 text-orange-700",
  "Expert": "bg-red-100 text-red-700",
};

type SortOption = "popular" | "newest" | "most-copied" | "trending";

export default function CommunityPage() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("popular");
  const [filterDifficulty, setFilterDifficulty] = useState<string | null>(null);
  const [voted, setVoted] = useState<Set<string>>(new Set());

  const handleVote = (tripId: string) => {
    setVoted((prev) => {
      const next = new Set(prev);
      if (next.has(tripId)) next.delete(tripId);
      else next.add(tripId);
      return next;
    });
  };

  const sorted = [...communityTrips]
    .filter((t) => {
      const matchesSearch = !search || t.title.toLowerCase().includes(search.toLowerCase())
        || t.description.toLowerCase().includes(search.toLowerCase())
        || t.parks.some((p) => p.name.toLowerCase().includes(search.toLowerCase()))
        || t.tags.some((tag) => tag.includes(search.toLowerCase()));
      const matchesDiff = !filterDifficulty || t.difficulty === filterDifficulty;
      return matchesSearch && matchesDiff;
    })
    .sort((a, b) => {
      switch (sort) {
        case "popular": return b.votes - a.votes;
        case "newest": return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "most-copied": return b.copies - a.copies;
        case "trending": return (b.votes / Math.max(1, b.views)) - (a.votes / Math.max(1, a.views));
        default: return 0;
      }
    });

  const featured = communityTrips.filter((t) => t.featured);

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <div className="bg-gradient-to-br from-forest via-forest-light to-trail py-10 sm:py-16">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
            Community Trips
          </h1>
          <p className="mt-2 text-sm sm:text-lg text-white/80 max-w-2xl mx-auto">
            Real trips from real adventurers. Vote on your favorites, copy them as starter templates, and make them your own.
          </p>
          {/* Search */}
          <div className="mt-6 max-w-xl mx-auto relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-night/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sunset shadow-lg placeholder:text-night/30"
              placeholder="Search trips, parks, or tags..."
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Featured Section */}
        {!search && !filterDifficulty && (
          <div className="mb-10">
            <h2 className="flex items-center gap-2 text-lg font-bold text-night mb-4">
              <Crown className="w-5 h-5 text-sunset" />
              Featured Trips
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featured.map((trip) => (
                <div key={trip.id} className="bg-white rounded-2xl overflow-hidden border border-cream-dark hover:shadow-lg transition-all group">
                  <div className="relative h-40">
                    <img src={trip.coverImage} alt={trip.title} className="w-full h-full object-cover" />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-sunset text-white text-[10px] font-bold flex items-center gap-1">
                      <Flame className="w-3 h-3" /> FEATURED
                    </div>
                    <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/50 backdrop-blur rounded-full px-2.5 py-1 text-white text-xs">
                      <ThumbsUp className="w-3 h-3" /> {trip.votes}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-night text-sm group-hover:text-forest transition-colors">{trip.title}</h3>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-night/40">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{trip.parks[0].state}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{trip.duration} days</span>
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${difficultyColors[trip.difficulty] || ""}`}>{trip.difficulty}</span>
                    </div>
                    <p className="text-xs text-night/50 mt-2 line-clamp-2">{trip.description}</p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                      <span className="text-xs text-night/40">by {trip.author} {trip.authorAvatar}</span>
                      <Link
                        href={`/community/${trip.id}`}
                        className="text-xs text-forest font-medium flex items-center gap-1 hover:underline"
                      >
                        Use as template <Copy className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sort & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <h2 className="text-lg font-bold text-night">
            All Trips <span className="text-night/40 font-normal text-sm">({sorted.length})</span>
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-white rounded-xl border border-cream-dark overflow-hidden">
              {([
                { value: "popular", label: "Popular", icon: <TrendingUp className="w-3.5 h-3.5" /> },
                { value: "newest", label: "Newest", icon: <Clock className="w-3.5 h-3.5" /> },
                { value: "most-copied", label: "Most Copied", icon: <Copy className="w-3.5 h-3.5" /> },
              ] as { value: SortOption; label: string; icon: React.ReactNode }[]).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSort(opt.value)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-all ${
                    sort === opt.value ? "bg-forest text-white" : "text-night/50 hover:bg-cream"
                  }`}
                >
                  {opt.icon}{opt.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              {["Easy", "Moderate", "Hard", "Expert"].map((d) => (
                <button
                  key={d}
                  onClick={() => setFilterDifficulty(filterDifficulty === d ? null : d)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    filterDifficulty === d ? difficultyColors[d] + " ring-2 ring-offset-1 ring-gray-300" : "bg-white border border-cream-dark text-night/50 hover:bg-cream"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Trip List */}
        <div className="space-y-4">
          {sorted.map((trip) => {
            const hasVoted = voted.has(trip.id);
            return (
              <div key={trip.id} className="bg-white rounded-2xl border border-cream-dark overflow-hidden hover:shadow-md transition-all">
                <div className="flex flex-col sm:flex-row">
                  {/* Vote Column */}
                  <div className="hidden sm:flex flex-col items-center justify-center p-4 bg-cream/50 min-w-[80px]">
                    <button
                      onClick={() => handleVote(trip.id)}
                      className={`p-2 rounded-xl transition-all ${hasVoted ? "bg-forest text-white" : "bg-white border border-cream-dark text-night/40 hover:border-forest hover:text-forest"}`}
                    >
                      <ThumbsUp className="w-5 h-5" />
                    </button>
                    <span className={`mt-1 text-sm font-bold ${hasVoted ? "text-forest" : "text-night/50"}`}>
                      {trip.votes + (hasVoted ? 1 : 0)}
                    </span>
                  </div>

                  {/* Image */}
                  <div className="sm:w-48 h-32 sm:h-auto flex-shrink-0">
                    <img src={trip.coverImage} alt={trip.title} className="w-full h-full object-cover" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link href={`/community/${trip.id}`} className="font-bold text-night text-base sm:text-lg hover:text-forest transition-colors">
                          {trip.title}
                        </Link>
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          {trip.parks.map((p) => (
                            <span key={p.name} className="text-xs text-night/40 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />{p.name}
                            </span>
                          ))}
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${difficultyColors[trip.difficulty] || ""}`}>
                        {trip.difficulty}
                      </span>
                    </div>

                    <p className="text-sm text-night/60 mt-2 line-clamp-2">{trip.description}</p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {trip.tags.map((tag) => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-cream text-night/50">#{tag}</span>
                      ))}
                    </div>

                    {/* Meta */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                      <div className="flex items-center gap-4 text-xs text-night/40">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{trip.duration} days</span>
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{trip.groupSize}</span>
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{trip.views.toLocaleString()}</span>
                        <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{trip.comments}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Mobile vote */}
                        <button
                          onClick={() => handleVote(trip.id)}
                          className={`sm:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            hasVoted ? "bg-forest text-white" : "bg-cream text-night/50"
                          }`}
                        >
                          <ThumbsUp className="w-3.5 h-3.5" /> {trip.votes + (hasVoted ? 1 : 0)}
                        </button>
                        <Link
                          href={`/community/${trip.id}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-forest text-white text-xs font-medium hover:bg-forest-light transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" /> Use Template
                        </Link>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-night/30">
                      by {trip.authorAvatar} {trip.author} · {new Date(trip.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {sorted.length === 0 && (
          <div className="text-center py-16">
            <Search className="w-12 h-12 text-night/15 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-night/50">No trips found</h3>
            <p className="text-sm text-night/30 mt-1">Try a different search or filter</p>
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 text-center bg-gradient-to-r from-forest/5 to-trail/5 rounded-2xl p-8 sm:p-12 border border-forest/10">
          <h2 className="text-xl sm:text-2xl font-bold text-night">Share Your Trip!</h2>
          <p className="text-sm text-night/60 mt-2 max-w-lg mx-auto">
            Had an amazing trip? Share your itinerary with the community. Help others discover the best routes, hidden gems, and must-do activities.
          </p>
          <Link
            href="/trip/new"
            className="inline-flex items-center gap-2 mt-5 px-6 py-3 rounded-xl bg-forest text-white font-medium hover:bg-forest-light transition-colors shadow-md"
          >
            Create & Share a Trip <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
