"use client";

import { useState, useRef, useEffect, use } from "react";
import {
  MapPin, Edit3, Share2, Plus, GripVertical, Clock, TrendingUp,
  Ruler, Star, ChevronDown, ChevronUp, Map, Shield, DollarSign, Bed,
  Car, Utensils, Coffee, Sun, Moon, Sunrise, Sandwich, Flame, ShoppingCart, TreePine,
  LogOut, LogIn, Navigation, X, Check, Search, Hotel, Tent, Home, Building,
  ExternalLink, Loader2, AlertTriangle, StickyNote, Compass, Trash2,
} from "lucide-react";
import Link from "next/link";
import { useDirections, googleMapsDirectionsUrl } from "@/hooks/useDirections";
import DifficultyBadge from "@/components/DifficultyBadge";
import MealEditor from "@/components/MealEditor";
import AddEventModal from "@/components/AddEventModal";
import ActivitySwapModal from "@/components/ActivitySwapModal";
import dynamic from "next/dynamic";
import { SaveTripBanner, AuthModal, AffiliateAdBanner } from "@/components/SaveTripBanner";

const ItineraryMap = dynamic(() => import("@/components/ItineraryMap"), { ssr: false });
import {
  itineraries, getActivityById, getParkById, activityTypeEmoji,
  type Itinerary, type ItineraryDay, type ItinerarySlot, type TravelSegment, type MealStop, type MealStyle,
} from "@/data/mockData";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, useSortable, verticalListSortingStrategy, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// --- Lodging options database ---
interface LodgingOption {
  id: string;
  name: string;
  type: "campground" | "cabin" | "hotel" | "lodge" | "glamping" | "rv";
  location: string;
  priceRange: string;
  rating: number;
  description: string;
  checkInTime: string;
  checkOutTime: string;
}

const lodgingOptions: LodgingOption[] = [
  { id: "curry-village", name: "Curry Village — Half Dome Village Tent Cabin", type: "cabin", location: "Yosemite Valley", priceRange: "$100-150/night", rating: 4.2, description: "Canvas tent cabins near the base of Glacier Point. Shared bathrooms.", checkInTime: "4:00 PM", checkOutTime: "10:00 AM" },
  { id: "ahwahnee", name: "The Ahwahnee Hotel", type: "hotel", location: "Yosemite Valley", priceRange: "$400-600/night", rating: 4.7, description: "Iconic luxury hotel with stunning views of Half Dome and Yosemite Falls.", checkInTime: "3:00 PM", checkOutTime: "11:00 AM" },
  { id: "valley-lodge", name: "Yosemite Valley Lodge", type: "lodge", location: "Yosemite Valley", priceRange: "$200-350/night", rating: 4.3, description: "Comfortable rooms near Yosemite Falls with on-site dining.", checkInTime: "3:00 PM", checkOutTime: "11:00 AM" },
  { id: "upper-pines", name: "Upper Pines Campground", type: "campground", location: "Yosemite Valley", priceRange: "$26/night", rating: 4.4, description: "Popular campground near Happy Isles trailhead. 238 sites.", checkInTime: "12:00 PM", checkOutTime: "12:00 PM" },
  { id: "north-pines", name: "North Pines Campground", type: "campground", location: "Yosemite Valley", priceRange: "$26/night", rating: 4.3, description: "Quieter campground along the Merced River. 81 sites.", checkInTime: "12:00 PM", checkOutTime: "12:00 PM" },
  { id: "housekeeping", name: "Housekeeping Camp", type: "cabin", location: "Yosemite Valley", priceRange: "$110-130/night", rating: 3.8, description: "Open-air concrete and canvas shelters along the Merced River.", checkInTime: "3:00 PM", checkOutTime: "10:00 AM" },
  { id: "wawona", name: "Wawona Hotel", type: "hotel", location: "Wawona", priceRange: "$175-275/night", rating: 4.1, description: "Historic Victorian-era hotel near Mariposa Grove of Giant Sequoias.", checkInTime: "3:00 PM", checkOutTime: "11:00 AM" },
  { id: "tuolumne-lodge", name: "Tuolumne Meadows Lodge", type: "lodge", location: "Tuolumne Meadows", priceRange: "$150-200/night", rating: 4.2, description: "Rustic canvas tent cabins at 8,600 feet. Includes breakfast and dinner.", checkInTime: "4:00 PM", checkOutTime: "10:00 AM" },
  { id: "bridalveil-creek", name: "Bridalveil Creek Campground", type: "campground", location: "Glacier Point Road", priceRange: "$18/night", rating: 4.0, description: "Higher elevation campground, cooler temps. No reservations needed.", checkInTime: "12:00 PM", checkOutTime: "12:00 PM" },
  { id: "el-portal-rv", name: "El Portal RV Park", type: "rv", location: "El Portal (just outside park)", priceRange: "$45-65/night", rating: 3.9, description: "Full hookup RV sites, 2 miles from park entrance.", checkInTime: "2:00 PM", checkOutTime: "11:00 AM" },
  { id: "autocamp", name: "AutoCamp Yosemite", type: "glamping", location: "Midpines", priceRange: "$250-400/night", rating: 4.6, description: "Luxury Airstream trailers and canvas tents. 25 min from park.", checkInTime: "4:00 PM", checkOutTime: "11:00 AM" },
  { id: "tenaya-lodge", name: "Tenaya Lodge at Yosemite", type: "hotel", location: "Fish Camp", priceRange: "$300-500/night", rating: 4.5, description: "Full-service resort with spa, pool, and restaurants. 2 miles from south gate.", checkInTime: "4:00 PM", checkOutTime: "11:00 AM" },
];

const lodgingTypeIcons: Record<string, React.ReactNode> = {
  campground: <Tent className="w-4 h-4" />,
  cabin: <Home className="w-4 h-4" />,
  hotel: <Hotel className="w-4 h-4" />,
  lodge: <Building className="w-4 h-4" />,
  glamping: <Tent className="w-4 h-4" />,
  rv: <Car className="w-4 h-4" />,
};

const lodgingTypeColors: Record<string, string> = {
  campground: "bg-green-100 text-green-700",
  cabin: "bg-amber-100 text-amber-700",
  hotel: "bg-purple-100 text-purple-700",
  lodge: "bg-blue-100 text-blue-700",
  glamping: "bg-pink-100 text-pink-700",
  rv: "bg-gray-100 text-gray-700",
};

const mealStyleIcons: Record<MealStyle, React.ReactNode> = {
  restaurant: <Utensils className="w-3.5 h-3.5" />,
  packed: <Sandwich className="w-3.5 h-3.5" />,
  campfire: <Flame className="w-3.5 h-3.5" />,
  grocery: <ShoppingCart className="w-3.5 h-3.5" />,
  picnic: <TreePine className="w-3.5 h-3.5" />,
};

