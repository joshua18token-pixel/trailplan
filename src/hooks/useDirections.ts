"use client";

import { useState, useEffect } from "react";

interface DirectionsResult {
  driveTime: string;
  driveTimeSeconds: number;
  distance: string;
  distanceMeters: number;
  googleMapsUrl: string;
  source: string;
}

interface CacheEntry {
  result: DirectionsResult;
  timestamp: number;
}

// In-memory cache so we don't re-fetch on re-renders
const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

function cacheKey(fromLat: number, fromLng: number, toLat: number, toLng: number) {
  return `${fromLat.toFixed(4)},${fromLng.toFixed(4)}->${toLat.toFixed(4)},${toLng.toFixed(4)}`;
}

export function useDirections(
  fromLat?: number,
  fromLng?: number,
  toLat?: number,
  toLng?: number
) {
  const [result, setResult] = useState<DirectionsResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (fromLat == null || fromLng == null || toLat == null || toLng == null) return;

    const key = cacheKey(fromLat, fromLng, toLat, toLng);
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setResult(cached.result);
      return;
    }

    setLoading(true);
    const params = new URLSearchParams({
      fromLat: fromLat.toString(),
      fromLng: fromLng.toString(),
      toLat: toLat.toString(),
      toLng: toLng.toString(),
    });

    fetch(`/api/directions?${params}`)
      .then((res) => res.json())
      .then((data: DirectionsResult) => {
        cache.set(key, { result: data, timestamp: Date.now() });
        setResult(data);
      })
      .catch(() => {
        // Build Google Maps link as fallback
        setResult({
          driveTime: "See Google Maps",
          driveTimeSeconds: 0,
          distance: "—",
          distanceMeters: 0,
          googleMapsUrl: `https://www.google.com/maps/dir/${fromLat},${fromLng}/${toLat},${toLng}`,
          source: "fallback",
        });
      })
      .finally(() => setLoading(false));
  }, [fromLat, fromLng, toLat, toLng]);

  return { result, loading };
}

// Helper to generate Google Maps URL from coordinates
export function googleMapsDirectionsUrl(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
): string {
  return `https://www.google.com/maps/dir/${fromLat},${fromLng}/${toLat},${toLng}`;
}
