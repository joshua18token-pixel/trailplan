"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Search, MapPin, Calendar, Mountain, TreePine, ChevronRight } from "lucide-react";
import ActivityCard from "@/components/ActivityCard";
import FilterChip from "@/components/FilterChip";
import { activities, type ActivityType, type Difficulty } from "@/data/mockData";

interface ParkInfo {
  id: string;
  name: string;
  fullName: string;
  type: string;
  state: string;
  description: string;
  activities: string[];
  bestSeason: string;
  image?: string;
}

const typeLabels: Record<string, string> = {
  national_park: "National Park",
  state_park: "State Park",
  national_forest: "National Forest",
};

const activityFilters: { id: ActivityType; label: string; emoji: string }[] = [
  { id: "hiking", label: "Hiking", emoji: "🥾" },
  { id: "biking", label: "Biking", emoji: "🚴" },
  { id: "fishing", label: "Fishing", emoji: "🎣" },
  { id: "kayaking", label: "Kayaking", emoji: "🛶" },
  { id: "sightseeing", label: "Sightseeing", emoji: "📸" },
];

const difficultyFilters: { id: Difficulty; label: string }[] = [
  { id: "easy", label: "Easy" },
  { id: "moderate", label: "Moderate" },
  { id: "hard", label: "Hard" },
  { id: "expert", label: "Expert" },
];

export default function ExplorePage() {
  const [parks, setParks] = useState<ParkInfo[]>([]);
  const [search, setSearch] = useState("");
  const [activeTypes, setActiveTypes] = useState<ActivityType[]>([]);
  const [activeDifficulties, setActiveDifficulties] = useState<Difficulty[]>([]);

  useEffect(() => {
    fetch("/api/parks/search?q=").then(r => r.json()).then(d => setParks(d.results || [])).catch(() => {});
  }, []);
  const [dogFriendly, setDogFriendly] = useState(false);

  const toggleType = (t: ActivityType) =>
    setActiveTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const toggleDifficulty = (d: Difficulty) =>
    setActiveDifficulties((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));

  const filtered = useMemo(() => {
    return activities.filter((a) => {
      if (search && !a.name.toLowerCase().includes(search.toLowerCase()) && !a.description.toLowerCase().includes(search.toLowerCase())) return false;
      if (activeTypes.length > 0 && !activeTypes.includes(a.type)) return false;
      if (activeDifficulties.length > 0 && !activeDifficulties.includes(a.difficulty)) return false;
      if (dogFriendly && !a.dogFriendly) return false;
      return true;
    });
  }, [search, activeTypes, activeDifficulties, dogFriendly]);

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-white border-b border-cream-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-night mb-2">Explore Activities</h1>
          <p className="text-night/60 text-lg mb-6">Discover trails, water sports, and scenic spots across America&apos;s national parks</p>
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-night/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search activities, parks..."
              className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-cream-dark focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest bg-cream"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters */}
        <div className="space-y-3 mb-8">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-night/50 self-center mr-1">Activity:</span>
            {activityFilters.map((f) => (
              <FilterChip
                key={f.id}
                label={f.label}
                emoji={f.emoji}
                active={activeTypes.includes(f.id)}
                onClick={() => toggleType(f.id)}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-night/50 self-center mr-1">Difficulty:</span>
            {difficultyFilters.map((f) => (
              <FilterChip
                key={f.id}
                label={f.label}
                active={activeDifficulties.includes(f.id)}
                onClick={() => toggleDifficulty(f.id)}
              />
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <FilterChip label="Dog-Friendly" emoji="🐕" active={dogFriendly} onClick={() => setDogFriendly(!dogFriendly)} />
          </div>
        </div>

        {/* Parks Section */}
        {parks.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold text-night mb-4 flex items-center gap-2">
              <Mountain className="w-5 h-5 text-forest" /> Parks
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {parks.map((park) => (
                <Link key={park.id} href={`/parks/${park.id}`} className="group block">
                  <div className="relative overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
                    <div className="relative h-40 overflow-hidden">
                      {park.image && park.image.trim() ? (
                        <img 
                          src={park.image} 
                          alt={park.fullName} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const fallback = target.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`w-full h-full bg-gradient-to-br from-forest/60 to-forest/20 items-center justify-center ${park.image && park.image.trim() ? 'hidden' : 'flex'}`}>
                        <Mountain className="w-12 h-12 text-white/30" />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                        <h3 className="font-bold text-white text-sm">{park.fullName}</h3>
                        <p className="text-white/70 text-xs flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {park.state}
                        </p>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-night/60 line-clamp-2">{park.description}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs font-medium text-forest">{park.activities.length} activities</span>
                        <span className="text-xs font-medium text-sunset group-hover:text-sunset-light flex items-center gap-1">
                          Explore <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Activities Results */}
        <h2 className="text-xl font-bold text-night mb-4 flex items-center gap-2">
          <TreePine className="w-5 h-5 text-trail" /> Activities
        </h2>
        <p className="text-sm text-night/50 mb-4">{filtered.length} activities found</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-20 text-night/40">
            <p className="text-lg font-medium">No activities match your filters</p>
            <p className="text-sm mt-1">Try adjusting your search or removing some filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
