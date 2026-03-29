"use client";

import { useState } from "react";
import {
  X, StickyNote, MapPin, Compass, Clock, FileText,
} from "lucide-react";
import type { ItinerarySlot, TimeSlot, SlotType } from "@/data/mockData";

interface AddEventModalProps {
  onAdd: (slot: ItinerarySlot) => void;
  onClose: () => void;
}

const timeSlotOptions: { value: TimeSlot; label: string; emoji: string }[] = [
  { value: "morning", label: "Morning", emoji: "🌅" },
  { value: "afternoon", label: "Afternoon", emoji: "☀️" },
  { value: "evening", label: "Evening", emoji: "🌙" },
];

const durationPresets = [
  "30 min", "1 hour", "1-2 hours", "2-3 hours", "3-4 hours", "Half day", "Full day",
];

export default function AddEventModal({ onAdd, onClose }: AddEventModalProps) {
  const [eventType, setEventType] = useState<SlotType>("note");
  const [title, setTitle] = useState("");
  const [timeSlot, setTimeSlot] = useState<TimeSlot>("morning");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [duration, setDuration] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  const handleAdd = () => {
    if (!title.trim()) return;

    const slot: ItinerarySlot = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      activityId: "",
      timeSlot,
      slotType: eventType,
      customTitle: title,
      customDuration: duration || undefined,
      customLocation: location || undefined,
      notes: notes || undefined,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
    };

    onAdd(slot);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-night">Add Event</h3>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-night/40"><X className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-5">
          {/* Event Type */}
          <div>
            <label className="text-sm font-semibold text-night mb-2 block">What kind of event?</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setEventType("note")}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  eventType === "note"
                    ? "border-purple-300 bg-purple-50 ring-2 ring-offset-1 ring-purple-200"
                    : "border-gray-100 hover:border-gray-200"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <StickyNote className="w-5 h-5 text-purple-500" />
                  <span className="text-sm font-medium text-night">Note / Reminder</span>
                </div>
                <p className="text-[11px] text-night/50">A reminder, note, or to-do for this day</p>
              </button>
              <button
                onClick={() => setEventType("destination")}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  eventType === "destination"
                    ? "border-lake bg-blue-50 ring-2 ring-offset-1 ring-blue-200"
                    : "border-gray-100 hover:border-gray-200"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Compass className="w-5 h-5 text-lake" />
                  <span className="text-sm font-medium text-night">Destination / Stop</span>
                </div>
                <p className="text-[11px] text-night/50">A place to visit, viewpoint, or custom stop</p>
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-medium text-night/60 mb-1 block">
              {eventType === "note" ? "Note title" : "Destination name"}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest focus:border-forest"
              placeholder={eventType === "note" ? "e.g. Pick up firewood, Call about reservation..." : "e.g. Glacier Point Overlook, Mariposa Grove..."}
              autoFocus
            />
          </div>

          {/* Time Slot */}
          <div>
            <label className="text-xs font-medium text-night/60 mb-1 block">Time of day</label>
            <div className="flex gap-2">
              {timeSlotOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTimeSlot(opt.value)}
                  className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
                    timeSlot === opt.value
                      ? "border-forest bg-forest/5 text-forest"
                      : "border-gray-100 text-night/50 hover:border-gray-200"
                  }`}
                >
                  {opt.emoji} {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Start/End Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-night/60 mb-1 block">Start time (optional)</label>
              <input
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest focus:border-forest"
                placeholder="e.g. 2:00 PM"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-night/60 mb-1 block">End time (optional)</label>
              <input
                type="text"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest focus:border-forest"
                placeholder="e.g. 3:30 PM"
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="text-xs font-medium text-night/60 mb-1 block">Estimated duration</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {durationPresets.map((d) => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${
                    duration === d
                      ? "bg-forest/10 border-forest text-forest font-medium"
                      : "bg-gray-50 border-gray-200 text-night/60 hover:bg-gray-100"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest focus:border-forest"
              placeholder="Or type custom duration..."
            />
          </div>

          {/* Location (for destinations) */}
          {eventType === "destination" && (
            <div>
              <label className="text-xs font-medium text-night/60 mb-1 block">Location / Address</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest focus:border-forest"
                placeholder="e.g. Glacier Point Road, Yosemite"
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="text-xs font-medium text-night/60 mb-1 block">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-forest focus:border-forest resize-none"
              placeholder="Any extra details..."
            />
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
            onClick={handleAdd}
            disabled={!title.trim()}
            className="px-6 py-2.5 rounded-xl text-sm font-medium bg-forest text-white hover:bg-forest-light transition-colors shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Add to Day
          </button>
        </div>
      </div>
    </div>
  );
}
