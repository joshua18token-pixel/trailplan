"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MapPin, Calendar, Users, ThumbsUp, MessageCircle, Copy,
  ArrowLeft, Share2, Eye, Clock, Mountain, ChevronRight,
  Star, Bookmark, Flag,
} from "lucide-react";

// Same data as community page — in production this would be an API call
const communityTrips: Record<string, any> = {
  "1": {
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
    description: "Perfect family trip to Yosemite — kid-friendly hikes, waterfalls, and stargazing. We did Half Dome views without the strenuous climb! Highlights include Mirror Lake trail (flat, great for toddlers), the Valley View loop, and an evening ranger program. We packed lunches every day which saved money and time.",
    coverImage: "https://images.unsplash.com/photo-1562310503-a918c4c61e38?w=1200&q=80",
    tags: ["family-friendly", "waterfalls", "camping", "beginner"],
    days: [
      { label: "Day 1 — Arrival & Valley Floor", highlights: ["Check into Curry Village", "Valley View loop walk (1.5 mi)", "Evening ranger talk at campfire"], meals: "Dinner at Degnan's Kitchen" },
      { label: "Day 2 — Waterfalls Day", highlights: ["Lower Yosemite Falls trail (easy)", "Bridalveil Fall viewpoint", "Swim at Merced River beach"], meals: "Packed picnic lunch" },
      { label: "Day 3 — Mirror Lake & Meadows", highlights: ["Mirror Lake loop (5 mi, flat)", "Yosemite Museum & Indian Village", "Junior Ranger program for kids"], meals: "Pizza at Degnan's" },
      { label: "Day 4 — Glacier Point", highlights: ["Drive to Glacier Point (1hr)", "Taft Point trail (2.2 mi)", "Sunset at Glacier Point"], meals: "Packed lunch, campfire dinner" },
      { label: "Day 5 — Departure", highlights: ["Tunnel View photo stop", "Mariposa Grove of Giant Sequoias", "Depart via Hwy 41"], meals: "Breakfast at lodge" },
    ],
    tips: [
      "Book Curry Village cabins 6+ months ahead in summer",
      "The Valley shuttle is free and runs every 20 min — use it!",
      "Mirror Lake is best visited early morning for reflections",
      "Pack layers — it can be 90°F in the valley and 50°F at Glacier Point",
      "The Junior Ranger program is free and kids love the badges",
    ],
    gear: ["Comfortable walking shoes", "Sunscreen SPF 50+", "Reusable water bottles", "Picnic blanket", "Headlamps for evening programs"],
  },
  "3": {
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
    description: "A week-long road trip through Florida's best parks. Ancient oaks draped in Spanish moss, alligator encounters, and the most incredible sunsets over the Everglades. We brought our own bikes and rented kayaks at each stop. The October timing was perfect — fewer mosquitoes, lower humidity, and affordable campsite rates.",
    coverImage: "https://images.unsplash.com/photo-1590517862150-888cd521cc90?w=1200&q=80",
    tags: ["road-trip", "wildlife", "kayaking", "beginner", "florida"],
    days: [
      { label: "Day 1 — Highlands Hammock", highlights: ["Ancient Hammock Trail (boardwalk)", "Bike the 3-mile loop road", "Catfish Creek Preserve hike"], meals: "Camp dinner" },
      { label: "Day 2 — Highlands Hammock", highlights: ["Cypress Swamp Trail", "Fern Garden boardwalk", "Wildlife observation tower"], meals: "Lunch at Sebring restaurant" },
      { label: "Day 3 — Drive to Myakka River", highlights: ["2-hour drive south", "Canopy Walkway (74 ft up!)", "Myakka River kayaking"], meals: "Packed lunch, camp dinner" },
      { label: "Day 4 — Myakka River", highlights: ["Airboat tour on Upper Myakka Lake", "Bird watching (roseate spoonbills!)", "Deep Hole swimming"], meals: "Camp breakfast and dinner" },
      { label: "Day 5 — Drive to Everglades", highlights: ["3-hour drive south", "Shark Valley Visitor Center", "15-mile Shark Valley bike loop"], meals: "Dinner in Homestead" },
      { label: "Day 6 — Everglades", highlights: ["Anhinga Trail (gators everywhere)", "Kayak Nine Mile Pond", "Sunset at Flamingo"], meals: "Packed lunch" },
      { label: "Day 7 — Everglades & Departure", highlights: ["Pa-hay-okee Overlook", "Mahogany Hammock Trail", "Drive home"], meals: "Breakfast at camp" },
    ],
    tips: [
      "October-April is best — summer is brutal with heat and mosquitoes",
      "Highlands Hammock has full-hookup RV sites if you need them",
      "Rent kayaks at Myakka River outpost — $40/half-day for a tandem",
      "Bring binoculars — the birdlife in Myakka is incredible",
      "Shark Valley bike loop is flat but 15 miles — bring water!",
      "Book Everglades campsites at recreation.gov early",
    ],
    gear: ["Bikes (or rent at the park)", "Kayak gear (or rent)", "Bug spray (serious amount)", "Binoculars", "Sun hat and sunscreen", "Waterproof phone case"],
  },
};

// Fallback for trips not in the detailed data
const fallbackTrip = {
  title: "Community Trip",
  author: "TrailPlan User",
  authorAvatar: "🏞️",
  parks: [],
  duration: 3,
  groupSize: "Group",
  activities: ["hiking", "sightseeing"],
  difficulty: "Moderate",
  votes: 0,
  views: 0,
  comments: 0,
  copies: 0,
  createdAt: "2025-01-01",
  description: "A community-shared trip itinerary.",
  coverImage: "",
  tags: [],
  days: [],
  tips: [],
  gear: [],
};

