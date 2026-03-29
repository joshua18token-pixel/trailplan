"use client";

import { useState, useMemo } from "react";
import {
  X, Search, Clock, Ruler, TrendingUp, MapPin, Edit3, StickyNote,
} from "lucide-react";
import DifficultyBadge from "@/components/DifficultyBadge";
import {
  activities, activityTypeEmoji, getParkById,
  type Activity, type ActivityType, type Difficulty, type ItinerarySlot, type TimeSlot,
} from "@/data/mockData";

interface ActivitySwapModalProps {
  currentSlot: ItinerarySlot;
  currentActivity: Activity | null;
  parkId: string;
  onSwap: (updatedSlot: ItinerarySlot) => void;
  onClose: () => void;
}

const activityTypes: { value: ActivityType | "all"; label: string; emoji: string }[] = [
  { value: "all", label: "All", emoji: "🌟" },
  { value: "hiking", label: "Hiking", emoji: "🥾" },
  { value: "biking", label: "Biking", emoji: "🚴" },
  { value: "fishing", label: "Fishing", emoji: "🎣" },
  { value: "kayaking", label: "Kayaking", emoji: "🛶" },
  { value: "sightseeing", label: "Sightseeing", emoji: "📸" },
  { value: "camping", label: "Camping", emoji: "⛺" },
];

const difficulties: { value: Difficulty | "all"; label: string }[] = [
  { value: "all", label: "Any Difficulty" },
  { value: "easy", label: "Easy" },
  { value: "moderate", label: "Moderate" },
  { value: "hard", label: "Hard" },
  { value: "expert", label: "Expert" },
];

const timeSlotOptions: { value: TimeSlot; label: string; emoji: string }[] = [
  { value: "morning", label: "Morning", emoji: "🌅" },
  { value: "afternoon", label: "Afternoon", emoji: "☀️" },
  { value: "evening", label: "Evening", emoji: "🌙" },
];

