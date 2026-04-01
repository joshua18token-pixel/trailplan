"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft, Shield, CheckCircle2, Clock, AlertTriangle,
  ExternalLink, Bell, Calendar, DollarSign, MapPin, Users,
  Info, Globe,
} from "lucide-react";
import { itineraries, permits, getActivityById, getParkById } from "@/data/mockData";

const statusConfig: Record<string, { bg: string; text: string; icon: React.ReactNode; label: string }> = {
  obtained: { bg: "bg-trail/10", text: "text-trail", icon: <CheckCircle2 className="w-5 h-5" />, label: "Obtained" },
  "not-yet": { bg: "bg-sunset/10", text: "text-sunset", icon: <Clock className="w-5 h-5" />, label: "Not Yet" },
  lottery: { bg: "bg-gold/10", text: "text-gold", icon: <AlertTriangle className="w-5 h-5" />, label: "Lottery" },
};

export default function PermitsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const mockItinerary = itineraries.find((i) => i.id === id);
  const [generatedTrip, setGeneratedTrip] = useState<any>(null);

  useEffect(() => {
    if (!mockItinerary) {
      try {
        const stored = localStorage.getItem(`parkplan-trip-${id}`);
        if (stored) setGeneratedTrip(JSON.parse(stored));
      } catch {}
    }
  }, [id, mockItinerary]);

  const isGenerated = !mockItinerary && generatedTrip;
  const tripName = mockItinerary?.name || generatedTrip?.name || "Your Trip";
  const parkName = mockItinerary
    ? getParkById(mockItinerary.parkId)?.name || "National Park"
    : generatedTrip?.parks?.[0]?.fullName || "Park";
  const parkState = generatedTrip?.parks?.[0]?.state || "";
  const parkType = generatedTrip?.parks?.[0]?.type || "national_park";
  const parkWebsite = generatedTrip?.parks?.[0]?.website;
  const parkActivities = generatedTrip?.parks?.[0]?.activities || [];

  // For mock trips, use the existing permit system
  if (mockItinerary) {
    const park = getParkById(mockItinerary.parkId);
    const tripActivityIds = mockItinerary.days.flatMap((d) => d.slots.map((s) => s.activityId));
    const requiredPermits = permits.filter((p) => p.required && tripActivityIds.includes(p.activityId || ""));
    const recommendedPermits = permits.filter((p) => !tripActivityIds.includes(p.activityId || "")).slice(0, 3);

    const timelineEvents = permits
      .filter((p) => p.lotteryDate || p.deadlineDate)
      .map((p) => ({
        date: p.lotteryDate || p.deadlineDate || "",
        label: p.lotteryDate ? `Lottery opens: ${p.name}` : `Deadline: ${p.name}`,
        type: p.lotteryDate ? "lottery" : "deadline",
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return (
      <div className="min-h-screen bg-cream">
        <div className="max-w-3xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
          <Link href={`/trip/${id}`} className="flex items-center gap-2 text-sm text-night/50 hover:text-night transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to {mockItinerary.name}
          </Link>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-night flex items-center gap-3">
                <Shield className="w-7 h-7 text-sunset" /> Permits & Reservations
              </h1>
              <p className="text-sm text-night/50 mt-1">{park?.name || "Park"} · {mockItinerary.days.length}-day trip</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sunset text-white font-medium text-sm hover:bg-sunset-light transition-colors">
              <Bell className="w-4 h-4" /> Set Reminders
            </button>
          </div>

          {requiredPermits.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-night mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-sunset" /> Required for Your Trip
              </h2>
              <div className="space-y-3">
                {requiredPermits.map((permit) => (
                  <div key={permit.id} className="bg-white rounded-2xl border border-cream-dark p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          {statusConfig[permit.status]?.icon}
                          <h3 className="font-semibold text-night">{permit.name}</h3>
                        </div>
                        <p className="text-xs text-night/40 mt-0.5">For: {getActivityById(permit.activityId || "")?.name || "Activity"}</p>
                        <p className="text-sm text-night/60 mt-2">{permit.notes}</p>
                        <div className="flex items-center gap-3 mt-3 flex-wrap">
                          {permit.status && (
                            <span className={`text-xs px-2.5 py-1 rounded-full ${statusConfig[permit.status]?.bg} ${statusConfig[permit.status]?.text}`}>
                              {statusConfig[permit.status]?.label}
                            </span>
                          )}
                          {permit.cost && <span className="text-xs text-night/50 flex items-center gap-1"><DollarSign className="w-3 h-3" />{permit.cost}</span>}
                          {permit.deadlineDate && <span className="text-xs text-red-500 flex items-center gap-1"><Calendar className="w-3 h-3" />Deadline: {permit.deadlineDate}</span>}
                        </div>
                      </div>
                      {permit.link && (
                        <a href={permit.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-night text-white text-sm font-medium hover:bg-night/80 transition-colors flex-shrink-0">
                          Apply <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {timelineEvents.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-night mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-lake" /> Key Dates Timeline
              </h2>
              <div className="bg-white rounded-2xl border border-cream-dark p-5 space-y-4">
                {timelineEvents.map((evt, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${evt.type === "lottery" ? "bg-gold/20" : "bg-red-100"}`}>
                      {evt.type === "lottery" ? "🎟️" : "📅"}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-night">{evt.label}</div>
                      <div className="text-xs text-night/40">{evt.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {recommendedPermits.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-night mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-trail" /> Recommended Permits
              </h2>
              <div className="space-y-3">
                {recommendedPermits.map((permit) => (
                  <div key={permit.id} className="bg-white rounded-2xl border border-cream-dark p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-trail/10 flex items-center justify-center">
                        <Clock className="w-4 h-4 text-trail" />
                      </div>
                      <div>
                        <div className="font-medium text-sm text-night">{permit.name}</div>
                        {permit.cost && <div className="text-xs text-night/40">{permit.cost}</div>}
                      </div>
                    </div>
                    {permit.link && (
                      <a href={permit.link} target="_blank" rel="noopener noreferrer" className="text-sm text-forest flex items-center gap-1 hover:underline">
                        Details <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Generated trip — show park info, fees, and relevant permit info
  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-3xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
        <Link href={`/trip/${id}`} className="flex items-center gap-2 text-sm text-night/50 hover:text-night transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to {tripName}
        </Link>

        {/* Park Information */}
        <div className="bg-white rounded-2xl border border-cream-dark p-6 mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-night flex items-center gap-3">
            <Info className="w-6 h-6 text-forest" /> Park Information
          </h1>
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-forest flex-shrink-0" />
              <div>
                <h2 className="font-semibold text-night">{parkName}</h2>
                <p className="text-xs text-night/40">{parkState} · {parkType === "state_park" ? "State Park" : parkType === "national_park" ? "National Park" : parkType.replace(/_/g, " ")}</p>
              </div>
            </div>

            {parkWebsite && (
              <a href={parkWebsite} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-forest hover:underline">
                <Globe className="w-4 h-4" /> Official Website <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Entry Fees */}
        <div className="bg-white rounded-2xl border border-cream-dark p-6 mb-6">
          <h2 className="text-lg font-bold text-night mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-sunset" /> Entry Fees & Costs
          </h2>

          {parkType === "state_park" ? (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-cream">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-night/40" />
                    <span className="text-sm font-medium text-night">Vehicle Entry Fee</span>
                  </div>
                  <span className="font-semibold text-night">$4 – $6</span>
                </div>
                <p className="text-xs text-night/40 mt-1 ml-8">Per vehicle, varies by park. Some parks charge per person instead.</p>
              </div>
              <div className="p-4 rounded-xl bg-cream">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-night/40" />
                    <span className="text-sm font-medium text-night">Pedestrian / Cyclist</span>
                  </div>
                  <span className="font-semibold text-night">$2 – $4</span>
                </div>
                <p className="text-xs text-night/40 mt-1 ml-8">Per person entering without a vehicle.</p>
              </div>
              {parkActivities.includes("camping") && (
                <div className="p-4 rounded-xl bg-cream">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">⛺</span>
                      <span className="text-sm font-medium text-night">Camping</span>
                    </div>
                    <span className="font-semibold text-night">$18 – $30/night</span>
                  </div>
                  <p className="text-xs text-night/40 mt-1 ml-8">Standard campsite. Electric/water hookups extra.</p>
                </div>
              )}
              {parkActivities.includes("kayaking") && (
                <div className="p-4 rounded-xl bg-cream">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">🛶</span>
                      <span className="text-sm font-medium text-night">Kayak / Canoe Rental</span>
                    </div>
                    <span className="font-semibold text-night">$25 – $50/half-day</span>
                  </div>
                  <p className="text-xs text-night/40 mt-1 ml-8">Available at park or nearby outfitters. Reserve ahead in busy season.</p>
                </div>
              )}
              {parkActivities.includes("horseback riding") && (
                <div className="p-4 rounded-xl bg-cream">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">🐴</span>
                      <span className="text-sm font-medium text-night">Horseback Riding</span>
                    </div>
                    <span className="font-semibold text-night">$40 – $80/hour</span>
                  </div>
                  <p className="text-xs text-night/40 mt-1 ml-8">Guided trail rides. Must book with local outfitter.</p>
                </div>
              )}
              {parkActivities.includes("biking") && (
                <div className="p-4 rounded-xl bg-cream">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">🚴</span>
                      <span className="text-sm font-medium text-night">Bike Rental</span>
                    </div>
                    <span className="font-semibold text-night">$15 – $35/day</span>
                  </div>
                  <p className="text-xs text-night/40 mt-1 ml-8">Available at park or nearby shops. Bring your own to save!</p>
                </div>
              )}
              <div className="p-4 rounded-xl bg-forest/5 border border-forest/10">
                <p className="text-xs text-forest font-medium">💡 Tip: Check if the park offers an annual pass — {parkState} state parks often have passes for $50-70/year that cover entry to all state parks.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-cream">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-night/40" />
                    <span className="text-sm font-medium text-night">Vehicle Entry (7-day pass)</span>
                  </div>
                  <span className="font-semibold text-night">$30 – $35</span>
                </div>
                <p className="text-xs text-night/40 mt-1 ml-8">Covers all passengers. Valid for 7 consecutive days.</p>
              </div>
              <div className="p-4 rounded-xl bg-cream">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-night/40" />
                    <span className="text-sm font-medium text-night">Per Person (walk-in / bike)</span>
                  </div>
                  <span className="font-semibold text-night">$15 – $20</span>
                </div>
                <p className="text-xs text-night/40 mt-1 ml-8">Ages 16+. Under 16 free. Valid for 7 days.</p>
              </div>
              <div className="p-4 rounded-xl bg-cream">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🏔️</span>
                    <span className="text-sm font-medium text-night">America the Beautiful Pass</span>
                  </div>
                  <span className="font-semibold text-night">$80/year</span>
                </div>
                <p className="text-xs text-night/40 mt-1 ml-8">Covers entry to ALL national parks and federal recreation areas for 1 year. Best value if visiting 3+ parks.</p>
              </div>
              <div className="p-4 rounded-xl bg-cream">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">👶</span>
                    <span className="text-sm font-medium text-night">Children</span>
                  </div>
                  <span className="font-semibold text-forest">Free</span>
                </div>
                <p className="text-xs text-night/40 mt-1 ml-8">Under 16 always free at National Parks.</p>
              </div>
            </div>
          )}
        </div>

        {/* Permits Info */}
        <div className="bg-white rounded-2xl border border-cream-dark p-6 mb-6">
          <h2 className="text-lg font-bold text-night mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-sunset" /> Permits & Reservations
          </h2>

          {parkType === "state_park" ? (
            <div className="space-y-3">
              <p className="text-sm text-night/60">
                Most state parks don&apos;t require permits for day use. However, you may need reservations for:
              </p>
              <div className="space-y-2">
                {parkActivities.includes("camping") && (
                  <div className="p-3 rounded-xl border border-cream-dark flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-night">⛺ Campsite Reservation</span>
                      <p className="text-xs text-night/40">Reserve at ReserveAmerica or the state parks website</p>
                    </div>
                    <a href={`https://www.google.com/search?q=${encodeURIComponent(parkName + " camping reservations")}`} target="_blank" rel="noopener noreferrer" className="text-xs text-forest flex items-center gap-1 hover:underline">
                      Search <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
                {(parkActivities.includes("kayaking") || parkActivities.includes("canoeing")) && (
                  <div className="p-3 rounded-xl border border-cream-dark flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-night">🛶 Paddle Rental Reservation</span>
                      <p className="text-xs text-night/40">Book ahead in peak season — popular parks sell out</p>
                    </div>
                    <a href={`https://www.google.com/search?q=${encodeURIComponent(parkName + " kayak rental")}`} target="_blank" rel="noopener noreferrer" className="text-xs text-forest flex items-center gap-1 hover:underline">
                      Search <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
                <div className="p-3 rounded-xl border border-cream-dark flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-night">📋 General Park Info</span>
                    <p className="text-xs text-night/40">Hours, rules, seasonal closures</p>
                  </div>
                  <a href={`https://www.google.com/search?q=${encodeURIComponent(parkName + " hours rules")}`} target="_blank" rel="noopener noreferrer" className="text-xs text-forest flex items-center gap-1 hover:underline">
                    Search <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-night/60">
                National parks may require permits for backcountry camping, specific hikes, or vehicle reservations. Check the official NPS page for current requirements.
              </p>
              <a href={`https://www.nps.gov/`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-forest text-white text-sm font-medium hover:bg-forest-light transition-colors">
                Check NPS.gov <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* Cost Estimate */}
        <div className="bg-gradient-to-r from-forest/5 to-trail/5 rounded-2xl p-6 border border-forest/10">
          <h2 className="text-lg font-bold text-night mb-2">💰 Estimated Trip Cost</h2>
          <p className="text-sm text-night/50 mb-4">Based on your trip settings (per person, approximate)</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl p-3 text-center">
              <div className="text-xs text-night/40">Entry</div>
              <div className="font-bold text-night mt-1">{parkType === "state_park" ? "$4-6" : "$15-35"}</div>
            </div>
            <div className="bg-white rounded-xl p-3 text-center">
              <div className="text-xs text-night/40">Lodging/Night</div>
              <div className="font-bold text-night mt-1">{generatedTrip?.settings?.lodging === "camping" ? "$18-30" : "$80-200"}</div>
            </div>
            <div className="bg-white rounded-xl p-3 text-center">
              <div className="text-xs text-night/40">Food/Day</div>
              <div className="font-bold text-night mt-1">{generatedTrip?.settings?.budget === "budget" ? "$20-40" : generatedTrip?.settings?.budget === "luxury" ? "$80-150" : "$40-80"}</div>
            </div>
            <div className="bg-white rounded-xl p-3 text-center">
              <div className="text-xs text-night/40">Activities</div>
              <div className="font-bold text-night mt-1">$0-50</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
