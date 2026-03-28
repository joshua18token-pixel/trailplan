import { use } from "react";
import Link from "next/link";
import {
  ArrowLeft, Clock, TrendingUp, Ruler, Calendar, MapPin,
  Shield, Bookmark, Plus, Lightbulb, Star,
} from "lucide-react";
import DifficultyBadge from "@/components/DifficultyBadge";
import RatingBar from "@/components/RatingBar";
import {
  activities, getParkById, activityTypeEmoji,
} from "@/data/mockData";

export default function ActivityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const activity = activities.find((a) => a.id === id);

  if (!activity) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-night mb-2">Activity not found</h1>
          <Link href="/explore" className="text-forest hover:underline">Back to Explore</Link>
        </div>
      </div>
    );
  }

  const park = getParkById(activity.parkId);

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <div className="relative h-64 sm:h-80 overflow-hidden">
        <img src={activity.image} alt={activity.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute top-4 left-4">
          <Link
            href="/explore"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/90 backdrop-blur text-night text-sm font-medium hover:bg-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </div>
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex items-center gap-2 mb-2">
            <DifficultyBadge difficulty={activity.difficulty} size="md" />
            <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur text-white text-sm font-medium">
              {activityTypeEmoji[activity.type]} {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">{activity.name}</h1>
          {park && (
            <p className="mt-1 text-white/80 flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              {park.name}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 -mt-12 relative z-10 mb-8">
          {[
            { label: "Distance", value: `${activity.distance} mi`, icon: <Ruler className="w-5 h-5" /> },
            { label: "Elevation", value: `${activity.elevationGain.toLocaleString()} ft`, icon: <TrendingUp className="w-5 h-5" /> },
            { label: "Duration", value: activity.duration, icon: <Clock className="w-5 h-5" /> },
            { label: "Difficulty", value: activity.difficulty.charAt(0).toUpperCase() + activity.difficulty.slice(1), icon: <Star className="w-5 h-5" /> },
            { label: "Best Season", value: park?.bestSeason || "Year-round", icon: <Calendar className="w-5 h-5" /> },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl p-4 shadow-md text-center">
              <div className="text-forest mx-auto mb-1 flex justify-center">{stat.icon}</div>
              <div className="text-xs text-night/50">{stat.label}</div>
              <div className="font-bold text-night text-sm mt-0.5">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl p-6 shadow-md mb-6">
          <h2 className="text-xl font-bold text-night mb-3">About This Trail</h2>
          <p className="text-night/70 leading-relaxed">{activity.description}</p>
        </div>

        {/* What You Need */}
        <div className="bg-white rounded-2xl p-6 shadow-md mb-6">
          <h2 className="text-xl font-bold text-night mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-sunset" />
            What You Need
          </h2>
          <div className="space-y-3">
            {activity.permitRequired && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-sunset/5">
                <div className="w-8 h-8 rounded-lg bg-sunset/10 text-sunset flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium text-night text-sm">Permit Required</p>
                  <p className="text-xs text-night/50">Check recreation.gov for availability and lottery dates</p>
                </div>
              </div>
            )}
            {!activity.permitRequired && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-trail/5">
                <div className="w-8 h-8 rounded-lg bg-trail/10 text-trail flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium text-night text-sm">No Permit Needed</p>
                  <p className="text-xs text-night/50">Free access — just show up and enjoy</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-cream">
              <div className="w-8 h-8 rounded-lg bg-forest/10 text-forest flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium text-night text-sm">Parking & Access</p>
                <p className="text-xs text-night/50">Arrive early for parking, especially on weekends. Trailhead at ({activity.coordinates.lat.toFixed(3)}, {activity.coordinates.lng.toFixed(3)})</p>
              </div>
            </div>
          </div>
        </div>

        {/* Ratings */}
        <div className="bg-white rounded-2xl p-6 shadow-md mb-6">
          <h2 className="text-xl font-bold text-night mb-4">Ratings</h2>
          <div className="space-y-4">
            <RatingBar label="Scenery" score={activity.ratings.scenery} color="bg-forest" />
            <RatingBar label="Difficulty" score={activity.ratings.difficulty} color="bg-sunset" />
            <RatingBar label="Crowds" score={activity.ratings.crowds} color="bg-lake" />
          </div>
        </div>

        {/* Tips */}
        <div className="bg-white rounded-2xl p-6 shadow-md mb-6">
          <h2 className="text-xl font-bold text-night mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-gold" />
            Community Tips
          </h2>
          <div className="space-y-3">
            {activity.tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-cream">
                <div className="w-6 h-6 rounded-full bg-gold/20 text-gold flex items-center justify-center text-xs font-bold shrink-0">
                  {i + 1}
                </div>
                <p className="text-sm text-night/70">{tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/trip/yosemite-adventure"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-forest text-white font-semibold hover:bg-forest-light transition-all shadow-md"
          >
            <Plus className="w-5 h-5" />
            Add to Itinerary
          </Link>
          <button className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl border-2 border-forest text-forest font-semibold hover:bg-forest/5 transition-all">
            <Bookmark className="w-5 h-5" />
            Save for Later
          </button>
        </div>
      </div>
    </div>
  );
}
