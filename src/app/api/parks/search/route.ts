import { NextRequest, NextResponse } from "next/server";

// ============================================================
// AI-Powered Park Discovery API
// 1. Search our local database first
// 2. If not found, search the web and auto-add to DB
// ============================================================

// In-memory database (in production, this would be PostgreSQL/Supabase)
// Starts with our seed parks, grows as users search
interface ParkEntry {
  id: string;
  name: string;
  fullName: string;
  type: "national_park" | "state_park" | "national_forest" | "recreation_area" | "monument" | "other";
  state: string;
  description: string;
  coordinates: { lat: number; lng: number };
  image?: string;
  website?: string;
  activities: string[];
  bestSeason: string;
  addedBy: "seed" | "ai_discovery";
  addedAt: string;
}

// Seed data — our known parks
const parkDatabase: Map<string, ParkEntry> = new Map();

const seedParks: ParkEntry[] = [
  {
    id: "yosemite", name: "Yosemite", fullName: "Yosemite National Park",
    type: "national_park", state: "California",
    description: "Granite cliffs, waterfalls, giant sequoias, and diverse wildlife in the Sierra Nevada.",
    coordinates: { lat: 37.8651, lng: -119.5383 },
    website: "https://www.nps.gov/yose/",
    activities: ["hiking", "biking", "fishing", "kayaking", "sightseeing", "camping", "rock climbing"],
    bestSeason: "May - October", addedBy: "seed", addedAt: "2026-01-01",
  },
  {
    id: "zion", name: "Zion", fullName: "Zion National Park",
    type: "national_park", state: "Utah",
    description: "Steep red cliffs, emerald pools, and narrow slot canyons along the Virgin River.",
    coordinates: { lat: 37.2982, lng: -113.0263 },
    website: "https://www.nps.gov/zion/",
    activities: ["hiking", "canyoneering", "kayaking", "sightseeing", "camping", "biking"],
    bestSeason: "March - November", addedBy: "seed", addedAt: "2026-01-01",
  },
  {
    id: "grand-canyon", name: "Grand Canyon", fullName: "Grand Canyon National Park",
    type: "national_park", state: "Arizona",
    description: "A mile-deep canyon carved by the Colorado River over millions of years.",
    coordinates: { lat: 36.1069, lng: -112.1129 },
    website: "https://www.nps.gov/grca/",
    activities: ["hiking", "rafting", "sightseeing", "camping", "mule rides", "biking"],
    bestSeason: "March - May, September - November", addedBy: "seed", addedAt: "2026-01-01",
  },
  {
    id: "glacier", name: "Glacier", fullName: "Glacier National Park",
    type: "national_park", state: "Montana",
    description: "Over 700 miles of trails through alpine meadows, pristine forests, and turquoise lakes.",
    coordinates: { lat: 48.7596, lng: -113.7870 },
    website: "https://www.nps.gov/glac/",
    activities: ["hiking", "kayaking", "fishing", "sightseeing", "camping", "biking"],
    bestSeason: "June - September", addedBy: "seed", addedAt: "2026-01-01",
  },
  {
    id: "yellowstone", name: "Yellowstone", fullName: "Yellowstone National Park",
    type: "national_park", state: "Wyoming",
    description: "Geysers, hot springs, canyon, and abundant wildlife across a volcanic landscape.",
    coordinates: { lat: 44.4280, lng: -110.5885 },
    website: "https://www.nps.gov/yell/",
    activities: ["hiking", "fishing", "sightseeing", "camping", "wildlife watching", "kayaking"],
    bestSeason: "May - September", addedBy: "seed", addedAt: "2026-01-01",
  },
  {
    id: "acadia", name: "Acadia", fullName: "Acadia National Park",
    type: "national_park", state: "Maine",
    description: "Rocky beaches, woodland trails, and Cadillac Mountain — the first place to see sunrise in the US.",
    coordinates: { lat: 44.3386, lng: -68.2733 },
    website: "https://www.nps.gov/acad/",
    activities: ["hiking", "biking", "kayaking", "fishing", "sightseeing", "camping"],
    bestSeason: "June - October", addedBy: "seed", addedAt: "2026-01-01",
  },
  // State parks
  {
    id: "highlands-hammock", name: "Highlands Hammock", fullName: "Highlands Hammock State Park",
    type: "state_park", state: "Florida",
    description: "One of Florida's oldest state parks, featuring ancient oaks, boardwalk trails through cypress swamps, and diverse wildlife including alligators and white-tailed deer.",
    coordinates: { lat: 27.4720, lng: -81.5335 },
    website: "https://www.floridastateparks.org/parks-and-trails/highlands-hammock-state-park",
    activities: ["hiking", "biking", "camping", "wildlife watching", "horseback riding", "fishing"],
    bestSeason: "October - April", addedBy: "seed", addedAt: "2026-01-01",
  },
];

