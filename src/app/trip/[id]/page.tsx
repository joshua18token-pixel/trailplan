"use client";

import { useState, useRef, useEffect, use } from "react";
import {
  MapPin, Edit3, Share2, Plus, GripVertical, Clock, TrendingUp,
  Ruler, Star, ChevronDown, ChevronUp, Map, Shield, DollarSign, Bed,
  Car, Utensils, Coffee, Sun, Moon, Sunrise, Sandwich, Flame, ShoppingCart, TreePine,
  LogOut, LogIn, Navigation, X, Check, Search, Hotel, Tent, Home, Building,
} from "lucide-react";
import Link from "next/link";
import DifficultyBadge from "@/components/DifficultyBadge";
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
          {filtered.length === 0 && (
            <div className="text-center py-8 text-night/40 text-sm">
              No lodging found matching your search.
            </div>
          )}
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
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{segment.driveTime}</span>
          <span>{segment.distance}</span>
          {segment.notes && <span className="italic">· {segment.notes}</span>}
        </div>
      </div>
    </div>
  );
}

function MealCard({ meal }: { meal: MealStop }) {
  const isPacked = meal.style === "packed" || meal.style === "picnic";
  return (
    <div className={`flex items-start gap-3 px-4 py-2.5 rounded-xl border ${isPacked ? "bg-green-50 border-green-100" : "bg-orange-50 border-orange-100"}`}>
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
    </div>
  );
}

