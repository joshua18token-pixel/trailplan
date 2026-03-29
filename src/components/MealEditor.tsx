"use client";

import { useState, useMemo } from "react";
import {
  X, Search, Utensils, Sandwich, Flame, ShoppingCart, TreePine,
  Star, MapPin, ExternalLink, ChevronDown, Minus, Plus, Clock, SlidersHorizontal,
} from "lucide-react";
import type { MealStop, MealStyle, MealType } from "@/data/mockData";
import { findNearbyRestaurants, getPriceLevelString, type Restaurant } from "@/data/restaurants";

interface MealEditorProps {
  meal: MealStop;
  /** Coordinates of the current location (for nearby restaurant search) */
  nearLat: number;
  nearLng: number;
  onSave: (updatedMeal: MealStop) => void;
  onClose: () => void;
}

const styleOptions: { value: MealStyle; label: string; icon: React.ReactNode; description: string; color: string }[] = [
  { value: "restaurant", label: "Restaurant", icon: <Utensils className="w-5 h-5" />, description: "Dine out at a nearby restaurant", color: "bg-orange-50 border-orange-200 text-orange-700" },
  { value: "packed", label: "Packed Meal", icon: <Sandwich className="w-5 h-5" />, description: "Pack your own food — sandwiches, snacks, etc.", color: "bg-green-50 border-green-200 text-green-700" },
  { value: "campfire", label: "Campfire Cook", icon: <Flame className="w-5 h-5" />, description: "Cook over a fire or camp stove", color: "bg-amber-50 border-amber-200 text-amber-700" },
  { value: "grocery", label: "Self-Cook (Grocery)", icon: <ShoppingCart className="w-5 h-5" />, description: "Buy ingredients and cook at your lodging", color: "bg-blue-50 border-blue-200 text-blue-700" },
  { value: "picnic", label: "Picnic", icon: <TreePine className="w-5 h-5" />, description: "Pack or buy food and eat outdoors", color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
];

const mealTypeEmoji: Record<string, string> = {
  breakfast: "☕",
  lunch: "🥪",
  dinner: "🍽️",
  snack: "🍎",
};

// Packed meal suggestions
const packedMealSuggestions: Record<string, string[]> = {
  breakfast: ["Granola bars & fruit", "Oatmeal packets & coffee", "Bagels with cream cheese", "Energy bars & trail mix", "Yogurt & granola cups", "Cereal & milk"],
  lunch: ["PB&J sandwiches", "Turkey & cheese wraps", "Hummus & veggie pita", "Packed sandwiches & trail mix", "Tuna salad & crackers", "Pasta salad (prep night before)"],
  dinner: ["Freeze-dried backpacker meals", "Instant ramen & veggies", "Canned soup & bread", "Cold cut sandwiches", "Pre-made burritos (reheat)"],
  snack: ["Trail mix & jerky", "Energy bars & dried fruit", "Apple & peanut butter", "Cheese & crackers"],
};

const campfireSuggestions: Record<string, string[]> = {
  breakfast: ["Campfire pancakes", "Eggs & bacon on camp stove", "French toast over fire", "Oatmeal on camp stove", "Breakfast burritos"],
  lunch: ["Hot dogs & corn on the cob", "Grilled cheese sandwiches", "Campfire quesadillas", "Foil packet veggies & sausage"],
  dinner: ["Burgers & corn on the grill", "Campfire spaghetti", "Foil packet salmon & veggies", "Steak & potatoes over fire", "Chili & cornbread", "Cast iron pizza"],
  snack: ["S'mores!", "Roasted marshmallows", "Campfire popcorn"],
};

const grocerySuggestions: Record<string, string[]> = {
  breakfast: ["Scrambled eggs & toast (at lodge)", "Pancakes from mix", "Cereal & fruit from store", "Microwave oatmeal"],
  lunch: ["Deli meat sandwiches (from store)", "Salad kit from grocery", "Cup noodles & fruit", "Cheese, crackers & deli meat"],
  dinner: ["Spaghetti & sauce (cook at lodge)", "Stir fry with store veggies", "Mac & cheese + hot dogs", "Soup & grilled cheese", "Tacos with store ingredients"],
  snack: ["Fruit from store", "Chips & salsa", "Yogurt cups"],
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-3 h-3 ${i <= Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`}
        />
      ))}
      <span className="text-xs text-night/50 ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

function RestaurantCard({ restaurant, isSelected, onSelect }: {
  restaurant: Restaurant & { distance?: number };
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-4 rounded-xl border-2 transition-all hover:shadow-md ${
        isSelected ? "border-sunset bg-sunset/5" : "border-gray-100 hover:border-sunset/30"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-night text-sm truncate">{restaurant.name}</h4>
            {isSelected && <span className="text-[10px] px-2 py-0.5 rounded-full bg-sunset text-white">Selected</span>}
          </div>
          <p className="text-xs text-night/50">{restaurant.cuisine}</p>
          <div className="flex items-center gap-3 mt-1.5">
            <StarRating rating={restaurant.rating} />
            <span className="text-xs text-night/40">({restaurant.reviewCount})</span>
            <span className="text-xs font-medium text-green-600">{getPriceLevelString(restaurant.priceLevel)}</span>
          </div>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-night/40">
            {restaurant.distance != null && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{restaurant.distance.toFixed(1)} mi away</span>}
            <span>📍 {restaurant.location}</span>
          </div>
          {restaurant.hours && <p className="text-xs text-night/40 mt-1"><Clock className="w-3 h-3 inline mr-1" />{restaurant.hours}</p>}
          {restaurant.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {restaurant.tags.slice(0, 5).map((tag) => (
                <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-night/50">{tag}</span>
              ))}
            </div>
          )}
        </div>
        {restaurant.yelpUrl && (
          <a
            href={restaurant.yelpUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 border border-red-200 text-xs font-medium text-red-600 hover:bg-red-100 transition-all"
          >
            Yelp
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </button>
  );
}

export default function MealEditor({ meal, nearLat, nearLng, onSave, onClose }: MealEditorProps) {
  const [style, setStyle] = useState<MealStyle>(meal.style);
  const [name, setName] = useState(meal.name);
  const [time, setTime] = useState(meal.time || "");
  const [cost, setCost] = useState(meal.cost || "");
  const [notes, setNotes] = useState(meal.notes || "");
  const [location, setLocation] = useState(meal.location || "");

  // Restaurant search state
  const [searchQuery, setSearchQuery] = useState("");
  const [radius, setRadius] = useState(10);
  const [priceFilter, setPriceFilter] = useState<number | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  // Find nearby restaurants
  const nearbyRestaurants = useMemo(() => {
    const results = findNearbyRestaurants(nearLat, nearLng, radius, {
      priceLevel: priceFilter || undefined,
      mealType: meal.type === "snack" ? undefined : meal.type,
    });
    if (searchQuery) {
      return results.filter((r) =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.cuisine.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    return results;
  }, [nearLat, nearLng, radius, priceFilter, searchQuery, meal.type]);

  const handleSelectRestaurant = (restaurant: Restaurant & { distance?: number }) => {
    setSelectedRestaurant(restaurant);
    setName(restaurant.name);
    setLocation(restaurant.location);
    setCost(getPriceLevelString(restaurant.priceLevel) + " · " + restaurant.cuisine);
  };

  const handleSave = () => {
    onSave({
      type: meal.type,
      style,
      name,
      time: time || undefined,
      cost: cost || undefined,
      notes: notes || undefined,
      location: location || undefined,
    });
  };

  const suggestions = style === "packed" ? packedMealSuggestions[meal.type] || []
    : style === "campfire" ? campfireSuggestions[meal.type] || []
    : style === "grocery" ? grocerySuggestions[meal.type] || []
    : [];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-night flex items-center gap-2">
              <span className="text-xl">{mealTypeEmoji[meal.type]}</span>
              Edit {meal.type.charAt(0).toUpperCase() + meal.type.slice(1)}
            </h3>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-night/40"><X className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-5">
          {/* Meal Style Selector */}
          <div>
            <label className="text-sm font-semibold text-night mb-2 block">How do you want to eat?</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {styleOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setStyle(opt.value);
                    setSelectedRestaurant(null);
                    if (opt.value !== "restaurant") {
                      setLocation("");
                      setCost("");
                    }
                  }}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    style === opt.value ? opt.color + " ring-2 ring-offset-1 ring-gray-300" : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {opt.icon}
                    <span className="text-sm font-medium">{opt.label}</span>
                  </div>
                  <p className="text-[11px] text-night/50 leading-tight">{opt.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Restaurant Finder */}
          {style === "restaurant" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-night flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-sunset" />
                  Find a Restaurant
                </label>
                <span className="text-xs text-night/40">{nearbyRestaurants.length} found</span>
              </div>

              {/* Search + Filters */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-night/30" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-sunset focus:border-sunset"
                    placeholder="Search restaurants, cuisine, tags..."
                  />
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {/* Radius selector */}
                  <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-200">
                    <MapPin className="w-3.5 h-3.5 text-night/40" />
                    <span className="text-xs text-night/50">Radius:</span>
                    <button
                      onClick={() => setRadius(Math.max(1, radius - 5))}
                      className="p-0.5 rounded hover:bg-gray-200 text-night/40"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-sm font-semibold text-night min-w-[3rem] text-center">{radius} mi</span>
                    <button
                      onClick={() => setRadius(Math.min(50, radius + 5))}
                      className="p-0.5 rounded hover:bg-gray-200 text-night/40"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Price filter */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <button
                        key={level}
                        onClick={() => setPriceFilter(priceFilter === level ? null : level)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          priceFilter === level
                            ? "bg-green-100 text-green-700 border border-green-300"
                            : "bg-gray-100 text-night/40 border border-transparent hover:bg-gray-200"
                        }`}
                      >
                        {"$".repeat(level)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Restaurant Results */}
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {nearbyRestaurants.map((r) => (
                  <RestaurantCard
                    key={r.id}
                    restaurant={r}
                    isSelected={selectedRestaurant?.id === r.id}
                    onSelect={() => handleSelectRestaurant(r)}
                  />
                ))}
                {nearbyRestaurants.length === 0 && (
                  <div className="text-center py-6 text-night/40 text-sm">
                    <Utensils className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No restaurants found. Try increasing the radius or changing filters.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Packed / Campfire / Grocery Suggestions */}
          {(style === "packed" || style === "campfire" || style === "grocery" || style === "picnic") && suggestions.length > 0 && (
            <div>
              <label className="text-sm font-semibold text-night mb-2 block">Quick ideas</label>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => setName(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${
                      name === s
                        ? "bg-forest/10 border-forest text-forest font-medium"
                        : "bg-gray-50 border-gray-200 text-night/60 hover:bg-gray-100"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom Details */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-night/60 mb-1 block">Meal description</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest focus:border-forest"
                placeholder="e.g. Spaghetti at the campsite"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-night/60 mb-1 block">Time</label>
                <input
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest focus:border-forest"
                  placeholder="e.g. 7:00 PM"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-night/60 mb-1 block">Cost estimate</label>
                <input
                  type="text"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest focus:border-forest"
                  placeholder="e.g. $15-25/person"
                />
              </div>
            </div>
            {style === "restaurant" && (
              <div>
                <label className="text-xs font-medium text-night/60 mb-1 block">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest focus:border-forest"
                  placeholder="e.g. Yosemite Village"
                />
              </div>
            )}
            <div>
              <label className="text-xs font-medium text-night/60 mb-1 block">Notes (optional)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest focus:border-forest"
                placeholder="e.g. Make reservations ahead of time"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 flex items-center justify-end gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-night/60 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl text-sm font-medium bg-forest text-white hover:bg-forest-light transition-colors shadow-md"
          >
            Save Meal
          </button>
        </div>
      </div>
    </div>
  );
}