// Initialize database
for (const park of seedParks) {
  parkDatabase.set(park.id, park);
}

// Search function
function searchLocalDB(query: string): ParkEntry[] {
  const q = query.toLowerCase().trim();
  // Also try matching with hyphens replaced by spaces (for URL-formatted IDs like "highlands-hammock")
  const qNormalized = q.replace(/-/g, " ");
  const results: ParkEntry[] = [];

  // First check for exact ID match
  if (parkDatabase.has(q) || parkDatabase.has(qNormalized.replace(/ /g, "-"))) {
    const match = parkDatabase.get(q) || parkDatabase.get(qNormalized.replace(/ /g, "-"));
    if (match) return [match];
  }

  for (const park of parkDatabase.values()) {
    const nameMatch = park.name.toLowerCase().includes(q) || park.fullName.toLowerCase().includes(q)
      || park.name.toLowerCase().includes(qNormalized) || park.fullName.toLowerCase().includes(qNormalized)
      || park.id === q || park.id === qNormalized.replace(/ /g, "-");
    const stateMatch = park.state.toLowerCase().includes(q);
    const descMatch = park.description.toLowerCase().includes(q);
    if (nameMatch || stateMatch || descMatch) {
      results.push(park);
    }
  }

  // Sort: exact name matches first
  results.sort((a, b) => {
    const aExact = a.name.toLowerCase() === q || a.fullName.toLowerCase() === q;
    const bExact = b.name.toLowerCase() === q || b.fullName.toLowerCase() === q;
    if (aExact && !bExact) return -1;
    if (!aExact && bExact) return 1;
    return 0;
  });

  return results;
}

// Known state park activity profiles by keyword in park name
const parkActivityProfiles: Record<string, { activities: string[]; description: string; bestSeason: string }> = {
  springs: {
    activities: ["swimming", "kayaking", "snorkeling", "hiking", "camping", "wildlife watching"],
    description: "A natural springs park featuring crystal-clear spring-fed waters perfect for swimming, kayaking, and snorkeling. The surrounding trails wind through lush forest habitats.",
    bestSeason: "Year-round (springs maintain ~72°F), busiest May-September",
  },
  hammock: {
    activities: ["hiking", "biking", "camping", "wildlife watching", "horseback riding"],
    description: "A hardwood hammock preserve with ancient oaks, boardwalk trails through cypress swamps, and diverse wildlife including native bird species.",
    bestSeason: "October - April (cooler, fewer mosquitoes)",
  },
  river: {
    activities: ["kayaking", "canoeing", "fishing", "swimming", "camping", "hiking"],
    description: "A scenic river park offering paddling, fishing, and riverside trails. The waterway supports rich ecosystems and diverse wildlife.",
    bestSeason: "March - November",
  },
  lake: {
    activities: ["fishing", "kayaking", "swimming", "camping", "hiking", "boating"],
    description: "A lake recreation area with fishing, swimming beaches, boating access, and lakeside camping. Trails circle the shoreline through natural habitats.",
    bestSeason: "April - October",
  },
  beach: {
    activities: ["swimming", "fishing", "kayaking", "hiking", "camping", "wildlife watching"],
    description: "A coastal park with pristine beaches, dunes, and coastal trails. Great for swimming, shelling, fishing, and observing shorebirds and marine life.",
    bestSeason: "March - November",
  },
  canyon: {
    activities: ["hiking", "rock climbing", "sightseeing", "camping", "photography"],
    description: "A dramatic canyon landscape with scenic overlooks, challenging trails, and geological formations carved over millennia.",
    bestSeason: "March - May, September - November",
  },
  forest: {
    activities: ["hiking", "biking", "camping", "wildlife watching", "horseback riding", "fishing"],
    description: "A forested preserve with miles of trails through diverse woodland ecosystems, offering excellent hiking, mountain biking, and nature observation.",
    bestSeason: "Year-round, best in spring and fall",
  },
  falls: {
    activities: ["hiking", "swimming", "sightseeing", "photography", "camping"],
    description: "A waterfall park featuring cascading falls, swimming holes, and scenic hiking trails through gorges and forest.",
    bestSeason: "Spring (peak water flow) through fall",
  },
  mountain: {
    activities: ["hiking", "rock climbing", "camping", "sightseeing", "biking"],
    description: "A mountain park with summit trails, panoramic views, and diverse terrain ranging from valleys to ridgelines.",
    bestSeason: "May - October",
  },
  default: {
    activities: ["hiking", "camping", "sightseeing", "wildlife watching"],
    description: "A scenic park offering trails, natural habitats, and outdoor recreation opportunities.",
    bestSeason: "Check local listings for seasonal info",
  },
};

