import Link from "next/link";
import { Clock, TrendingUp, Ruler } from "lucide-react";
import DifficultyBadge from "./DifficultyBadge";
import type { Activity } from "@/data/mockData";
import { activityTypeEmoji, getParkById } from "@/data/mockData";

export default function ActivityCard({ activity }: { activity: Activity }) {
  const park = getParkById(activity.parkId);
  return (
    <Link href={`/explore/${activity.id}`} className="group block">
      <div className="relative overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
        {/* Image */}
        <div className="relative h-40 overflow-hidden">
          <img
            src={activity.image}
            alt={activity.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 left-3">
            <DifficultyBadge difficulty={activity.difficulty} />
          </div>
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur rounded-full px-2 py-1 text-sm">
            {activityTypeEmoji[activity.type]}
          </div>
        </div>
        {/* Body */}
        <div className="p-4">
          <h3 className="font-semibold text-night group-hover:text-forest transition-colors truncate">
            {activity.name}
          </h3>
          {park && (
            <p className="text-sm text-night/50 mt-0.5">{park.name}</p>
          )}
          <div className="mt-3 flex items-center gap-4 text-xs text-night/60">
            <span className="flex items-center gap-1">
              <Ruler className="w-3.5 h-3.5" />
              {activity.distance} mi
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              {activity.elevationGain.toLocaleString()} ft
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {activity.duration}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