function SortableActivityCard({ slot, dayIndex }: { slot: ItinerarySlot; dayIndex: number }) {
  const activity = getActivityById(slot.activityId);
  const id = `${dayIndex}-${slot.timeSlot}-${slot.activityId}`;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (!activity) return null;

  const timeLabels: Record<string, string> = { morning: "🌅 Morning", afternoon: "☀️ Afternoon", evening: "🌙 Evening" };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-start gap-3 p-4 rounded-xl bg-white border border-cream-dark hover:border-forest/30 hover:shadow-md transition-all ${isDragging ? "opacity-50 shadow-lg" : ""}`}
    >
      <button {...attributes} {...listeners} className="mt-1 cursor-grab active:cursor-grabbing text-night/30 hover:text-night/60">
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
          <span className="text-lg">{activityTypeEmoji[activity.type]}</span>
          <Link href={`/explore/${activity.id}`} className="font-semibold text-night hover:text-forest transition-colors truncate">
            {activity.name}
          </Link>
          <DifficultyBadge difficulty={activity.difficulty} />
        </div>
        <div className="mt-2 flex items-center gap-4 text-xs text-night/50">
          <span className="flex items-center gap-1"><Ruler className="w-3.5 h-3.5" />{activity.distance} mi</span>
          <span className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" />{activity.elevationGain.toLocaleString()} ft</span>
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{activity.duration}</span>
        </div>
        {slot.notes && <p className="mt-1.5 text-xs text-night/40 italic">{slot.notes}</p>}
      </div>
    </div>
  );
}

function DayCard({ day, dayIndex, onReorder, onUpdateDepartTime, onUpdateArriveTime, onChangeLodging }: {
  day: ItineraryDay;
  dayIndex: number;
  onReorder: (dayIndex: number, from: number, to: number) => void;
  onUpdateDepartTime: (dayIndex: number, time: string) => void;
  onUpdateArriveTime: (dayIndex: number, time: string) => void;
  onChangeLodging: (dayIndex: number, newLodging: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [showMeals, setShowMeals] = useState(true);
  const [showTravel, setShowTravel] = useState(true);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const items = day.slots.map((s) => `${dayIndex}-${s.timeSlot}-${s.activityId}`);

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
            <p className="text-xs text-night/50">{day.date} · {day.slots.length} activities</p>
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
          {/* Editable Lodging Departure Time */}
          <EditableTime
            value={day.lodgingDepartTime}
            onChange={(val) => onUpdateDepartTime(dayIndex, val)}
            icon={<LogOut className="w-4 h-4 text-amber-600" />}
            label="Leave lodging"
            colorClass="bg-amber-50 border-amber-100 text-amber-800 mb-3"
          />

          {/* Morning Meal */}
          {showMeals && day.meals.filter((m) => m.type === "breakfast").map((meal, i) => (
            <div key={`breakfast-${i}`} className="mb-2">
              <MealCard meal={meal} />
            </div>
          ))}

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
                  <div key={`${dayIndex}-${slot.timeSlot}-${slot.activityId}`}>
                    <SortableActivityCard
                      slot={slot}
                      dayIndex={dayIndex}
                    />
                    {showMeals && slot.timeSlot === "morning" && slotIdx < day.slots.length - 1 && (
                      <>
                        {day.meals.filter((m) => m.type === "lunch").map((meal, i) => (
                          <div key={`lunch-${i}`} className="mt-2">
                            <MealCard meal={meal} />
                          </div>
                        ))}
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
              {day.slots.length <= 1 && day.meals.filter((m) => m.type === "lunch").map((meal, i) => (
                <MealCard key={`lunch-solo-${i}`} meal={meal} />
              ))}
              {day.meals.filter((m) => m.type === "snack").map((meal, i) => (
                <MealCard key={`snack-${i}`} meal={meal} />
              ))}
              {day.meals.filter((m) => m.type === "dinner").map((meal, i) => (
                <MealCard key={`dinner-${i}`} meal={meal} />
              ))}
            </div>
          )}

          {/* Return travel */}
          {showTravel && day.travel.length > 2 && (
            <div className="mt-2">
              <TravelCard segment={day.travel[day.travel.length - 1]} />
            </div>
          )}

          {/* Add Activity Button */}
          <button className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-cream-dark text-night/40 hover:border-forest/30 hover:text-forest transition-all text-sm font-medium">
            <Plus className="w-4 h-4" />
            Add Activity
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
        </>
      )}
    </div>
  );
}

export default function ItineraryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const itinerary = itineraries.find((i) => i.id === id) || itineraries[0];
  const park = getParkById(itinerary.parkId);
  const [activeTab, setActiveTab] = useState(0);
  const [days, setDays] = useState<ItineraryDay[]>(itinerary.days);

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

  const tabs = ["Option A", "Option B"];

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-white border-b border-cream-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-night/50 mb-1">
                <MapPin className="w-4 h-4" />
                {park?.name || "National Park"}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-night">{itinerary.name}</h1>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/trip/${id}/permits`}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sunset/10 text-sunset hover:bg-sunset/20 transition-colors font-medium text-sm"
              >
                <Shield className="w-4 h-4" />
                Permits
              </Link>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cream text-night/60 hover:bg-cream-dark transition-colors text-sm font-medium">
                <Edit3 className="w-4 h-4" />
                Edit
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-forest text-white hover:bg-forest-light transition-colors text-sm font-medium">
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Map + Itinerary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Map Placeholder */}
            <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden bg-night/5 border border-cream-dark">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Map className="w-12 h-12 text-night/20 mx-auto mb-3" />
                  <p className="text-night/40 font-medium">Add Mapbox token to enable map</p>
                  <p className="text-night/30 text-sm mt-1">Interactive trail map with waypoints &amp; driving routes</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2">
              {tabs.map((tab, i) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(i)}
                  className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeTab === i ? "bg-forest text-white shadow-md" : "bg-white text-night/60 hover:bg-cream-dark"
                  }`}
                >
                  {tab}
                </button>
              ))}
              <button className="px-5 py-2 rounded-xl text-sm font-medium bg-white text-night/40 hover:text-forest hover:bg-cream-dark transition-all">
                + New Option
              </button>
            </div>

            {/* Days */}
            <div className="space-y-4">
              {days.map((day, i) => (
                <DayCard
                  key={day.day}
                  day={day}
                  dayIndex={i}
                  onReorder={handleReorder}
                  onUpdateDepartTime={handleUpdateDepartTime}
                  onUpdateArriveTime={handleUpdateArriveTime}
                  onChangeLodging={handleChangeLodging}
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
          </div>
        </div>
      </div>
    </div>
  );
}