function getActivityProfile(parkName: string): { activities: string[]; description: string; bestSeason: string } {
  const lower = parkName.toLowerCase();
  for (const [keyword, profile] of Object.entries(parkActivityProfiles)) {
    if (keyword !== "default" && lower.includes(keyword)) return profile;
  }
  return parkActivityProfiles.default;
}

// State-specific info for better descriptions
const stateSeasons: Record<string, string> = {
  FL: "October - April (cooler, drier)", Florida: "October - April (cooler, drier)",
  TX: "March - May, October - November", Texas: "March - May, October - November",
  CA: "April - October", California: "April - October",
  CO: "June - September", Colorado: "June - September",
  NY: "May - October", "New York": "May - October",
  NC: "April - November", "North Carolina": "April - November",
  TN: "April - November", Tennessee: "April - November",
  OR: "June - September", Oregon: "June - September",
  WA: "July - September", Washington: "July - September",
  AZ: "October - April", Arizona: "October - April",
  UT: "April - October", Utah: "April - October",
  HI: "Year-round", Hawaii: "Year-round",
};

// AI Discovery: multi-source park discovery
async function discoverPark(query: string): Promise<ParkEntry | null> {
  const qLower = query.toLowerCase();
  const isLikelyStatePark = qLower.includes("state") || (!qLower.includes("national") && !qLower.includes("monument"));
  const isLikelyNational = qLower.includes("national") || qLower.includes("monument") || qLower.includes("nps");

  const id = query.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  // Strategy: Try geocoding FIRST (works for all parks), then NPS for nationals
  // This prevents NPS from returning wrong results for state park queries

  // Step 1: Geocode with Nominatim (works for state parks, national parks, everything)
  let geoResult: { lat: number; lng: number; state: string; displayName: string } | null = null;
  try {
    // Search with specific park type for better results
    const searchQuery = qLower.includes("park") ? query : `${query} park`;
    const geoRes = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=3&addressdetails=1`,
      { headers: { "User-Agent": "TrailPlan/1.0 (contact@trailplan.app)" }, next: { revalidate: 86400 } }
    );

    if (geoRes.ok) {
      const geoData = await geoRes.json();
      // Find the best match — prefer results that include "park" in the type or class
      const parkResult = geoData.find((r: any) =>
        r.type === "park" || r.type === "nature_reserve" || r.type === "national_park" ||
        r.class === "leisure" || r.class === "boundary" ||
        r.display_name?.toLowerCase().includes("park")
      ) || geoData[0];

      if (parkResult) {
        const stateParts = parkResult.display_name?.split(",") || [];
        const stateGuess = parkResult.address?.state || stateParts.slice(-2, -1)[0]?.trim() || "Unknown";
        geoResult = {
          lat: parseFloat(parkResult.lat),
          lng: parseFloat(parkResult.lon),
          state: stateGuess,
          displayName: parkResult.display_name || "",
        };
      }
    }
  } catch {}

  // Step 2: If it looks like a national park, also try NPS API for richer data
  if (isLikelyNational) {
    try {
      const npsRes = await fetch(
        `https://developer.nps.gov/api/v1/parks?q=${encodeURIComponent(query)}&limit=3&api_key=DEMO_KEY`,
        { next: { revalidate: 86400 } }
      );

      if (npsRes.ok) {
        const npsData = await npsRes.json();
        if (npsData.data && npsData.data.length > 0) {
          // Check that the NPS result actually matches our query
          const park = npsData.data.find((p: any) => {
            const pName = (p.fullName || p.name || "").toLowerCase();
            const queryWords = qLower.replace(/national|park|state|monument/g, "").trim().split(/\s+/);
            return queryWords.some((w: string) => w.length > 2 && pName.includes(w));
          });

          if (park) {
            const entry: ParkEntry = {
              id: park.parkCode || id,
              name: park.name?.replace(/ National Park| State Park| National Forest/g, "") || query,
              fullName: park.fullName || query,
              type: park.designation?.toLowerCase().includes("national park") ? "national_park"
                : park.designation?.toLowerCase().includes("monument") ? "monument"
                : park.designation?.toLowerCase().includes("forest") ? "national_forest"
                : "recreation_area",
              state: park.states || geoResult?.state || "Unknown",
              description: park.description || `${query} — discovered by TrailPlan AI.`,
              coordinates: geoResult || {
                lat: parseFloat(park.latitude) || 0,
                lng: parseFloat(park.longitude) || 0,
              },
              website: park.url || undefined,
              image: park.images?.[0]?.url || undefined,
              activities: (park.activities || []).map((a: any) => a.name?.toLowerCase()).filter(Boolean).slice(0, 8),
              bestSeason: stateSeasons[park.states] || "Check park website for seasonal info",
              addedBy: "ai_discovery",
              addedAt: new Date().toISOString().split("T")[0],
            };

            parkDatabase.set(entry.id, entry);
            return entry;
          }
        }
      }
    } catch {}
  }

  // Step 3: Build entry from geocoding result + AI-enriched data
  if (geoResult) {
    const profile = getActivityProfile(query);
    const cleanName = query.replace(/ state park| national park| park/gi, "").trim();
    const fullName = qLower.includes("park") ? query
      : qLower.includes("state") ? `${query} Park`
      : query;

    const parkType: ParkEntry["type"] = qLower.includes("state") ? "state_park"
      : qLower.includes("national forest") ? "national_forest"
      : qLower.includes("national") ? "national_park"
      : qLower.includes("monument") ? "monument"
      : "state_park";

    const stateBestSeason = stateSeasons[geoResult.state] || profile.bestSeason;

    const entry: ParkEntry = {
      id,
      name: cleanName,
      fullName,
      type: parkType,
      state: geoResult.state,
      description: `${fullName} in ${geoResult.state}. ${profile.description} Discovered and added by TrailPlan AI — community contributions welcome!`,
      coordinates: { lat: geoResult.lat, lng: geoResult.lng },
      activities: profile.activities,
      bestSeason: stateBestSeason,
      addedBy: "ai_discovery",
      addedAt: new Date().toISOString().split("T")[0],
    };

    parkDatabase.set(id, entry);
    return entry;
  }

  return null;
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") || "";

  if (!query.trim()) {
    // Return all parks
    const all = Array.from(parkDatabase.values());
    return NextResponse.json({ results: all, source: "database", total: all.length });
  }

  // 1. Search local database first
  const localResults = searchLocalDB(query);

  if (localResults.length > 0) {
    return NextResponse.json({
      results: localResults,
      source: "database",
      total: localResults.length,
      message: `Found ${localResults.length} park(s) matching "${query}"`,
    });
  }

  // 2. Not found locally — trigger AI discovery
  const discovered = await discoverPark(query);

  if (discovered) {
    return NextResponse.json({
      results: [discovered],
      source: "ai_discovery",
      total: 1,
      message: `🤖 AI discovered "${discovered.fullName}" and added it to TrailPlan! Future users will find it instantly.`,
    });
  }

  // 3. Nothing found
  return NextResponse.json({
    results: [],
    source: "not_found",
    total: 0,
    message: `No parks found for "${query}". Try a different search or check the spelling.`,
  });
}

// Stats endpoint
export async function POST(request: NextRequest) {
  const body = await request.json();

  if (body.action === "stats") {
    const all = Array.from(parkDatabase.values());
    const seeded = all.filter((p) => p.addedBy === "seed").length;
    const discovered = all.filter((p) => p.addedBy === "ai_discovery").length;

    return NextResponse.json({
      total: all.length,
      seeded,
      aiDiscovered: discovered,
      parks: all.map((p) => ({ id: p.id, name: p.fullName, type: p.type, state: p.state, addedBy: p.addedBy })),
    });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
