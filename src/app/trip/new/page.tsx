"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search, Calendar, Users, Baby, Dog, ChevronRight, ChevronLeft,
  Mountain, Tent, Hotel, Zap, DollarSign, Sparkles,
} from "lucide-react";
import StepIndicator from "@/components/StepIndicator";
import { parks, getActivityCountForPark } from "@/data/mockData";

const STEPS = ["Destination", "Dates & Group", "Activities", "Preferences"];

const activityOptions = [
  { id: "hiking", label: "Hiking", emoji: "🥾" },
  { id: "biking", label: "Biking", emoji: "🚴" },
  { id: "fishing", label: "Fishing", emoji: "🎣" },
  { id: "kayaking", label: "Kayaking", emoji: "🛶" },
  { id: "sightseeing", label: "Sightseeing", emoji: "📸" },
  { id: "camping", label: "Camping", emoji: "⛺" },
];

const fitnessLevels = [
  { id: "easy", label: "Easy", desc: "Gentle trails, short distances" },
  { id: "moderate", label: "Moderate", desc: "Some elevation, 5-10 miles" },
  { id: "hard", label: "Hard", desc: "Steep, long days, 10+ miles" },
  { id: "expert", label: "Expert", desc: "Technical, strenuous, multi-day" },
];

export default function TripWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [selectedPark, setSelectedPark] = useState<string | null>(null);
  const [adults, setAdults] = useState(2);
  const [kids, setKids] = useState(0);
  const [pets, setPets] = useState(false);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [fitness, setFitness] = useState("moderate");
  const [lodging, setLodging] = useState("hotel");
  const [pace, setPace] = useState("balanced");
  const [budget, setBudget] = useState("moderate");

  const toggleActivity = (id: string) => {
    setSelectedActivities((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const canProceed = () => {
    if (step === 0) return selectedPark !== null;
    return true;
  };

  const handleBuild = () => {
    router.push("/trip/yosemite-adventure");
  };

  return (
    <div className="min-h-screen bg-cream py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-night">Create Your Trip</h1>
          <p className="mt-2 text-night/60">Tell us what you&apos;re looking for and we&apos;ll build the perfect itinerary</p>
        </div>

        {/* Step Indicator */}
        <div className="mb-10">
          <StepIndicator steps={STEPS} currentStep={step} />
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-10 min-h-[400px]">
          {/* Step 1: Destination */}
          {step === 0 && (
            <div>
              <h2 className="text-2xl font-bold text-night mb-2">Where do you want to go?</h2>
              <p className="text-night/60 mb-6">Pick a park or search for your ideal destination</p>
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-night/40" />
                <input
                  type="text"
                  placeholder="Search national parks..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-cream-dark focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest"
                />
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {parks.map((park) => (
                  <button
                    key={park.id}
                    onClick={() => setSelectedPark(park.id)}
                    className={`text-left rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                      selectedPark === park.id
                        ? "border-forest ring-2 ring-forest/20 shadow-lg"
                        : "border-transparent hover:border-cream-dark"
                    }`}
                  >
                    <div className="relative h-28">
                      <img src={park.heroImage} alt={park.name} className="w-full h-full object-cover" />
                      {selectedPark === park.id && (
                        <div className="absolute inset-0 bg-forest/20 flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-forest text-white flex items-center justify-center">✓</div>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-sm text-night">{park.name}</h3>
                      <p className="text-xs text-night/50 mt-0.5">{getActivityCountForPark(park.id)} activities</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Dates & Group */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-night mb-2">When & who?</h2>
              <p className="text-night/60 mb-8">Set your travel dates and group size</p>

              <div className="grid sm:grid-cols-2 gap-6 mb-8">
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

              <div className="space-y-6">
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
              <h2 className="text-2xl font-bold text-night mb-2">What do you want to do?</h2>
              <p className="text-night/60 mb-8">Select activities and your fitness level</p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10">
                {activityOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => toggleActivity(opt.id)}
                    className={`p-4 rounded-xl border-2 text-center transition-all duration-200 ${
                      selectedActivities.includes(opt.id)
                        ? "border-forest bg-forest/5 shadow-md"
                        : "border-cream-dark hover:border-forest/30"
                    }`}
                  >
                    <span className="text-3xl">{opt.emoji}</span>
                    <div className="mt-2 font-medium text-sm text-night">{opt.label}</div>
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
              <h2 className="text-2xl font-bold text-night mb-2">Final preferences</h2>
              <p className="text-night/60 mb-8">Help us tailor your perfect trip</p>

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
                        className={`p-4 rounded-xl border-2 text-center transition-all duration-200 ${
                          lodging === opt.id ? "border-lake bg-lake/5 shadow-md" : "border-cream-dark hover:border-lake/30"
                        }`}
                      >
                        <div className="flex justify-center text-lake mb-2">{opt.icon}</div>
                        <div className="text-sm font-medium text-night">{opt.label}</div>
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
                        className={`p-4 rounded-xl border-2 text-center transition-all duration-200 ${
                          pace === opt.id ? "border-sunset bg-sunset/5 shadow-md" : "border-cream-dark hover:border-sunset/30"
                        }`}
                      >
                        <div className="font-medium text-sm text-night">{opt.label}</div>
                        <div className="text-xs text-night/50 mt-1">{opt.desc}</div>
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
                        className={`p-4 rounded-xl border-2 text-center transition-all duration-200 ${
                          budget === opt.id ? "border-trail bg-trail/5 shadow-md" : "border-cream-dark hover:border-trail/30"
                        }`}
                      >
                        <div className="font-medium text-sm text-night">{opt.label}</div>
                        <div className="text-xs text-night/50 mt-1">{opt.desc}</div>
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
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
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
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-forest text-white font-medium hover:bg-forest-light transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
            >
              Continue
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleBuild}
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-sunset to-sunset-light text-white font-bold hover:shadow-xl transition-all shadow-md"
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
