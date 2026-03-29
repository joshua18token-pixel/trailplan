"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search, Calendar, Users, Baby, Dog, ChevronRight, ChevronLeft,
  Mountain, Tent, Hotel, Zap, DollarSign, Sparkles, MapPin, TreePine,
  Navigation, Plus, X, Loader2,
} from "lucide-react";
import StepIndicator from "@/components/StepIndicator";
import ParkSearch from "@/components/ParkSearch";

const STEPS = ["Destination", "Dates & Group", "Activities", "Preferences"];

const activityOptions = [
  { id: "hiking", label: "Hiking", emoji: "🥾" },
  { id: "biking", label: "Biking", emoji: "🚴" },
  { id: "fishing", label: "Fishing", emoji: "🎣" },
  { id: "kayaking", label: "Kayaking", emoji: "🛶" },
  { id: "sightseeing", label: "Sightseeing", emoji: "📸" },
  { id: "camping", label: "Camping", emoji: "⛺" },
  { id: "wildlife watching", label: "Wildlife", emoji: "🦌" },
  { id: "horseback riding", label: "Horseback", emoji: "🐴" },
  { id: "rock climbing", label: "Climbing", emoji: "🧗" },
  { id: "swimming", label: "Swimming", emoji: "🏊" },
];

const fitnessLevels = [
  { id: "easy", label: "Easy", desc: "Gentle trails, short distances" },
  { id: "moderate", label: "Moderate", desc: "Some elevation, 5-10 miles" },
  { id: "hard", label: "Hard", desc: "Steep, long days, 10+ miles" },
  { id: "expert", label: "Expert", desc: "Technical, strenuous, multi-day" },
];

interface SelectedPark {
  id: string;
  name: string;
  fullName: string;
  type: string;
  state: string;
  description: string;
  coordinates: { lat: number; lng: number };
  image?: string;
  activities: string[];
  bestSeason: string;
}

const typeLabels: Record<string, string> = {
  national_park: "National Park",
  state_park: "State Park",
  national_forest: "National Forest",
  monument: "Monument",
  recreation_area: "Recreation Area",
  other: "Park",
};

function TripWizardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const parkParam = searchParams.get("park");

  const [step, setStep] = useState(0);
  const [mainPark, setMainPark] = useState<SelectedPark | null>(null);
  const [nearbyParks, setNearbyParks] = useState<SelectedPark[]>([]);
  const [additionalParks, setAdditionalParks] = useState<SelectedPark[]>([]);
  const [loadingNearby, setLoadingNearby] = useState(false);
  const [showAddPark, setShowAddPark] = useState(false);

  const [adults, setAdults] = useState(2);
  const [kids, setKids] = useState(0);
  const [pets, setPets] = useState(false);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [fitness, setFitness] = useState("moderate");
  const [lodging, setLodging] = useState("hotel");
  const [pace, setPace] = useState("balanced");
  const [budget, setBudget] = useState("moderate");

  // Load park from URL param
  useEffect(() => {
    if (parkParam && !mainPark) {
      fetch(`/api/parks/search?q=${encodeURIComponent(parkParam)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.results?.length > 0) {
            handleSelectPark(data.results[0]);
          }
        })
        .catch(() => {});
    }
  }, [parkParam]);

  const handleSelectPark = async (park: SelectedPark) => {
    setMainPark(park);
    // Auto-select activities that match the park
    if (park.activities?.length) {
      setSelectedActivities(park.activities.filter((a) =>
        activityOptions.some((opt) => opt.id === a)
      ));
    }
    // Fetch nearby parks
    await fetchNearbyParks(park);
  };

  const fetchNearbyParks = async (park: SelectedPark) => {
    if (!park.coordinates?.lat) return;
    setLoadingNearby(true);
    try {
      // Search for parks in the same state
      const res = await fetch(`/api/parks/search?q=${encodeURIComponent(park.state)}`);
      const data = await res.json();
      // Filter out the main park and limit to 4
      const nearby = (data.results || [])
        .filter((p: SelectedPark) => p.id !== park.id)
        .slice(0, 4);
      setNearbyParks(nearby);
    } catch {
      setNearbyParks([]);
    } finally {
      setLoadingNearby(false);
    }
  };

  const addParkToTrip = (park: SelectedPark) => {
    if (!additionalParks.find((p) => p.id === park.id)) {
      setAdditionalParks([...additionalParks, park]);
    }
  };

  const removeParkFromTrip = (parkId: string) => {
    setAdditionalParks(additionalParks.filter((p) => p.id !== parkId));
  };

  const toggleActivity = (id: string) => {
    setSelectedActivities((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const canProceed = () => {
    if (step === 0) return mainPark !== null;
    return true;
  };

  const handleBuild = () => {
    // For now, route to the demo itinerary
    // In production, this would create a real trip with the selected parks
    router.push("/trip/yosemite-adventure");
  };

  const allTripParks = mainPark ? [mainPark, ...additionalParks] : [];

  return (
    <div className="min-h-screen bg-cream py-6 sm:py-12">
      <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-night">Create Your Trip</h1>
          <p className="mt-2 text-sm sm:text-base text-night/60">Tell us what you&apos;re looking for and we&apos;ll build the perfect itinerary</p>
        </div>

        {/* Step Indicator */}
        <div className="mb-8 sm:mb-10">
          <StepIndicator steps={STEPS} currentStep={step} />
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-10 min-h-[400px]">
          {/* Step 1: Destination */}
          {step === 0 && (
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-night mb-2">Where do you want to go?</h2>
              <p className="text-sm sm:text-base text-night/60 mb-6">Search for any park, trail, or destination — we&apos;ll find it</p>

              {/* Main Park Selection */}
              {!mainPark ? (
                <ParkSearch
                  placeholder="Search any park, trail, or destination..."
                  onSelect={handleSelectPark}
                  className="max-w-2xl"
                />
              ) : (
                <div className="space-y-6">
                  {/* Selected Main Park Card */}
                  <div className="border-2 border-forest rounded-2xl overflow-hidden bg-forest/5">
                    <div className="p-4 sm:p-5">
                      <div className="flex items-start gap-4">
                        {mainPark.image ? (
                          <img src={mainPark.image} alt={mainPark.name} className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-forest/10 flex items-center justify-center flex-shrink-0">
                            <TreePine className="w-8 h-8 text-forest" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-bold text-lg text-night">{mainPark.fullName}</h3>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-forest text-white font-medium">MAIN DESTINATION</span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs px-2 py-0.5 rounded-full bg-forest/10 text-forest">{typeLabels[mainPark.type] || mainPark.type}</span>
                                <span className="text-xs text-night/40 flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />{mainPark.state}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => { setMainPark(null); setNearbyParks([]); setAdditionalParks([]); }}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-night/30 hover:text-red-500 transition-colors"
                              title="Change destination"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-sm text-night/60 mt-2 line-clamp-2">{mainPark.description}</p>
                          {mainPark.bestSeason && (
                            <p className="text-xs text-night/40 mt-1.5">📅 Best season: {mainPark.bestSeason}</p>
                          )}
                          {mainPark.activities?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {mainPark.activities.slice(0, 6).map((a) => (
                                <span key={a} className="text-xs px-2 py-0.5 rounded-full bg-cream text-night/60">{a}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Parks Added */}
                  {additionalParks.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-night/50 mb-3">Also visiting:</h3>
                      <div className="space-y-2">
                        {additionalParks.map((park) => (
                          <div key={park.id} className="flex items-center gap-3 p-3 rounded-xl border border-cream-dark bg-cream/50">
                            {park.image ? (
                              <img src={park.image} alt={park.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-forest/10 flex items-center justify-center flex-shrink-0">
                                <TreePine className="w-4 h-4 text-forest" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <span className="font-medium text-sm text-night">{park.fullName}</span>
                              <span className="text-xs text-night/40 ml-2">{park.state}</span>
                            </div>
                            <button
                              onClick={() => removeParkFromTrip(park.id)}
                              className="p-1 rounded-lg hover:bg-red-50 text-night/30 hover:text-red-500 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Nearby Parks Suggestions */}
                  {nearbyParks.length > 0 && (
                    <div className="pt-4 border-t border-gray-100">
                      <h3 className="text-sm font-semibold text-night mb-1 flex items-center gap-2">
                        <Navigation className="w-4 h-4 text-lake" />
                        Nearby parks to add
                      </h3>
                      <p className="text-xs text-night/40 mb-3">Optionally add more destinations to your trip</p>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {nearbyParks
                          .filter((p) => !additionalParks.find((ap) => ap.id === p.id))
                          .map((park) => (
                          <button
                            key={park.id}
                            onClick={() => addParkToTrip(park)}
                            className="flex items-center gap-3 p-3 rounded-xl border border-cream-dark hover:border-forest/30 hover:bg-forest/5 transition-all text-left group"
                          >
                            {park.image ? (
                              <img src={park.image} alt={park.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-forest/10 flex items-center justify-center flex-shrink-0">
                                <TreePine className="w-5 h-5 text-forest" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm text-night truncate">{park.fullName}</div>
                              <div className="text-xs text-night/40">{typeLabels[park.type] || park.type}</div>
                            </div>
                            <Plus className="w-5 h-5 text-forest opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {loadingNearby && (
                    <div className="flex items-center gap-2 text-sm text-night/40 pt-4">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Finding nearby parks...
                    </div>
                  )}

                  {/* Search for More */}
                  <div className="pt-4 border-t border-gray-100">
                    {showAddPark ? (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-medium text-night/60">Search for another park to add:</h3>
                          <button onClick={() => setShowAddPark(false)} className="text-xs text-night/40 hover:text-night">Cancel</button>
                        </div>
                        <ParkSearch
                          placeholder="Search for another park..."
                          onSelect={(park) => { addParkToTrip(park as SelectedPark); setShowAddPark(false); }}
                          className="max-w-xl"
                        />
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowAddPark(true)}
                        className="flex items-center gap-2 text-sm text-forest hover:text-forest-light font-medium transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Add another park to this trip
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Dates & Group */}
          {step === 1 && (
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-night mb-2">When & who?</h2>
              <p className="text-sm sm:text-base text-night/60 mb-8">Set your travel dates and group size</p>

              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-night mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Start Date
                  </label>
                  <input
                    type="date"
                    defaultValue="2025-07-14"
                    className="w-full px-4 py-3 rounded-xl border border-cream-dark focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-night mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    End Date
                  </label>
                  <input
                    type="date"
                    defaultValue="2025-07-18"
                    className="w-full px-4 py-3 rounded-xl border border-cream-dark focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest"
                  />
                </div>
              </div>

              {/* Trip summary bar */}
              {allTripParks.length > 0 && (
                <div className="mb-6 p-3 rounded-xl bg-cream flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-medium text-night/50">Trip parks:</span>
                  {allTripParks.map((p) => (
                    <span key={p.id} className="text-xs px-2 py-1 rounded-lg bg-white border border-cream-dark text-night/70 font-medium">
                      {p.name}
                    </span>
                  ))}
                </div>
              )}

              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center justify-between p-4 rounded-xl bg-cream">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-forest" />
                    <div>
                      <div className="font-medium text-night">Adults</div>
                      <div className="text-xs text-night/50">Ages 13+</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setAdults(Math.max(1, adults - 1))} className="w-8 h-8 rounded-full bg-white border border-cream-dark flex items-center justify-center hover:bg-forest hover:text-white hover:border-forest transition-colors font-bold">−</button>
                    <span className="w-8 text-center font-bold text-night">{adults}</span>
                    <button onClick={() => setAdults(adults + 1)} className="w-8 h-8 rounded-full bg-white border border-cream-dark flex items-center justify-center hover:bg-forest hover:text-white hover:border-forest transition-colors font-bold">+</button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-cream">
                  <div className="flex items-center gap-3">
                    <Baby className="w-5 h-5 text-lake" />
                    <div>
                      <div className="font-medium text-night">Kids</div>
                      <div className="text-xs text-night/50">Ages 0-12</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setKids(Math.max(0, kids - 1))} className="w-8 h-8 rounded-full bg-white border border-cream-dark flex items-center justify-center hover:bg-forest hover:text-white hover:border-forest transition-colors font-bold">−</button>
                    <span className="w-8 text-center font-bold text-night">{kids}</span>
                    <button onClick={() => setKids(kids + 1)} className="w-8 h-8 rounded-full bg-white border border-cream-dark flex items-center justify-center hover:bg-forest hover:text-white hover:border-forest transition-colors font-bold">+</button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-cream">
                  <div className="flex items-center gap-3">
                    <Dog className="w-5 h-5 text-sunset" />
                    <div>
                      <div className="font-medium text-night">Bringing pets?</div>
                      <div className="text-xs text-night/50">We&apos;ll filter for pet-friendly trails</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setPets(!pets)}
                    className={`w-12 h-7 rounded-full transition-colors ${pets ? "bg-forest" : "bg-cream-dark"} relative`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-1 transition-transform ${pets ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Activities */}
          {step === 2 && (
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-night mb-2">What do you want to do?</h2>
              <p className="text-sm sm:text-base text-night/60 mb-8">Select activities and your fitness level</p>

              {/* Pre-selected from park */}
              {mainPark?.activities && mainPark.activities.length > 0 && (
                <div className="mb-4 p-3 rounded-xl bg-forest/5 border border-forest/10">
                  <p className="text-xs text-forest font-medium">✨ We pre-selected activities available at {mainPark.name}. Adjust as you like!</p>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-10">
                {activityOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => toggleActivity(opt.id)}
                    className={`p-3 sm:p-4 rounded-xl border-2 text-center transition-all duration-200 ${
                      selectedActivities.includes(opt.id)
                        ? "border-forest bg-forest/5 shadow-md"
                        : "border-cream-dark hover:border-forest/30"
                    }`}
                  >
                    <span className="text-2xl sm:text-3xl">{opt.emoji}</span>
                    <div className="mt-1.5 sm:mt-2 font-medium text-xs sm:text-sm text-night">{opt.label}</div>
                  </button>
                ))}
              </div>

              <h3 className="text-lg font-bold text-night mb-4">Fitness Level</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {fitnessLevels.map((fl) => (
                  <button
                    key={fl.id}
                    onClick={() => setFitness(fl.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                      fitness === fl.id
                        ? "border-sunset bg-sunset/5 shadow-md"
                        : "border-cream-dark hover:border-sunset/30"
                    }`}
                  >
                    <div className="font-semibold text-night">{fl.label}</div>
                    <div className="text-sm text-night/50 mt-0.5">{fl.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Preferences */}
          {step === 3 && (
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-night mb-2">Final preferences</h2>
              <p className="text-sm sm:text-base text-night/60 mb-8">Help us tailor your perfect trip</p>

              {/* Trip Overview */}
              {allTripParks.length > 0 && (
                <div className="mb-6 p-4 rounded-xl bg-cream border border-cream-dark">
                  <h4 className="text-xs font-semibold text-night/50 mb-2">YOUR TRIP</h4>
                  <div className="flex flex-wrap gap-2">
                    {allTripParks.map((p, i) => (
                      <span key={p.id} className="flex items-center gap-1.5 text-sm">
                        {i > 0 && <span className="text-night/30">→</span>}
                        <span className="font-medium text-night">{p.name}</span>
                        <span className="text-xs text-night/30">({typeLabels[p.type] || p.type})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-bold text-night mb-4 flex items-center gap-2">
                    <Hotel className="w-5 h-5 text-lake" />
                    Lodging
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: "camping", label: "Camping", icon: <Tent className="w-6 h-6" /> },
                      { id: "hotel", label: "Hotel / Lodge", icon: <Hotel className="w-6 h-6" /> },
                      { id: "mixed", label: "Mix of both", icon: <Mountain className="w-6 h-6" /> },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setLodging(opt.id)}
                        className={`p-3 sm:p-4 rounded-xl border-2 text-center transition-all duration-200 ${
                          lodging === opt.id ? "border-lake bg-lake/5 shadow-md" : "border-cream-dark hover:border-lake/30"
                        }`}
                      >
                        <div className="flex justify-center text-lake mb-2">{opt.icon}</div>
                        <div className="text-xs sm:text-sm font-medium text-night">{opt.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-night mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-sunset" />
                    Pace
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: "relaxed", label: "Relaxed", desc: "Lots of free time" },
                      { id: "balanced", label: "Balanced", desc: "Mix of activity & rest" },
                      { id: "packed", label: "Action-Packed", desc: "Every hour planned" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setPace(opt.id)}
                        className={`p-3 sm:p-4 rounded-xl border-2 text-center transition-all duration-200 ${
                          pace === opt.id ? "border-sunset bg-sunset/5 shadow-md" : "border-cream-dark hover:border-sunset/30"
                        }`}
                      >
                        <div className="font-medium text-xs sm:text-sm text-night">{opt.label}</div>
                        <div className="text-[10px] sm:text-xs text-night/50 mt-1">{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-night mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-trail" />
                    Budget
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: "budget", label: "Budget", desc: "$50-100/day" },
                      { id: "moderate", label: "Moderate", desc: "$100-250/day" },
                      { id: "luxury", label: "Luxury", desc: "$250+/day" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setBudget(opt.id)}
                        className={`p-3 sm:p-4 rounded-xl border-2 text-center transition-all duration-200 ${
                          budget === opt.id ? "border-trail bg-trail/5 shadow-md" : "border-cream-dark hover:border-trail/30"
                        }`}
                      >
                        <div className="font-medium text-xs sm:text-sm text-night">{opt.label}</div>
                        <div className="text-[10px] sm:text-xs text-night/50 mt-1">{opt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="mt-6 flex justify-between">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-xl font-medium transition-all ${
              step === 0 ? "invisible" : "text-night/60 hover:text-night hover:bg-white"
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>
          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-6 sm:px-8 py-3 rounded-xl bg-forest text-white font-medium hover:bg-forest-light transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
            >
              Continue
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleBuild}
              className="flex items-center gap-2 px-6 sm:px-8 py-3 rounded-xl bg-gradient-to-r from-sunset to-sunset-light text-white font-bold hover:shadow-xl transition-all shadow-md"
            >
              <Sparkles className="w-5 h-5" />
              Build My Trip
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TripWizardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream flex items-center justify-center"><Loader2 className="w-8 h-8 text-forest animate-spin" /></div>}>
      <TripWizardContent />
    </Suspense>
  );
}
