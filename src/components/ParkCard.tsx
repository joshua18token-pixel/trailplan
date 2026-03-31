import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";
import type { Park } from "@/data/mockData";

export default function ParkCard({ park, activityCount }: { park: Park; activityCount: number }) {
  return (
    <Link href={`/parks/${park.id}`} className="group block">
      <div className="relative overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={park.heroImage}
            alt={park.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="text-lg font-bold text-white">{park.name}</h3>
            <div className="flex items-center gap-1 text-white/80 text-sm mt-0.5">
              <MapPin className="w-3.5 h-3.5" />
              {park.region}
            </div>
          </div>
        </div>
        {/* Body */}
        <div className="p-4">
          <p className="text-sm text-night/60 line-clamp-2">{park.description}</p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm font-medium text-forest">
              {activityCount} activities
            </span>
            <span className="flex items-center gap-1 text-sm font-medium text-sunset group-hover:gap-2 transition-all">
              Explore <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