const mealStyleLabels: Record<MealStyle, string> = {
  restaurant: "Restaurant",
  packed: "Packed Meal",
  campfire: "Campfire Cook",
  grocery: "Grocery / Self-Cook",
  picnic: "Picnic",
};

const mealTypeEmoji: Record<string, string> = {
  breakfast: "☕",
  lunch: "🥪",
  dinner: "🍽️",
  snack: "🍎",
};

// --- Editable Time Input ---
function EditableTime({ value, onChange, icon, label, colorClass }: {
  value: string | undefined;
  onChange: (val: string) => void;
  icon: React.ReactNode;
  label: string;
  colorClass: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  const handleSave = () => {
    onChange(draft);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-dashed ${colorClass}`}>
        {icon}
        <span className="text-sm font-medium">{label}</span>
        <input
          ref={inputRef}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") setEditing(false); }}
          className="w-24 px-2 py-1 text-sm rounded-md border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-forest"
          placeholder="e.g. 7:00 AM"
        />
        <button onClick={handleSave} className="p-1 rounded-md hover:bg-white/50 text-green-600"><Check className="w-4 h-4" /></button>
        <button onClick={() => setEditing(false)} className="p-1 rounded-md hover:bg-white/50 text-red-500"><X className="w-4 h-4" /></button>
      </div>
    );
  }

  return (
    <button
      onClick={() => { setDraft(value || ""); setEditing(true); }}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm group cursor-pointer hover:ring-2 hover:ring-forest/30 transition-all ${colorClass}`}
    >
      {icon}
      <span className="font-medium">{label}</span>
      <span className="font-semibold">{value || "Set time"}</span>
      <Edit3 className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" />
    </button>
  );
}