export default function ActivitySwapModal({ currentSlot, currentActivity, parkId, onSwap, onClose }: ActivitySwapModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<ActivityType | "all">("all");
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | "all">("all");
  const [showAllParks, setShowAllParks] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(currentActivity);

  // Edit fields
  const [timeSlot, setTimeSlot] = useState<TimeSlot>(currentSlot.timeSlot);
  const [startTime, setStartTime] = useState(currentSlot.startTime || "");
  const [endTime, setEndTime] = useState(currentSlot.endTime || "");
  const [notes, setNotes] = useState(currentSlot.notes || "");

  const filteredActivities = useMemo(() => {
    return activities.filter((a) => {
      if (!showAllParks && a.parkId !== parkId) return false;
      if (typeFilter !== "all" && a.type !== typeFilter) return false;
      if (difficultyFilter !== "all" && a.difficulty !== difficultyFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return a.name.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.type.toLowerCase().includes(q);
      }
      return true;
    });
  }, [searchQuery, typeFilter, difficultyFilter, showAllParks, parkId]);

  const handleSave = () => {
    if (!selectedActivity) return;
    onSwap({
      ...currentSlot,
      activityId: selectedActivity.id,
      timeSlot,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      notes: notes || undefined,
      slotType: "activity",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-bold text-night">Edit Activity</h3>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-night/40"><X className="w-5 h-5" /></button>
          </div>
          {currentActivity && (
            <p className="text-sm text-night/50">Current: {activityTypeEmoji[currentActivity.type]} {currentActivity.name}</p>
          )}
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-5">
          {/* Time & Notes Editor */}
          <div className="p-4 rounded-xl bg-cream space-y-3">
            <h4 className="text-sm font-semibold text-night flex items-center gap-2"><Edit3 className="w-4 h-4" /> Schedule</h4>
            <div className="flex gap-2">
              {timeSlotOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTimeSlot(opt.value)}
                  className={`flex-1 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                    timeSlot === opt.value
                      ? "border-forest bg-forest/5 text-forest"
                      : "border-gray-200 text-night/50 hover:border-gray-300"
                  }`}
                >
                  {opt.emoji} {opt.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-night/60 mb-1 block">Start time</label>
                <input type="text" value={startTime} onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                  placeholder="e.g. 10:00 AM" />
              </div>
              <div>
                <label className="text-xs font-medium text-night/60 mb-1 block">End time</label>
                <input type="text" value={endTime} onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                  placeholder="e.g. 12:00 PM" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-night/60 mb-1 block">Notes</label>
              <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                placeholder="e.g. Bring rain jacket, start early..." />
            </div>
          </div>

          {/* Swap Activity */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-night">Swap Activity</h4>
              <label className="flex items-center gap-2 text-xs text-night/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showAllParks}
                  onChange={(e) => setShowAllParks(e.target.checked)}
                  className="rounded border-gray-300 text-forest focus:ring-forest"
                />
                Show all parks
              </label>
            </div>

            {/* Search */}
            <div className="relative mb-3">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-night/30" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-forest"
                placeholder="Search activities, trails, kayaking..."
              />
            </div>

            {/* Filters */}
            <div className="space-y-2 mb-3">
              {/* Activity type */}
              <div className="flex flex-wrap gap-1.5">
                {activityTypes.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTypeFilter(t.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      typeFilter === t.value
                        ? "bg-forest text-white"
                        : "bg-gray-100 text-night/50 hover:bg-gray-200"
                    }`}
                  >
                    {t.emoji} {t.label}
                  </button>
                ))}
              </div>
              {/* Difficulty */}
              <div className="flex flex-wrap gap-1.5">
                {difficulties.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => setDifficultyFilter(d.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      difficultyFilter === d.value
                        ? "bg-sunset text-white"
                        : "bg-gray-100 text-night/50 hover:bg-gray-200"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Results */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {filteredActivities.map((a) => {
                const isSelected = selectedActivity?.id === a.id;
                const isCurrent = currentActivity?.id === a.id;
                const park = getParkById(a.parkId);
                return (
                  <button
                    key={a.id}
                    onClick={() => setSelectedActivity(a)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                      isSelected ? "border-forest bg-forest/5" : "border-gray-100 hover:border-forest/30"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{activityTypeEmoji[a.type]}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-semibold text-night text-sm truncate">{a.name}</span>
                          <DifficultyBadge difficulty={a.difficulty} />
                          {isCurrent && <span className="text-[10px] px-2 py-0.5 rounded-full bg-forest text-white">Current</span>}
                          {isSelected && !isCurrent && <span className="text-[10px] px-2 py-0.5 rounded-full bg-sunset text-white">Selected</span>}
                        </div>
                        {showAllParks && park && (
                          <p className="text-xs text-night/40 flex items-center gap-1 mb-1">
                            <MapPin className="w-3 h-3" />{park.name}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-night/50">
                          <span className="flex items-center gap-1"><Ruler className="w-3 h-3" />{a.distance} mi</span>
                          <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />{a.elevationGain.toLocaleString()} ft</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{a.duration}</span>
                        </div>
                        <p className="text-xs text-night/40 mt-1 line-clamp-2">{a.description}</p>
                        {a.permitRequired && (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 mt-1 rounded-full bg-red-100 text-red-600">⚠️ Permit Required</span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
              {filteredActivities.length === 0 && (
                <div className="text-center py-8 text-night/40 text-sm">
                  No activities found. Try different filters or enable "Show all parks".
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 flex items-center justify-between flex-shrink-0">
          <p className="text-xs text-night/40">
            {selectedActivity ? `${activityTypeEmoji[selectedActivity.type]} ${selectedActivity.name}` : "Select an activity"}
          </p>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-medium text-night/60 hover:bg-gray-100 transition-colors">Cancel</button>
            <button
              onClick={handleSave}
              disabled={!selectedActivity}
              className="px-6 py-2.5 rounded-xl text-sm font-medium bg-forest text-white hover:bg-forest-light transition-colors shadow-md disabled:opacity-40"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
