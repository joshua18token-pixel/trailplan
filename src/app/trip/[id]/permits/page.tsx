"use client";

import { use } from "react";
import Link from "next/link";
import {
  ArrowLeft, Shield, CheckCircle2, Clock, AlertTriangle,
  ExternalLink, Bell, Calendar,
} from "lucide-react";
import { itineraries, permits, getActivityById, getParkById } from "@/data/mockData";

const statusConfig = {
  obtained: { bg: "bg-trail/10", text: "text-trail", icon: <CheckCircle2 className="w-5 h-5" />, label: "Obtained" },
  "not-yet": { bg: "bg-sunset/10", text: "text-sunset", icon: <Clock className="w-5 h-5" />, label: "Not Yet" },
  lottery: { bg: "bg-gold/10", text: "text-gold", icon: <AlertTriangle className="w-5 h-5" />, label: "Lottery" },
};

export default function PermitsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const itinerary = itineraries.find((i) => i.id === id) || itineraries[0];
  const park = getParkById(itinerary.parkId);

  // Get relevant permits
  const tripActivityIds = itinerary.days.flatMap((d) => d.slots.map((s) => s.activityId));
  const requiredPermits = permits.filter((p) => p.required && tripActivityIds.includes(p.activityId || ""));
  const recommendedPermits = permits.filter((p) => !tripActivityIds.includes(p.activityId || "")).slice(0, 3);

  // Timeline events
  const timelineEvents = permits
    .filter((p) => p.lotteryDate || p.deadlineDate)
    .map((p) => ({
      date: p.lotteryDate || p.deadlineDate || "",
      label: p.lotteryDate ? `Lottery opens: ${p.name}` : `Deadline: ${p.name}`,
      type: p.lotteryDate ? ("lottery" as const) : ("deadline" as const),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-white border-b border-cream-dark">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href={`/trip/${id}`}
            className="inline-flex items-center gap-2 text-sm text-night/50 hover:text-forest transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {itinerary.name}
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-night flex items-center gap-3">
                <Shield className="w-7 h-7 text-sunset" />
                Permits & Reservations
              </h1>
              <p className="mt-1 text-night/60">
                {park?.name} · {itinerary.days.length}-day trip
              </p>
            </div>
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sunset text-white font-medium hover:bg-sunset-light transition-colors shadow-md">
              <Bell className="w-4 h-4" />
              Set Reminders
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Required Permits */}
        <section>
          <h2 className="text-xl font-bold text-night mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-sunset" />
            Required for Your Trip
          </h2>
          {requiredPermits.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 shadow-md text-center text-night/40">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-trail" />
              <p className="font-medium">No permits required for your selected activities!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requiredPermits.map((permit) => {
                const activity = getActivityById(permit.activityId || "");
                const sc = statusConfig[permit.status];
                return (
                  <div key={permit.id} className="bg-white rounded-2xl p-6 shadow-md">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-10 h-10 rounded-xl ${sc.bg} ${sc.text} flex items-center justify-center`}>
                            {sc.icon}
                          </div>
                          <div>
                            <h3 className="font-bold text-night">{permit.name}</h3>
                            {activity && <p className="text-sm text-night/50">For: {activity.name}</p>}
                          </div>
                        </div>
                        <p className="text-sm text-night/60 mb-3">{permit.notes}</p>
                        <div className="flex flex-wrap gap-3">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${sc.bg} ${sc.text}`}>
                            {sc.icon}
                            {sc.label}
                          </span>
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-cream text-night/60">
                            💰 {permit.cost}
                          </span>
                          {permit.deadlineDate && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-sunset/10 text-sunset">
                              <Calendar className="w-3.5 h-3.5" />
                              Deadline: {permit.deadlineDate}
                            </span>
                          )}
                        </div>
                      </div>
                      <a
                        href={permit.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-forest text-white text-sm font-medium hover:bg-forest-light transition-colors shrink-0"
                      >
                        Apply
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Timeline */}
        {timelineEvents.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-night mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-lake" />
              Key Dates Timeline
            </h2>
            <div className="bg-white rounded-2xl p-6 shadow-md">
              <div className="relative">
                <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-cream-dark" />
                <div className="space-y-6">
                  {timelineEvents.map((event, i) => (
                    <div key={i} className="relative flex items-start gap-4 pl-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${
                        event.type === "lottery" ? "bg-gold text-white" : "bg-sunset text-white"
                      }`}>
                        {event.type === "lottery" ? "🎲" : "📅"}
                      </div>
                      <div>
                        <p className="font-medium text-night text-sm">{event.label}</p>
                        <p className="text-xs text-night/50">{event.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Recommended */}
        <section>
          <h2 className="text-xl font-bold text-night mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-trail" />
            Recommended Permits
          </h2>
          <div className="space-y-3">
            {recommendedPermits.map((permit) => {
              const sc = statusConfig[permit.status];
              return (
                <div key={permit.id} className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg ${sc.bg} ${sc.text} flex items-center justify-center`}>
                      {sc.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-night text-sm">{permit.name}</h3>
                      <p className="text-xs text-night/50">{permit.cost}</p>
                    </div>
                  </div>
                  <a
                    href={permit.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-forest font-medium hover:underline flex items-center gap-1"
                  >
                    Details <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