export default function CommunityTripDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const trip = communityTrips[id] || fallbackTrip;
  const [hasVoted, setHasVoted] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleUseTemplate = () => {
    // In production, this would copy the trip to the user's account
    // For prototype, save to localStorage and redirect to My Trips
    const templateTrip = {
      id: `template-${id}-${Date.now()}`,
      slug: `my-${trip.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      name: trip.title,
      parks: trip.parks,
      days: trip.days,
      settings: { activities: trip.activities, fitness: trip.difficulty.toLowerCase() },
      createdAt: new Date().toISOString(),
      fromTemplate: trip.title,
    };
    try {
      localStorage.setItem(`trailplan-trip-${templateTrip.slug}`, JSON.stringify(templateTrip));
    } catch {}
    setCopied(true);
    setTimeout(() => router.push("/my-trips"), 1500);
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      {trip.coverImage && (
        <div className="relative h-64 sm:h-80 lg:h-96">
          <img src={trip.coverImage} alt={trip.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
            <div className="max-w-4xl mx-auto">
              <Link href="/community" className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-3 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Community
              </Link>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white">{trip.title}</h1>
              <div className="flex items-center gap-4 mt-3 flex-wrap">
                {trip.parks.map((p: any) => (
                  <span key={p.name} className="text-sm text-white/80 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />{p.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Meta Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 text-sm text-night/50">
              <Calendar className="w-4 h-4" />{trip.duration} days
            </span>
            <span className="flex items-center gap-1.5 text-sm text-night/50">
              <Users className="w-4 h-4" />{trip.groupSize}
            </span>
            <span className="flex items-center gap-1.5 text-sm text-night/50">
              <Eye className="w-4 h-4" />{trip.views.toLocaleString()} views
            </span>
            <span className="flex items-center gap-1.5 text-sm text-night/50">
              <Copy className="w-4 h-4" />{trip.copies} copies
            </span>
            <span className="text-xs text-night/30">by {trip.authorAvatar} {trip.author}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setHasVoted(!hasVoted)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                hasVoted ? "bg-forest text-white" : "border border-cream-dark text-night/50 hover:bg-cream"
              }`}
            >
              <ThumbsUp className="w-4 h-4" /> {trip.votes + (hasVoted ? 1 : 0)}
            </button>
            <button
              onClick={handleUseTemplate}
              disabled={copied}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-medium transition-all shadow-md ${
                copied ? "bg-green-500 text-white" : "bg-sunset text-white hover:bg-sunset-light"
              }`}
            >
              {copied ? (
                <>✓ Added to My Trips</>
              ) : (
                <><Copy className="w-4 h-4" /> Use as Template</>
              )}
            </button>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl border border-cream-dark p-6 mb-6">
          <p className="text-night/70 text-sm sm:text-base leading-relaxed">{trip.description}</p>
          {trip.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {trip.tags.map((tag: string) => (
                <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-cream text-night/50">#{tag}</span>
              ))}
            </div>
          )}
        </div>

        {/* Day-by-Day Breakdown */}
        {trip.days?.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-night mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-forest" /> Day-by-Day Itinerary
            </h2>
            <div className="space-y-3">
              {trip.days.map((day: any, i: number) => (
                <div key={i} className="bg-white rounded-2xl border border-cream-dark p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-forest text-white flex items-center justify-center text-sm font-bold">
                      {i + 1}
                    </div>
                    <h3 className="font-semibold text-night">{day.label}</h3>
                  </div>
                  <ul className="space-y-1.5 ml-11">
                    {day.highlights?.map((h: string, j: number) => (
                      <li key={j} className="text-sm text-night/60 flex items-start gap-2">
                        <span className="text-forest mt-0.5">•</span>{h}
                      </li>
                    ))}
                  </ul>
                  {day.meals && (
                    <p className="ml-11 mt-2 text-xs text-night/40 flex items-center gap-1">
                      🍽️ {day.meals}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        {trip.tips?.length > 0 && (
          <div className="bg-white rounded-2xl border border-cream-dark p-6 mb-6">
            <h2 className="text-lg font-bold text-night mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-sunset" /> Pro Tips from {trip.author}
            </h2>
            <ul className="space-y-2">
              {trip.tips.map((tip: string, i: number) => (
                <li key={i} className="text-sm text-night/60 flex items-start gap-2">
                  <span className="text-sunset font-bold mt-0.5">💡</span>{tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Gear */}
        {trip.gear?.length > 0 && (
          <div className="bg-white rounded-2xl border border-cream-dark p-6 mb-6">
            <h2 className="text-lg font-bold text-night mb-4 flex items-center gap-2">
              🎒 Recommended Gear
            </h2>
            <div className="flex flex-wrap gap-2">
              {trip.gear.map((item: string, i: number) => (
                <span key={i} className="text-sm px-3 py-1.5 rounded-lg bg-cream text-night/60 border border-cream-dark">
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="text-center bg-gradient-to-r from-forest/5 to-trail/5 rounded-2xl p-8 border border-forest/10">
          <h3 className="text-lg font-bold text-night">Ready to make this trip your own?</h3>
          <p className="text-sm text-night/50 mt-1">Copy this template to your trips and customize every detail</p>
          <button
            onClick={handleUseTemplate}
            disabled={copied}
            className={`inline-flex items-center gap-2 mt-4 px-6 py-3 rounded-xl font-medium transition-all shadow-md ${
              copied ? "bg-green-500 text-white" : "bg-sunset text-white hover:bg-sunset-light"
            }`}
          >
            {copied ? "✓ Added to My Trips!" : <><Copy className="w-4 h-4" /> Use as Template — Add to My Trips</>}
          </button>
        </div>
      </div>
    </div>
  );
}