// --- Lodging Picker Modal ---
function LodgingPicker({ currentLodging, onSelect, onClose }: {
  currentLodging: string | undefined;
  onSelect: (lodging: string) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const filtered = lodgingOptions.filter((l) => {
    const matchesSearch = search === "" || l.name.toLowerCase().includes(search.toLowerCase()) || l.location.toLowerCase().includes(search.toLowerCase());
    const matchesType = !selectedType || l.type === selectedType;
    return matchesSearch && matchesType;
  });

  const types = ["campground", "cabin", "hotel", "lodge", "glamping", "rv"];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-night flex items-center gap-2">
              <Bed className="w-5 h-5 text-lake" />
              Choose Lodging
            </h3>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-night/40"><X className="w-5 h-5" /></button>
          </div>
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-night/30" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-forest focus:border-forest"
              placeholder="Search lodging..."
            />
          </div>
          {/* Type filters */}
          <div className="flex flex-wrap gap-2 mt-3">
            {types.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(selectedType === t ? null : t)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedType === t ? lodgingTypeColors[t] + " ring-2 ring-offset-1 ring-gray-300" : "bg-gray-100 text-night/50 hover:bg-gray-200"
                }`}
              >
                {lodgingTypeIcons[t]}
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>
        {/* Options List */}
        <div className="overflow-y-auto max-h-[50vh] p-3 space-y-2">
          {filtered.map((lodging) => {
            const isSelected = currentLodging === lodging.name;
            return (
              <button
                key={lodging.id}
                onClick={() => { onSelect(lodging.name); onClose(); }}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                  isSelected ? "border-forest bg-forest/5" : "border-gray-100 hover:border-forest/30 bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${lodgingTypeColors[lodging.type]}`}>
                        {lodgingTypeIcons[lodging.type]}
                        {lodging.type.charAt(0).toUpperCase() + lodging.type.slice(1)}
                      </span>
                      {isSelected && <span className="text-xs px-2 py-0.5 rounded-full bg-forest text-white">Current</span>}
                    </div>
                    <h4 className="font-semibold text-night text-sm">{lodging.name}</h4>
                    <p className="text-xs text-night/50 mt-0.5">📍 {lodging.location}</p>
                    <p className="text-xs text-night/40 mt-1">{lodging.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-night/50">
                      <span className="font-medium text-forest">{lodging.priceRange}</span>
                      <span>⭐ {lodging.rating}/5</span>
                      <span>Check-in: {lodging.checkInTime}</span>
                      <span>Check-out: {lodging.checkOutTime}</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
          {filtered.length === 0 && lodgingOptions.length > 0 && (
            <div className="text-center py-8 text-night/40 text-sm">
              No lodging found matching your search.
            </div>
          )}
          {lodgingOptions.length === 0 || (filtered.length === 0 && !search && !selectedType) ? (
            <div className="text-center py-8">
              <Bed className="w-10 h-10 text-lake/30 mx-auto mb-3" />
              <p className="text-sm font-medium text-night/50">Lodging options for this park</p>
              <p className="text-xs text-night/30 mt-1">Coming soon! We&apos;re adding lodging data for more parks.</p>
              <div className="mt-4 space-y-2">
                {["Campground", "Lodge", "Cabin", "Hotel", "RV Site"].map((type) => (
                  <button
                    key={type}
                    onClick={() => { onSelect(`${currentLodging?.split(" ")[0] || "Park"} ${type}`); onClose(); }}
                    className="w-full p-3 rounded-xl border border-gray-100 hover:border-forest/30 text-left text-sm text-night/60 hover:text-night transition-all"
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

// --- Draggable Lodging Card ---
function SortableLodgingCard({ dayIndex, lodging, onChangeLodging }: {
  dayIndex: number;
  lodging: string;
  onChangeLodging: (dayIndex: number, newLodging: string) => void;
}) {
  const [showPicker, setShowPicker] = useState(false);
  const id = `lodging-${dayIndex}`;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const matchedLodging = lodgingOptions.find((l) => l.name === lodging);

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg bg-lake/5 border border-lake/20 group hover:border-lake/40 hover:shadow-sm transition-all ${isDragging ? "opacity-50 shadow-lg" : ""}`}
      >
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-lake/30 hover:text-lake/60">
          <GripVertical className="w-4 h-4" />
        </button>
        <Bed className="w-4 h-4 text-lake flex-shrink-0" />
        <button
          onClick={() => setShowPicker(true)}
          className="flex-1 text-left text-sm text-lake hover:text-lake/80 transition-colors group"
        >
          <span className="font-medium">{lodging}</span>
          {matchedLodging && (
            <span className="text-xs text-lake/50 ml-2">{matchedLodging.priceRange}</span>
          )}
          <Edit3 className="w-3 h-3 inline-block ml-2 opacity-0 group-hover:opacity-60 transition-opacity" />
        </button>
        {matchedLodging && (
          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${lodgingTypeColors[matchedLodging.type]}`}>
            {lodgingTypeIcons[matchedLodging.type]}
          </span>
        )}
      </div>
      {showPicker && (
        <LodgingPicker
          currentLodging={lodging}
          onSelect={(newLodging) => onChangeLodging(dayIndex, newLodging)}
          onClose={() => setShowPicker(false)}
        />
      )}
    </>
  );
}

function TravelCard({ segment }: { segment: TravelSegment }) {
  const hasCoords = !!(segment.fromCoords && segment.toCoords);
  const { result: liveDirections, loading } = useDirections(
    segment.fromCoords?.lat,
    segment.fromCoords?.lng,
    segment.toCoords?.lat,
    segment.toCoords?.lng
  );

  // Use live data if available, otherwise fall back to mock data
  const driveTime = liveDirections?.driveTime || segment.driveTime;
  const distance = liveDirections?.distance || segment.distance;
  const googleMapsUrl = hasCoords
    ? (liveDirections?.googleMapsUrl || googleMapsDirectionsUrl(
        segment.fromCoords!.lat, segment.fromCoords!.lng,
        segment.toCoords!.lat, segment.toCoords!.lng
      ))
    : null;

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-blue-50 border border-blue-100">
      <Car className="w-4 h-4 text-lake flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium text-night/70">{segment.from}</span>
          <Navigation className="w-3 h-3 text-lake/60" />
          <span className="font-medium text-night/70">{segment.to}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-night/50 mt-0.5">
          {loading ? (
            <span className="flex items-center gap-1 text-lake"><Loader2 className="w-3 h-3 animate-spin" />Getting drive time...</span>
          ) : (
            <>
              <span className="flex items-center gap-1 font-medium text-night/70"><Clock className="w-3 h-3" />{driveTime}</span>
              <span>{distance}</span>
              {liveDirections && !liveDirections.driveTime.includes("Unknown") && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-blue-100 text-blue-600 text-[10px] font-medium">
                  <img src="https://www.google.com/favicon.ico" alt="" className="w-2.5 h-2.5" />
                  Live
                </span>
              )}
            </>
          )}
          {segment.notes && <span className="italic">· {segment.notes}</span>}
        </div>
      </div>
      {googleMapsUrl && (
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-blue-200 text-xs font-medium text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all whitespace-nowrap"
          title="Open in Google Maps"
        >
          <img src="https://www.google.com/favicon.ico" alt="" className="w-3.5 h-3.5" />
          Maps
          <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  );
}

function MealCard({ meal, onClick }: { meal: MealStop; onClick?: () => void }) {
  const isPacked = meal.style === "packed" || meal.style === "picnic";
  return (
    <button
      onClick={onClick}
      className={`w-full text-left flex items-start gap-3 px-4 py-2.5 rounded-xl border group cursor-pointer hover:shadow-md hover:ring-2 hover:ring-offset-1 transition-all ${isPacked ? "bg-green-50 border-green-100 hover:ring-green-300" : "bg-orange-50 border-orange-100 hover:ring-orange-300"}`}
    >
      <span className="text-base mt-0.5">{mealTypeEmoji[meal.type]}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-night/80 capitalize">{meal.type}</span>
          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${isPacked ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
            {mealStyleIcons[meal.style]}
            {mealStyleLabels[meal.style]}
          </span>
          {meal.time && <span className="text-xs text-night/40">{meal.time}</span>}
        </div>
        <p className="text-sm text-night/70 mt-0.5">{meal.name}</p>
        <div className="flex items-center gap-3 text-xs text-night/40 mt-0.5">
          {meal.location && <span>📍 {meal.location}</span>}
          {meal.cost && <span>💰 {meal.cost}</span>}
        </div>
        {meal.notes && <p className="text-xs text-night/40 italic mt-0.5">{meal.notes}</p>}
      </div>
      <Edit3 className="w-3.5 h-3.5 text-night/20 group-hover:text-night/50 transition-colors mt-1 flex-shrink-0" />
    </button>
  );
}

// --- Helpers for time budget ---
function parseDurationToMinutes(duration: string): number {
  if (!duration) return 60; // default 1 hour
  const lower = duration.toLowerCase();
  if (lower.includes("full day")) return 480;
  if (lower.includes("half day")) return 240;
  // Match patterns like "3-5 hours", "2 hours", "45 min", "1-2 hours"
  const hourMatch = lower.match(/(\d+)(?:\s*-\s*(\d+))?\s*h/);
  const minMatch = lower.match(/(\d+)\s*min/);
  if (hourMatch) {
    const high = hourMatch[2] ? parseInt(hourMatch[2]) : parseInt(hourMatch[1]);
    return high * 60;
  }
  if (minMatch) return parseInt(minMatch[1]);
  return 60;
}

function getDayTimeBudget(day: ItineraryDay): { totalMinutes: number; availableMinutes: number; overloaded: boolean; overloadMessage: string } {
  // Calculate available time from depart to arrive
  let availableMinutes = 12 * 60; // default 12 hours
  if (day.lodgingDepartTime && day.lodgingArriveTime) {
    const depart = parseTimeToMinutes(day.lodgingDepartTime);
    const arrive = parseTimeToMinutes(day.lodgingArriveTime);
    if (depart !== null && arrive !== null && arrive > depart) {
      availableMinutes = arrive - depart;
    }
  }

  // Sum up estimated durations for all slots
  let totalMinutes = 0;
  for (const slot of day.slots) {
    const slotType = slot.slotType || "activity";
    if (slotType === "activity") {
      const activity = getActivityById(slot.activityId);
      if (activity) totalMinutes += parseDurationToMinutes(activity.duration);
    } else {
      totalMinutes += parseDurationToMinutes(slot.customDuration || "1 hour");
    }
  }

  // Add travel time estimates (rough: 30 min per segment)
  totalMinutes += day.travel.length * 30;

  // Add meal time (30 min per meal)
  totalMinutes += day.meals.length * 30;

  const overloaded = totalMinutes > availableMinutes;
  const overHours = ((totalMinutes - availableMinutes) / 60).toFixed(1);
  const overloadMessage = overloaded
    ? `This day has ~${Math.round(totalMinutes / 60)} hours of activities, meals, and travel — but only ~${Math.round(availableMinutes / 60)} hours between departure and return. You're about ${overHours} hours over. Consider removing an activity or adjusting times.`
    : "";

  return { totalMinutes, availableMinutes, overloaded, overloadMessage };
}

function parseTimeToMinutes(time: string): number | null {
  const match = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return null;
  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const period = match[3].toUpperCase();
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

function SortableSlotCard({ slot, dayIndex, onRemove, onEdit }: { slot: ItinerarySlot; dayIndex: number; onRemove?: () => void; onEdit?: () => void }) {
  const slotType = slot.slotType || "activity";
  const activity = slotType === "activity" ? getActivityById(slot.activityId) : null;
  const id = slot.id || `${dayIndex}-${slot.timeSlot}-${slot.activityId}`;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const timeLabels: Record<string, string> = { morning: "🌅 Morning", afternoon: "☀️ Afternoon", evening: "🌙 Evening" };

  // --- Note card ---
  if (slotType === "note") {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`group flex items-start gap-3 p-4 rounded-xl bg-purple-50 border border-purple-200 hover:border-purple-300 hover:shadow-md transition-all ${isDragging ? "opacity-50 shadow-lg" : ""}`}
      >
        <button {...attributes} {...listeners} className="mt-1 cursor-grab active:cursor-grabbing text-purple-300 hover:text-purple-500">
          <GripVertical className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-purple-400 mb-1">
            <span>{timeLabels[slot.timeSlot] || slot.timeSlot}</span>
            {slot.startTime && slot.endTime && (
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{slot.startTime} – {slot.endTime}</span>
            )}
            <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-600 text-[10px] font-medium">NOTE</span>
          </div>
          <div className="flex items-center gap-2">
            <StickyNote className="w-4 h-4 text-purple-500" />
            <span className="font-semibold text-night">{slot.customTitle}</span>
          </div>
          {slot.customDuration && (
            <div className="mt-1.5 flex items-center gap-2 text-xs text-purple-400">
              <Clock className="w-3.5 h-3.5" />{slot.customDuration}
            </div>
          )}
          {slot.notes && <p className="mt-1.5 text-xs text-purple-400 italic">{slot.notes}</p>}
        </div>
        {onRemove && (
          <button onClick={onRemove} className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-purple-100 text-purple-300 hover:text-red-500 transition-all">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  // --- Destination card ---
  if (slotType === "destination") {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`group flex items-start gap-3 p-4 rounded-xl bg-sky-50 border border-sky-200 hover:border-sky-300 hover:shadow-md transition-all ${isDragging ? "opacity-50 shadow-lg" : ""}`}
      >
        <button {...attributes} {...listeners} className="mt-1 cursor-grab active:cursor-grabbing text-sky-300 hover:text-sky-500">
          <GripVertical className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-xs text-sky-400 mb-1">
            <span>{timeLabels[slot.timeSlot] || slot.timeSlot}</span>
            {slot.startTime && slot.endTime && (
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{slot.startTime} – {slot.endTime}</span>
            )}
            <span className="px-1.5 py-0.5 rounded bg-sky-100 text-sky-600 text-[10px] font-medium">DESTINATION</span>
          </div>
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-sky-500" />
            <span className="font-semibold text-night">{slot.customTitle}</span>
          </div>
          <div className="mt-1.5 flex items-center gap-4 text-xs text-sky-400">
            {slot.customLocation && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{slot.customLocation}</span>}
            {slot.customDuration && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{slot.customDuration}</span>}
          </div>
          {slot.notes && <p className="mt-1.5 text-xs text-sky-400 italic">{slot.notes}</p>}
        </div>
        {onRemove && (
          <button onClick={onRemove} className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-sky-100 text-sky-300 hover:text-red-500 transition-all">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  // --- Activity card (original or generated) ---
  // For generated trips, activity may be null — use slot metadata instead
  const displayName = activity?.name || slot.customTitle || slot.notes || "Activity";
  const displayType = activity?.type || (slot.customDescription?.split(" · ").pop()) || "sightseeing";
  const displayDifficulty = activity?.difficulty || slot.customDescription?.split(" · ")[0] || "";
  const displayEmoji = (activityTypeEmoji as Record<string, string>)[displayType] || "🏞️";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-start gap-3 p-4 rounded-xl bg-white border border-cream-dark hover:border-forest/30 hover:shadow-md transition-all cursor-pointer ${isDragging ? "opacity-50 shadow-lg" : ""}`}
      onClick={onEdit}
    >
      <button {...attributes} {...listeners} className="mt-1 cursor-grab active:cursor-grabbing text-night/30 hover:text-night/60" onClick={(e) => e.stopPropagation()}>
        <GripVertical className="w-5 h-5" />
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-xs text-night/50 mb-1">
          <span>{timeLabels[slot.timeSlot] || slot.timeSlot}</span>
          {slot.startTime && slot.endTime && (
            <span className="text-night/40 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {slot.startTime} – {slot.endTime}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg">{displayEmoji}</span>
          <span className="font-semibold text-night group-hover:text-forest transition-colors truncate">
            {displayName}
          </span>
          {displayDifficulty && <DifficultyBadge difficulty={displayDifficulty as any} />}
        </div>
        {activity ? (
          <div className="mt-2 flex items-center gap-4 text-xs text-night/50">
            <span className="flex items-center gap-1"><Ruler className="w-3.5 h-3.5" />{activity.distance} mi</span>
            <span className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" />{activity.elevationGain.toLocaleString()} ft</span>
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{activity.duration}</span>
          </div>
        ) : slot.customDescription ? (
          <div className="mt-2 text-xs text-night/50">{slot.customDescription}</div>
        ) : null}
        {slot.notes && !slot.customTitle && <p className="mt-1.5 text-xs text-night/40 italic">{slot.notes}</p>}
      </div>
      <Edit3 className="w-4 h-4 text-night/20 group-hover:text-forest/50 transition-colors mt-1 flex-shrink-0" />
    </div>
  );
}

function DayCard({ day, dayIndex, parkId, onReorder, onUpdateDepartTime, onUpdateArriveTime, onChangeLodging, onUpdateMeal, onAddSlot, onRemoveSlot, onSwapSlot, parkCoords }: {
  day: ItineraryDay;
  dayIndex: number;
  parkId: string;
  onReorder: (dayIndex: number, from: number, to: number) => void;
  onUpdateDepartTime: (dayIndex: number, time: string) => void;
  onUpdateArriveTime: (dayIndex: number, time: string) => void;
  onChangeLodging: (dayIndex: number, newLodging: string) => void;
  onUpdateMeal: (dayIndex: number, mealIndex: number, updatedMeal: MealStop) => void;
  onAddSlot: (dayIndex: number, slot: ItinerarySlot) => void;
  onRemoveSlot: (dayIndex: number, slotIndex: number) => void;
  onSwapSlot: (dayIndex: number, slotIndex: number, updatedSlot: ItinerarySlot) => void;
  parkCoords: { lat: number; lng: number };
}) {
  const [expanded, setExpanded] = useState(true);
  const [showMeals, setShowMeals] = useState(true);
  const [showTravel, setShowTravel] = useState(true);
  const [editingMealIndex, setEditingMealIndex] = useState<number | null>(null);
  const [editingSlotIndex, setEditingSlotIndex] = useState<number | null>(null);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  // Generate stable IDs for slots
  const items = day.slots.map((s, idx) => s.id || `${dayIndex}-${s.timeSlot}-${s.activityId || idx}`);

  // Calculate time budget
  const timeBudget = getDayTimeBudget(day);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.indexOf(active.id as string);
      const newIndex = items.indexOf(over.id as string);
      onReorder(dayIndex, oldIndex, newIndex);
    }
  }

  const packedMeals = day.meals.filter((m) => m.style === "packed" || m.style === "picnic" || m.style === "campfire").length;
  const restaurantMeals = day.meals.filter((m) => m.style === "restaurant" || m.style === "grocery").length;

  return (
    <div className="bg-cream-dark/50 rounded-2xl p-5">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between mb-3"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-forest text-white flex items-center justify-center font-bold text-sm">
            D{day.day}
          </div>
          <div className="text-left">
            <h3 className="font-bold text-night">Day {day.day}</h3>
            <p className="text-xs text-night/50">{day.date} · {day.slots.length} events{timeBudget.overloaded ? " ⚠️" : ""}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {day.meals.length > 0 && (
            <span className="text-xs text-night/40 hidden sm:block">
              🍽️ {packedMeals > 0 && `${packedMeals} packed`}{packedMeals > 0 && restaurantMeals > 0 && " · "}{restaurantMeals > 0 && `${restaurantMeals} dining out`}
            </span>
          )}
          {expanded ? <ChevronUp className="w-5 h-5 text-night/40" /> : <ChevronDown className="w-5 h-5 text-night/40" />}
        </div>
      </button>
      {expanded && (
        <>
          {/* Overload Warning Banner */}
          {timeBudget.overloaded && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 mb-3 animate-in fade-in">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-700">Day may be overpacked!</p>
                <p className="text-xs text-red-600 mt-0.5">{timeBudget.overloadMessage}</p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1.5 text-xs">
                    <div className="w-16 h-2 rounded-full bg-red-200 overflow-hidden">
                      <div className="h-full rounded-full bg-red-500" style={{ width: `${Math.min(100, (timeBudget.availableMinutes / timeBudget.totalMinutes) * 100)}%` }} />
                    </div>
                    <span className="text-red-500 font-medium">{Math.round(timeBudget.totalMinutes / 60)}h planned</span>
                    <span className="text-red-400">/ {Math.round(timeBudget.availableMinutes / 60)}h available</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Editable Lodging Departure Time */}
          <EditableTime
            value={day.lodgingDepartTime}
            onChange={(val) => onUpdateDepartTime(dayIndex, val)}
            icon={<LogOut className="w-4 h-4 text-amber-600" />}
            label="Leave lodging"
            colorClass="bg-amber-50 border-amber-100 text-amber-800 mb-3"
          />

          {/* Morning Meal */}
          {showMeals && day.meals.map((meal, idx) => meal.type === "breakfast" ? (
            <div key={`breakfast-${idx}`} className="mb-2">
              <MealCard meal={meal} onClick={() => setEditingMealIndex(idx)} />
            </div>
          ) : null)}

          {/* Morning Travel */}
          {showTravel && day.travel.length > 0 && (
            <div className="mb-2">
              <TravelCard segment={day.travel[0]} />
            </div>
          )}

          {/* Activities with interspersed meals & travel */}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {day.slots.map((slot, slotIdx) => (
                  <div key={slot.id || `${dayIndex}-${slot.timeSlot}-${slot.activityId || slotIdx}`}>
                    <SortableSlotCard
                      slot={slot}
                      dayIndex={dayIndex}
                      onRemove={slot.slotType && slot.slotType !== "activity" ? () => onRemoveSlot(dayIndex, slotIdx) : undefined}
                      onEdit={(slot.slotType || "activity") === "activity" ? () => setEditingSlotIndex(slotIdx) : undefined}
                    />
                    {showMeals && slot.timeSlot === "morning" && slotIdx < day.slots.length - 1 && (
                      <>
                        {day.meals.map((meal, idx) => meal.type === "lunch" ? (
                          <div key={`lunch-${idx}`} className="mt-2">
                            <MealCard meal={meal} onClick={() => setEditingMealIndex(idx)} />
                          </div>
                        ) : null)}
                        {showTravel && day.travel.length > 1 && (
                          <div className="mt-2">
                            <TravelCard segment={day.travel[1]} />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {/* Remaining meals */}
          {showMeals && (
            <div className="mt-2 space-y-2">
              {day.slots.length <= 1 && day.meals.map((meal, idx) => meal.type === "lunch" ? (
                <MealCard key={`lunch-solo-${idx}`} meal={meal} onClick={() => setEditingMealIndex(idx)} />
              ) : null)}
              {day.meals.map((meal, idx) => meal.type === "snack" ? (
                <MealCard key={`snack-${idx}`} meal={meal} onClick={() => setEditingMealIndex(idx)} />
              ) : null)}
              {day.meals.map((meal, idx) => meal.type === "dinner" ? (
                <MealCard key={`dinner-${idx}`} meal={meal} onClick={() => setEditingMealIndex(idx)} />
              ) : null)}
            </div>
          )}

          {/* Return travel */}
          {showTravel && day.travel.length > 2 && (
            <div className="mt-2">
              <TravelCard segment={day.travel[day.travel.length - 1]} />
            </div>
          )}

          {/* Add Event Button */}
          <button
            onClick={() => setShowAddEvent(true)}
            className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-cream-dark text-night/40 hover:border-forest/30 hover:text-forest transition-all text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Event
          </button>

          {/* Editable Lodging Arrival Time */}
          {day.lodging !== "Departure" && (
            <div className="mt-3">
              <EditableTime
                value={day.lodgingArriveTime}
                onChange={(val) => onUpdateArriveTime(dayIndex, val)}
                icon={<LogIn className="w-4 h-4 text-indigo-600" />}
                label="Back at lodging"
                colorClass="bg-indigo-50 border-indigo-100 text-indigo-800"
              />
            </div>
          )}

          {/* Clickable & Draggable Lodging Card */}
          {day.lodging && day.lodging !== "Departure" && (
            <div className="mt-3">
              <SortableLodgingCard
                dayIndex={dayIndex}
                lodging={day.lodging}
                onChangeLodging={onChangeLodging}
              />
            </div>
          )}
          {day.lodging === "Departure" && (
            <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-sunset/10 text-sm text-sunset">
              <Car className="w-4 h-4" />
              Departure — safe travels! 🚗
            </div>
          )}

          {/* Toggle Buttons */}
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => setShowMeals(!showMeals)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${showMeals ? "bg-orange-50 border-orange-200 text-orange-700" : "bg-white border-cream-dark text-night/40"}`}
            >
              🍽️ {showMeals ? "Hide" : "Show"} Meals
            </button>
            <button
              onClick={() => setShowTravel(!showTravel)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${showTravel ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-white border-cream-dark text-night/40"}`}
            >
              🚗 {showTravel ? "Hide" : "Show"} Travel
            </button>
          </div>

          {/* Activity Swap Modal */}
          {editingSlotIndex !== null && day.slots[editingSlotIndex] && (
            <ActivitySwapModal
              currentSlot={day.slots[editingSlotIndex]}
              currentActivity={getActivityById(day.slots[editingSlotIndex].activityId) || null}
              parkId={parkId}
              onSwap={(updatedSlot) => {
                onSwapSlot(dayIndex, editingSlotIndex, updatedSlot);
                setEditingSlotIndex(null);
              }}
              onClose={() => setEditingSlotIndex(null)}
            />
          )}

          {/* Add Event Modal */}
          {showAddEvent && (
            <AddEventModal
              onAdd={(slot) => {
                onAddSlot(dayIndex, slot);
                setShowAddEvent(false);
              }}
              onClose={() => setShowAddEvent(false)}
            />
          )}

          {/* Meal Editor Modal */}
          {editingMealIndex !== null && day.meals[editingMealIndex] && (
            <MealEditor
              meal={day.meals[editingMealIndex]}
              nearLat={parkCoords.lat}
              nearLng={parkCoords.lng}
              onSave={(updatedMeal) => {
                onUpdateMeal(dayIndex, editingMealIndex, updatedMeal);
                setEditingMealIndex(null);
              }}
              onClose={() => setEditingMealIndex(null)}
            />
          )}
        </>
      )}
    </div>
  );
}

// Generate Option B: a more relaxed/different version of the itinerary
function generateOptionB(baseDays: ItineraryDay[]): ItineraryDay[] {
  // Create a relaxed version — fewer activities, later starts, more rest
  return baseDays.map((day) => ({
    ...day,
    lodgingDepartTime: day.lodgingDepartTime
      ? day.lodgingDepartTime.replace(/(\d+):/, (_, h) => `${Math.min(parseInt(h) + 2, 12)}:`)
      : "9:00 AM",
    lodgingArriveTime: day.lodgingArriveTime
      ? day.lodgingArriveTime.replace(/(\d+):/, (_, h) => `${Math.max(parseInt(h) - 1, 4)}:`)
      : "5:00 PM",
    slots: day.slots.length > 1
      ? [day.slots[day.slots.length - 1]] // Keep only the last (usually lighter) activity
      : day.slots,
    meals: day.meals.map((m) => ({
      ...m,
      style: (m.style === "packed" ? "restaurant" : m.style) as any,
      name: m.style === "packed" ? "Dining at a local restaurant" : m.name,
    })),
  }));
}

// Create a blank day template
function createBlankDay(dayNum: number, date: string): ItineraryDay {
  return {
    day: dayNum,
    date,
    lodgingDepartTime: "8:00 AM",
    lodgingArriveTime: "6:00 PM",
    slots: [],
    meals: [
      { type: "breakfast", style: "packed", name: "Plan your breakfast", time: "7:30 AM" },
      { type: "lunch", style: "packed", name: "Plan your lunch", time: "12:00 PM" },
      { type: "dinner", style: "restaurant", name: "Plan your dinner", time: "6:30 PM" },
    ],
    travel: [],
    lodging: "Choose lodging",
  };
}

interface ItineraryOption {
  name: string;
  days: ItineraryDay[];
}

export default function ItineraryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const mockItinerary = itineraries.find((i) => i.id === id);
  const [generatedTrip, setGeneratedTrip] = useState<any>(null);
  const [loadingTrip, setLoadingTrip] = useState(!mockItinerary);

  // Fetch generated trip if not a mock — check localStorage first (Vercel compat)
  useEffect(() => {
    if (!mockItinerary) {
      // Try localStorage first
      try {
        const stored = localStorage.getItem(`trailplan-trip-${id}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          setGeneratedTrip(parsed);
          setLoadingTrip(false);
          return;
        }
      } catch {}
      // Fallback to API
      fetch(`/api/trips/generate?id=${encodeURIComponent(id)}`)
        .then((r) => r.json())
        .then((data) => {
          if (!data.error) setGeneratedTrip(data);
        })
        .catch(() => {})
        .finally(() => setLoadingTrip(false));
    }
  }, [id, mockItinerary]);

  // Use mock or generated
  const isGenerated = !mockItinerary && generatedTrip;
  const itinerary = mockItinerary || {
    id: generatedTrip?.id || id,
    name: generatedTrip?.name || "Your Trip",
    parkId: generatedTrip?.mainParkId || "",
    days: generatedTrip?.days?.map((d: any, i: number) => ({
      ...d,
      label: d.label || `Day ${i + 1}`,
      slots: d.slots?.map((s: any) => ({
        activityId: s.activityId,
        startTime: s.startTime || "",
        endTime: s.endTime || "",
        notes: s.notes || "",
        type: s.type || "activity",
        customTitle: s.customTitle,
        customDescription: s.customDescription,
        customType: s.customType,
      })) || [],
      meals: d.meals || [],
      travel: d.travel || [],
      lodging: d.lodging || { name: "Lodging", type: "lodge", departureTime: "7:00 AM", arrivalTime: "9:00 PM" },
    })) || [],
  };

  const park = getParkById(itinerary.parkId) || (generatedTrip?.parks?.[0] ? {
    id: generatedTrip.parks[0].id,
    name: generatedTrip.parks[0].fullName,
    region: generatedTrip.parks[0].state,
    bestSeason: generatedTrip.parks[0].bestSeason,
    description: generatedTrip.parks[0].description,
    heroImage: generatedTrip.parks[0].image || "",
    coordinates: generatedTrip.parks[0].coordinates,
  } : null);

  const [activeTab, setActiveTab] = useState(0);

  const [showSaveBanner, setShowSaveBanner] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"signup" | "signin">("signup");

  // Multiple itinerary options
  const [options, setOptions] = useState<ItineraryOption[]>(() => [
    { name: "Option A", days: mockItinerary ? mockItinerary.days : [] },
    ...(mockItinerary ? [{ name: "Option B — Relaxed", days: generateOptionB(mockItinerary.days) }] : []),
  ]);

  // Update options when generated trip loads
  useEffect(() => {
    if (generatedTrip && !mockItinerary) {
      const mappedDays = generatedTrip.days?.map((d: any, i: number) => ({
        day: i + 1,
        date: d.date || `2025-07-${14 + i}`,
        label: d.label || `Day ${i + 1}`,
        slots: d.slots?.map((s: any, si: number) => ({
          id: `gen-slot-${i}-${si}`,
          activityId: s.activityId || "",
          timeSlot: si === 0 ? "morning" : si === 1 ? "afternoon" : "evening",
          startTime: s.startTime || "",
          endTime: s.endTime || "",
          notes: s.notes || "",
          slotType: s.type === "activity" ? undefined : s.type,
          customTitle: s.customTitle,
          customDescription: s.customDescription,
        })) || [],
        meals: d.meals || [],
        travel: d.travel || [],
        lodging: d.lodging?.name,
        lodgingDepartTime: d.lodging?.departureTime || "7:00 AM",
        lodgingArriveTime: d.lodging?.arrivalTime || "9:00 PM",
      })) || [];
      setOptions([{ name: "Option A", days: mappedDays }]);
    }
  }, [generatedTrip, mockItinerary]);

  // Current option's days
  const days = options[activeTab]?.days || [];
  const setDays = (updater: (prev: ItineraryDay[]) => ItineraryDay[]) => {
    setOptions((prev) => {
      const updated = [...prev];
      updated[activeTab] = {
        ...updated[activeTab],
        days: typeof updater === "function" ? updater(updated[activeTab].days) : updater,
      };
      return updated;
    });
  };

  const handleAddOption = () => {
    const baseDates = itinerary.days.map((d: any) => d.date);
    const newOption: ItineraryOption = {
      name: `Option ${String.fromCharCode(65 + options.length)}`,
      days: baseDates.map((date: string, i: number) => createBlankDay(i + 1, date)),
    };
    setOptions((prev) => [...prev, newOption]);
    setActiveTab(options.length);
  };

  const handleDeleteOption = (index: number) => {
    if (options.length <= 1) return;
    setOptions((prev) => prev.filter((_, i) => i !== index));
    if (activeTab >= options.length - 1) setActiveTab(Math.max(0, options.length - 2));
  };

  const handleReorder = (dayIndex: number, from: number, to: number) => {
    setDays((prev) => {
      const updated = [...prev];
      updated[dayIndex] = {
        ...updated[dayIndex],
        slots: arrayMove(updated[dayIndex].slots, from, to),
      };
      return updated;
    });
  };

  const handleUpdateDepartTime = (dayIndex: number, time: string) => {
    setDays((prev) => {
      const updated = [...prev];
      updated[dayIndex] = { ...updated[dayIndex], lodgingDepartTime: time };
      return updated;
    });
  };

  const handleUpdateArriveTime = (dayIndex: number, time: string) => {
    setDays((prev) => {
      const updated = [...prev];
      updated[dayIndex] = { ...updated[dayIndex], lodgingArriveTime: time };
      return updated;
    });
  };

  const handleChangeLodging = (dayIndex: number, newLodging: string) => {
    setDays((prev) => {
      const updated = [...prev];
      updated[dayIndex] = { ...updated[dayIndex], lodging: newLodging };
      return updated;
    });
  };

  const handleUpdateMeal = (dayIndex: number, mealIndex: number, updatedMeal: MealStop) => {
    setDays((prev) => {
      const updated = [...prev];
      const updatedMeals = [...updated[dayIndex].meals];
      updatedMeals[mealIndex] = updatedMeal;
      updated[dayIndex] = { ...updated[dayIndex], meals: updatedMeals };
      return updated;
    });
  };

  const handleAddSlot = (dayIndex: number, slot: ItinerarySlot) => {
    setDays((prev) => {
      const updated = [...prev];
      const updatedSlots = [...updated[dayIndex].slots, slot];
      updated[dayIndex] = { ...updated[dayIndex], slots: updatedSlots };
      return updated;
    });
  };

  const handleRemoveSlot = (dayIndex: number, slotIndex: number) => {
    setDays((prev) => {
      const updated = [...prev];
      const updatedSlots = updated[dayIndex].slots.filter((_, i) => i !== slotIndex);
      updated[dayIndex] = { ...updated[dayIndex], slots: updatedSlots };
      return updated;
    });
  };

  const handleSwapSlot = (dayIndex: number, slotIndex: number, updatedSlot: ItinerarySlot) => {
    setDays((prev) => {
      const updated = [...prev];
      const updatedSlots = [...updated[dayIndex].slots];
      updatedSlots[slotIndex] = updatedSlot;
      updated[dayIndex] = { ...updated[dayIndex], slots: updatedSlots };
      return updated;
    });
  };

  // Loading state for generated trips
  if (loadingTrip) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-forest/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <MapPin className="w-8 h-8 text-forest" />
          </div>
          <h2 className="text-xl font-bold text-night mb-2">Building your trip...</h2>
          <p className="text-sm text-night/50">Generating the perfect itinerary</p>
        </div>
      </div>
    );
  }

  // Summary stats
  const totalActivities = days.reduce((sum, d) => sum + d.slots.length, 0);
  const totalMiles = days.reduce((sum, d) => {
    return sum + d.slots.reduce((s, slot) => {
      const a = getActivityById(slot.activityId);
      return s + (a?.distance || 0);
    }, 0);
  }, 0);
  const permitsNeeded = days.reduce((sum, d) => {
    return sum + d.slots.filter((s) => {
      const a = getActivityById(s.activityId);
      return a?.permitRequired;
    }).length;
  }, 0);
  const totalTravelSegments = days.reduce((sum, d) => sum + d.travel.length, 0);
  const totalMeals = days.reduce((sum, d) => sum + d.meals.length, 0);
  const packedMeals = days.reduce((sum, d) => sum + d.meals.filter((m) => m.style === "packed" || m.style === "picnic" || m.style === "campfire").length, 0);
  const diningOut = totalMeals - packedMeals;

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-white border-b border-cream-dark">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col gap-3">
            <div>
              <div className="flex items-center gap-2 text-sm text-night/50 mb-1">
                <MapPin className="w-4 h-4" />
                {park?.name || "National Park"}
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-night">{itinerary.name}</h1>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href={`/trip/${id}/permits`}
                className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-sunset/10 text-sunset hover:bg-sunset/20 transition-colors font-medium text-xs sm:text-sm"
              >
                <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Permits
              </Link>
              <button className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-cream text-night/60 hover:bg-cream-dark transition-colors text-xs sm:text-sm font-medium">
                <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Edit
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-forest text-white hover:bg-forest-light transition-colors text-xs sm:text-sm font-medium">
                <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Map + Itinerary */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Interactive Map */}
            <div className="relative h-48 sm:h-72 lg:h-80 rounded-xl sm:rounded-2xl overflow-hidden border border-cream-dark">
              <ItineraryMap days={days} center={park?.coordinates} />
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 flex-wrap">
              {options.map((opt, i) => (
                <div key={i} className="relative group">
                  <button
                    onClick={() => setActiveTab(i)}
                    className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${
                      activeTab === i ? "bg-forest text-white shadow-md" : "bg-white text-night/60 hover:bg-cream-dark"
                    }`}
                  >
                    {opt.name}
                  </button>
                  {options.length > 1 && activeTab === i && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteOption(i); }}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600"
                      title="Delete this option"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={handleAddOption}
                className="px-5 py-2 rounded-xl text-sm font-medium bg-white text-night/40 hover:text-forest hover:bg-cream-dark transition-all border border-dashed border-cream-dark"
              >
                + New Option
              </button>
            </div>

            {/* Days */}
            {/* Save Trip Banner (non-logged-in users) */}
            {showSaveBanner && (
              <SaveTripBanner
                onSignUp={() => { setAuthMode("signup"); setShowAuthModal(true); }}
                onDismiss={() => setShowSaveBanner(false)}
              />
            )}

            <div className="space-y-4">
              {days.map((day, i) => (
                <DayCard
                  key={day.day || day.date || i}
                  day={day}
                  dayIndex={i}
                  parkId={itinerary.parkId}
                  onReorder={handleReorder}
                  onUpdateDepartTime={handleUpdateDepartTime}
                  onUpdateArriveTime={handleUpdateArriveTime}
                  onChangeLodging={handleChangeLodging}
                  onUpdateMeal={handleUpdateMeal}
                  onAddSlot={handleAddSlot}
                  onRemoveSlot={handleRemoveSlot}
                  onSwapSlot={handleSwapSlot}
                  parkCoords={park?.coordinates || generatedTrip?.parks?.[0]?.coordinates || { lat: 37.8651, lng: -119.5383 }}
                />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trip Summary */}
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <h2 className="font-bold text-night mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-sunset" />
                Trip Summary
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-night/60">Total Activities</span>
                  <span className="font-bold text-night">{totalActivities}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-night/60">Total Distance</span>
                  <span className="font-bold text-night">{totalMiles.toFixed(1)} miles</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-night/60">Duration</span>
                  <span className="font-bold text-night">{days.length} days</span>
                </div>
                <hr className="border-cream-dark" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-night/60 flex items-center gap-1"><Car className="w-4 h-4" />Travel Segments</span>
                  <span className="font-bold text-night">{totalTravelSegments}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-night/60 flex items-center gap-1"><Utensils className="w-4 h-4" />Meals Planned</span>
                  <span className="font-bold text-night">{totalMeals}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-night/40 ml-5">Packed / Self-Prep</span>
                  <span className="text-green-600 font-medium">{packedMeals}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-night/40 ml-5">Dining Out</span>
                  <span className="text-orange-600 font-medium">{diningOut}</span>
                </div>
                <hr className="border-cream-dark" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-night/60 flex items-center gap-1"><DollarSign className="w-4 h-4" />Est. Cost</span>
                  <span className="font-bold text-forest">$1,200 – $1,800</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-night/60 flex items-center gap-1"><Shield className="w-4 h-4" />Permits Needed</span>
                  <Link href={`/trip/${id}/permits`} className="font-bold text-sunset hover:underline">{permitsNeeded}</Link>
                </div>
              </div>
            </div>

            {/* Daily Schedule */}
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <h2 className="font-bold text-night mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-forest" />
                Daily Schedule
              </h2>
              <div className="space-y-3">
                {days.filter((d) => d.lodging !== "Departure").map((d) => (
                  <div key={d.day} className="flex items-center gap-3 p-3 rounded-lg bg-cream">
                    <div className="w-8 h-8 rounded-lg bg-forest/10 text-forest flex items-center justify-center text-sm font-bold">
                      D{d.day}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-night/50 flex items-center gap-1">
                          <Sunrise className="w-3 h-3" />
                          Depart {d.lodgingDepartTime || "—"}
                        </span>
                        <span className="text-xs text-night/50 flex items-center gap-1">
                          <Moon className="w-3 h-3" />
                          Return {d.lodgingArriveTime || "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Lodging */}
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <h2 className="font-bold text-night mb-4 flex items-center gap-2">
                <Bed className="w-5 h-5 text-lake" />
                Lodging
              </h2>
              <div className="space-y-3">
                {days.filter((d) => d.lodging && d.lodging !== "Departure").map((d) => {
                  const matched = lodgingOptions.find((l) => l.name === d.lodging);
                  return (
                    <div key={d.day} className="flex items-start gap-3 p-3 rounded-lg bg-cream">
                      <div className="w-8 h-8 rounded-lg bg-lake/10 text-lake flex items-center justify-center text-sm font-bold">
                        D{d.day}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-night">{d.lodging}</p>
                        <p className="text-xs text-night/50">{d.date}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-night/40">
                          {d.lodgingDepartTime && <span>🌅 Out by {d.lodgingDepartTime}</span>}
                          {d.lodgingArriveTime && <span>🌙 Back by {d.lodgingArriveTime}</span>}
                        </div>
                        {matched && <p className="text-xs text-forest mt-1">{matched.priceRange}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Meal Summary */}
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <h2 className="font-bold text-night mb-4 flex items-center gap-2">
                <Utensils className="w-5 h-5 text-sunset" />
                Meal Plan
              </h2>
              <div className="space-y-3">
                {days.map((d) => (
                  <div key={d.day} className="p-3 rounded-lg bg-cream">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded bg-forest/10 text-forest flex items-center justify-center text-xs font-bold">
                        {d.day}
                      </div>
                      <span className="text-xs font-medium text-night/60">Day {d.day}</span>
                    </div>
                    <div className="space-y-1">
                      {d.meals.map((meal, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className="text-night/60">
                            {mealTypeEmoji[meal.type]} {meal.type.charAt(0).toUpperCase() + meal.type.slice(1)}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full ${
                            meal.style === "packed" || meal.style === "picnic" || meal.style === "campfire"
                              ? "bg-green-100 text-green-700"
                              : "bg-orange-100 text-orange-700"
                          }`}>
                            {mealStyleLabels[meal.style]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Affiliate Ad */}
            <AffiliateAdBanner />
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          mode={authMode}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </div>
  );
}
