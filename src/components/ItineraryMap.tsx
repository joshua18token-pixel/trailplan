"use client";

import { useEffect, useRef, useMemo } from "react";
import type { ItineraryDay } from "@/data/mockData";
import { getActivityById } from "@/data/mockData";

interface ItineraryMapProps {
  days: ItineraryDay[];
}

// Day colors for markers and routes
const dayColors = [
  "#2D5016", // Day 1 - Forest Green
  "#E87B35", // Day 2 - Sunset Orange
  "#4A90D9", // Day 3 - Lake Blue
  "#9333EA", // Day 4 - Purple
  "#DC2626", // Day 5 - Red
  "#059669", // Day 6 - Emerald
  "#D97706", // Day 7 - Amber
  "#6366F1", // Day 8 - Indigo
];

interface MapPoint {
  lat: number;
  lng: number;
  label: string;
  day: number;
  type: string;
}

export default function ItineraryMap({ days }: ItineraryMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const layerGroupRef = useRef<any>(null);

  // Collect all points from the itinerary
  const points = useMemo(() => {
    const pts: MapPoint[] = [];
    for (const day of days) {
      for (const slot of day.slots) {
        const slotType = slot.slotType || "activity";
        if (slotType === "activity") {
          const activity = getActivityById(slot.activityId);
          if (activity?.coordinates) {
            pts.push({
              lat: activity.coordinates.lat,
              lng: activity.coordinates.lng,
              label: activity.name,
              day: day.day,
              type: activity.type,
            });
          }
        } else if (slotType === "destination" && slot.customTitle) {
          // Custom destinations won't have coords in mock data, skip for now
        }
      }
      // Add travel segment endpoints
      for (const seg of day.travel) {
        if (seg.fromCoords) {
          pts.push({ lat: seg.fromCoords.lat, lng: seg.fromCoords.lng, label: seg.from, day: day.day, type: "travel" });
        }
        if (seg.toCoords) {
          pts.push({ lat: seg.toCoords.lat, lng: seg.toCoords.lng, label: seg.to, day: day.day, type: "travel" });
        }
      }
    }
    return pts;
  }, [days]);

  // Routes: connect activities within each day
  const routes = useMemo(() => {
    const r: { coords: [number, number][]; day: number }[] = [];
    for (const day of days) {
      const dayCoords: [number, number][] = [];
      // Start from first travel segment
      for (const seg of day.travel) {
        if (seg.fromCoords) dayCoords.push([seg.fromCoords.lat, seg.fromCoords.lng]);
        if (seg.toCoords) dayCoords.push([seg.toCoords.lat, seg.toCoords.lng]);
      }
      // Also add activity coords
      for (const slot of day.slots) {
        if ((slot.slotType || "activity") === "activity") {
          const activity = getActivityById(slot.activityId);
          if (activity?.coordinates) {
            dayCoords.push([activity.coordinates.lat, activity.coordinates.lng]);
          }
        }
      }
      if (dayCoords.length > 1) {
        // Deduplicate consecutive identical points
        const deduped: [number, number][] = [dayCoords[0]];
        for (let i = 1; i < dayCoords.length; i++) {
          const prev = deduped[deduped.length - 1];
          if (prev[0] !== dayCoords[i][0] || prev[1] !== dayCoords[i][1]) {
            deduped.push(dayCoords[i]);
          }
        }
        if (deduped.length > 1) {
          r.push({ coords: deduped, day: day.day });
        }
      }
    }
    return r;
  }, [days]);

  useEffect(() => {
    if (!mapRef.current || typeof window === "undefined") return;

    // Dynamically import Leaflet to avoid SSR issues
    import("leaflet").then((L) => {
      // Fix Leaflet default icon issue
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      if (!mapInstanceRef.current) {
        // Center on Yosemite Valley by default
        const defaultCenter: [number, number] = points.length > 0
          ? [points[0].lat, points[0].lng]
          : [37.7455, -119.5936];

        mapInstanceRef.current = L.map(mapRef.current!, {
          center: defaultCenter,
          zoom: 11,
          zoomControl: true,
        });

        // Use OpenStreetMap tiles (free, outdoor-friendly)
        L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
          maxZoom: 17,
        }).addTo(mapInstanceRef.current);

        layerGroupRef.current = L.layerGroup().addTo(mapInstanceRef.current);
      }

      // Clear existing markers/routes
      layerGroupRef.current.clearLayers();

      // Add route lines
      for (const route of routes) {
        const color = dayColors[(route.day - 1) % dayColors.length];
        L.polyline(route.coords, {
          color,
          weight: 3,
          opacity: 0.7,
          dashArray: "8, 6",
        }).addTo(layerGroupRef.current);
      }

      // Add markers (deduplicate by lat/lng)
      const seen = new Set<string>();
      const activityPoints = points.filter((p) => p.type !== "travel");
      const markerPoints = activityPoints.length > 0 ? activityPoints : points;

      for (const pt of markerPoints) {
        const key = `${pt.lat.toFixed(4)},${pt.lng.toFixed(4)}`;
        if (seen.has(key)) continue;
        seen.add(key);

        const color = dayColors[(pt.day - 1) % dayColors.length];
        const marker = L.circleMarker([pt.lat, pt.lng], {
          radius: 8,
          fillColor: color,
          color: "#fff",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9,
        }).addTo(layerGroupRef.current);

        marker.bindPopup(
          `<div style="font-family:Inter,sans-serif;font-size:13px;">
            <strong>Day ${pt.day}</strong><br/>
            ${pt.label}
          </div>`,
          { closeButton: false, className: "trailplan-popup" }
        );
        marker.bindTooltip(`D${pt.day}: ${pt.label}`, {
          direction: "top",
          offset: [0, -10],
          className: "trailplan-tooltip",
        });
      }

      // Fit bounds to show activity points only (not distant travel endpoints)
      // Filter out points that are too far from the median (e.g., "Home" / "San Francisco")
      const activityCoords = points
        .filter((p) => p.type !== "travel")
        .map((p) => [p.lat, p.lng] as [number, number]);
      
      // Fall back to all points if no activity-only points
      let boundsCoords = activityCoords.length > 0 ? activityCoords : points.map((p) => [p.lat, p.lng] as [number, number]);
      
      // If we have travel points too, only include those within ~50 miles of the activity centroid
      if (activityCoords.length > 0 && points.some((p) => p.type === "travel")) {
        const avgLat = activityCoords.reduce((s, c) => s + c[0], 0) / activityCoords.length;
        const avgLng = activityCoords.reduce((s, c) => s + c[1], 0) / activityCoords.length;
        const travelNearby = points
          .filter((p) => p.type === "travel")
          .filter((p) => {
            const dLat = Math.abs(p.lat - avgLat);
            const dLng = Math.abs(p.lng - avgLng);
            return dLat < 0.5 && dLng < 0.5; // ~30 miles radius
          })
          .map((p) => [p.lat, p.lng] as [number, number]);
        boundsCoords = [...activityCoords, ...travelNearby];
      }
      
      if (boundsCoords.length > 0) {
        const bounds = L.latLngBounds(boundsCoords);
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      }
    });

    return () => {
      // Don't destroy map on re-render, just clear layers
    };
  }, [points, routes]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />
      <div ref={mapRef} className="w-full h-full rounded-2xl z-0" />
      {/* Day legend */}
      <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 shadow-md z-[1000]">
        <div className="flex items-center gap-3 flex-wrap">
          {days.map((d) => (
            <div key={d.day} className="flex items-center gap-1.5 text-xs">
              <div
                className="w-3 h-3 rounded-full border border-white"
                style={{ backgroundColor: dayColors[(d.day - 1) % dayColors.length] }}
              />
              <span className="font-medium text-night/70">Day {d.day}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
