import { NextRequest, NextResponse } from "next/server";

// OSRM public API — free, no key needed
// Returns real driving directions, distance, and duration
const OSRM_BASE = "https://router.project-osrm.org/route/v1/driving";

interface DirectionsRequest {
  fromLat: number;
  fromLng: number;
  toLat: number;
  toLng: number;
}

interface DirectionsResponse {
  driveTime: string;      // formatted, e.g. "1 hr 12 min"
  driveTimeSeconds: number;
  distance: string;       // formatted, e.g. "54.3 miles"
  distanceMeters: number;
  googleMapsUrl: string;  // direct link to Google Maps directions
  source: "osrm";
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} hr`;
  return `${hours} hr ${minutes} min`;
}

function formatDistance(meters: number): string {
  const miles = meters / 1609.344;
  if (miles < 1) return `${(miles * 5280).toFixed(0)} ft`;
  return `${miles.toFixed(1)} miles`;
}

function buildGoogleMapsUrl(fromLat: number, fromLng: number, toLat: number, toLng: number): string {
  return `https://www.google.com/maps/dir/${fromLat},${fromLng}/${toLat},${toLng}`;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const fromLat = parseFloat(searchParams.get("fromLat") || "");
  const fromLng = parseFloat(searchParams.get("fromLng") || "");
  const toLat = parseFloat(searchParams.get("toLat") || "");
  const toLng = parseFloat(searchParams.get("toLng") || "");

  if (isNaN(fromLat) || isNaN(fromLng) || isNaN(toLat) || isNaN(toLng)) {
    return NextResponse.json({ error: "Missing or invalid coordinates" }, { status: 400 });
  }

  const googleMapsUrl = buildGoogleMapsUrl(fromLat, fromLng, toLat, toLng);

  try {
    // OSRM uses lng,lat order
    const url = `${OSRM_BASE}/${fromLng},${fromLat};${toLng},${toLat}?overview=false`;
    const res = await fetch(url, { next: { revalidate: 86400 } }); // cache 24h
    const data = await res.json();

    if (data.code !== "Ok" || !data.routes?.[0]) {
      return NextResponse.json({
        driveTime: "Unknown",
        driveTimeSeconds: 0,
        distance: "Unknown",
        distanceMeters: 0,
        googleMapsUrl,
        source: "osrm",
        error: "No route found",
      });
    }

    const route = data.routes[0];
    const response: DirectionsResponse = {
      driveTime: formatDuration(route.duration),
      driveTimeSeconds: route.duration,
      distance: formatDistance(route.distance),
      distanceMeters: route.distance,
      googleMapsUrl,
      source: "osrm",
    };

    return NextResponse.json(response);
  } catch (error) {
    // Fallback — at least provide Google Maps link
    return NextResponse.json({
      driveTime: "Check Google Maps",
      driveTimeSeconds: 0,
      distance: "—",
      distanceMeters: 0,
      googleMapsUrl,
      source: "osrm",
      error: "Routing service unavailable",
    });
  }
}

// Batch endpoint — multiple origin/destination pairs at once
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const pairs: DirectionsRequest[] = body.pairs || [];

    if (pairs.length === 0) {
      return NextResponse.json({ error: "No coordinate pairs provided" }, { status: 400 });
    }

    // Limit to 20 pairs to avoid abuse
    const limited = pairs.slice(0, 20);

    const results = await Promise.all(
      limited.map(async (pair) => {
        const googleMapsUrl = buildGoogleMapsUrl(pair.fromLat, pair.fromLng, pair.toLat, pair.toLng);
        try {
          const url = `${OSRM_BASE}/${pair.fromLng},${pair.fromLat};${pair.toLng},${pair.toLat}?overview=false`;
          const res = await fetch(url, { next: { revalidate: 86400 } });
          const data = await res.json();

          if (data.code !== "Ok" || !data.routes?.[0]) {
            return { ...pair, driveTime: "Unknown", distance: "Unknown", googleMapsUrl, source: "osrm" as const };
          }

          const route = data.routes[0];
          return {
            ...pair,
            driveTime: formatDuration(route.duration),
            driveTimeSeconds: route.duration,
            distance: formatDistance(route.distance),
            distanceMeters: route.distance,
            googleMapsUrl,
            source: "osrm" as const,
          };
        } catch {
          return { ...pair, driveTime: "Check Google Maps", distance: "—", googleMapsUrl, source: "osrm" as const };
        }
      })
    );

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
