"use client";

import { useState, useEffect, useRef } from "react";
import {
  Search, MapPin, Loader2, Sparkles, Mountain, TreePine,
  Landmark, Trees, ChevronRight, Globe, Star,
} from "lucide-react";

interface ParkResult {
  id: string;
  name: string;
  fullName: string;
  type: string;
  state: string;
  description: string;
  coordinates: { lat: number; lng: number };
  image?: string;
  website?: string;
  activities: string[];
  bestSeason: string;
  addedBy: string;
}

interface SearchResponse {
  results: ParkResult[];
  source: string;
  total: number;
  message?: string;
}

const typeIcons: Record<string, React.ReactNode> = {
  national_park: <Mountain className="w-4 h-4 text-forest" />,
  state_park: <TreePine className="w-4 h-4 text-green-600" />,
  national_forest: <Trees className="w-4 h-4 text-emerald-600" />,
  monument: <Landmark className="w-4 h-4 text-amber-600" />,
  recreation_area: <Globe className="w-4 h-4 text-lake" />,
  other: <MapPin className="w-4 h-4 text-night/50" />,
};

const typeLabels: Record<string, string> = {
  national_park: "National Park",
  state_park: "State Park",
  national_forest: "National Forest",
  monument: "Monument",
  recreation_area: "Recreation Area",
  other: "Outdoor Area",
};

interface ParkSearchProps {
  onSelect?: (park: ParkResult) => void;
  placeholder?: string;
  className?: string;
  showResults?: boolean; // auto-show results below
}

export default function ParkSearch({ onSelect, placeholder, className, showResults = true }: ParkSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ParkResult[]>([]);
  const [source, setSource] = useState<string>("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const doSearch = async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setSource("");
      setMessage("");
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(`/api/parks/search?q=${encodeURIComponent(q)}`);
      const data: SearchResponse = await res.json();
      setResults(data.results);
      setSource(data.source);
      setMessage(data.message || "");
      setShowDropdown(true);
    } catch {
      setResults([]);
      setMessage("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.length >= 2) {
      debounceRef.current = setTimeout(() => doSearch(value), 400);
    } else {
      setResults([]);
      setShowDropdown(false);
      setHasSearched(false);
    }
  };

  const handleSelect = (park: ParkResult) => {
    setQuery(park.fullName);
    setShowDropdown(false);
    onSelect?.(park);
  };

  return (
    <div ref={wrapperRef} className={`relative ${className || ""}`}>
      <div className="relative">
        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-night/30" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => { if (results.length > 0) setShowDropdown(true); }}
          className="w-full pl-12 pr-12 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl border-2 border-cream-dark bg-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-forest focus:border-forest shadow-lg transition-all placeholder:text-night/30"
          placeholder={placeholder || "Search parks, trails, or destinations..."}
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <Loader2 className="w-5 h-5 text-forest animate-spin" />
          </div>
        )}
      </div>

      {/* Dropdown Results */}
      {showResults && showDropdown && hasSearched && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-cream-dark overflow-hidden z-50 max-h-[70vh] overflow-y-auto">
          {/* AI Discovery Banner */}
          {source === "ai_discovery" && (
            <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-purple-100">
              <div className="flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span className="font-medium text-purple-700">AI Discovery</span>
              </div>
              <p className="text-xs text-purple-600 mt-0.5">{message}</p>
            </div>
          )}

          {/* Results */}
          {results.map((park) => (
            <button
              key={park.id}
              onClick={() => handleSelect(park)}
              className="w-full text-left px-4 py-3 hover:bg-cream transition-colors border-b border-gray-50 last:border-0"
            >
              <div className="flex items-start gap-3">
                {park.image ? (
                  <img
                    src={park.image}
                    alt={park.name}
                    className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-forest/10 flex items-center justify-center flex-shrink-0">
                    {typeIcons[park.type] || typeIcons.other}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-night text-sm truncate">{park.fullName}</span>
                    {park.addedBy === "ai_discovery" && (
                      <span className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-600 flex-shrink-0">
                        <Sparkles className="w-2.5 h-2.5" />
                        NEW
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      park.type === "national_park" ? "bg-forest/10 text-forest"
                      : park.type === "state_park" ? "bg-green-100 text-green-700"
                      : "bg-blue-100 text-blue-700"
                    }`}>
                      {typeLabels[park.type] || park.type}
                    </span>
                    <span className="text-xs text-night/40 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />{park.state}
                    </span>
                  </div>
                  <p className="text-xs text-night/50 mt-1 line-clamp-2">{park.description}</p>
                  {park.activities.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {park.activities.slice(0, 5).map((a) => (
                        <span key={a} className="text-[10px] px-1.5 py-0.5 rounded bg-cream-dark text-night/50">{a}</span>
                      ))}
                    </div>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-night/20 flex-shrink-0 mt-1" />
              </div>
            </button>
          ))}

          {/* No results */}
          {results.length === 0 && !loading && (
            <div className="px-4 py-8 text-center">
              <Search className="w-8 h-8 text-night/20 mx-auto mb-2" />
              <p className="text-sm text-night/50">{message || "No parks found"}</p>
              <p className="text-xs text-night/30 mt-1">Try a different search — our AI will discover new parks!</p>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="px-4 py-6 text-center">
              <Loader2 className="w-6 h-6 text-forest animate-spin mx-auto mb-2" />
              <p className="text-sm text-night/50">Searching parks database...</p>
              <p className="text-xs text-night/30 mt-0.5">If not found, AI will discover it for you ✨</p>
            </div>
          )}

          {/* Footer */}
          <div className="px-4 py-2 bg-gray-50 text-center">
            <p className="text-[10px] text-night/30">
              Powered by TrailPlan AI · {source === "database" ? "From our database" : source === "ai_discovery" ? "Discovered by AI" : ""}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
