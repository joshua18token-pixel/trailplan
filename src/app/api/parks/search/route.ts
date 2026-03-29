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

// AI Discovery: generate park data from query
// In production this would call an LLM API or scrape NPS/state park websites
// For the prototype, we use structured web search simulation
async function discoverPark(query: string): Promise<ParkEntry | null> {
  try {
    // Try NPS API first (free, no key needed for basic search)
    const npsRes = await fetch(
      `https://developer.nps.gov/api/v1/parks?q=${encodeURIComponent(query)}&limit=3&api_key=DEMO_KEY`,
      { next: { revalidate: 86400 } }
    );

    if (npsRes.ok) {
      const npsData = await npsRes.json();
      if (npsData.data && npsData.data.length > 0) {
        const park = npsData.data[0];
        const id = park.parkCode || query.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        
        const entry: ParkEntry = {
          id,
          name: park.name?.replace(/ National Park| State Park| National Forest/g, "") || query,
          fullName: park.fullName || query,
          type: park.designation?.toLowerCase().includes("national park") ? "national_park"
            : park.designation?.toLowerCase().includes("state") ? "state_park"
            : park.designation?.toLowerCase().includes("forest") ? "national_forest"
            : park.designation?.toLowerCase().includes("monument") ? "monument"
            : "recreation_area",
          state: park.states || "Unknown",
          description: park.description || `${query} — discovered by TrailPlan AI.`,
          coordinates: {
            lat: parseFloat(park.latitude) || 0,
            lng: parseFloat(park.longitude) || 0,
          },
          website: park.url || undefined,
          image: park.images?.[0]?.url || undefined,
          activities: (park.activities || []).map((a: any) => a.name?.toLowerCase()).filter(Boolean).slice(0, 8),
          bestSeason: "Check park website for seasonal info",
          addedBy: "ai_discovery",
          addedAt: new Date().toISOString().split("T")[0],
        };

        // Add to database for future users
        parkDatabase.set(id, entry);
        return entry;
      }
    }
  } catch (e) {
    // NPS API failed, try fallback
  }

  // Fallback: create entry from search query with generic info
  // In production, this would call an LLM to enrich the data
  const id = query.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  
  // Check if we can determine it's a real place by geocoding
  try {
    const geoRes = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + " park")}&format=json&limit=1`,
      { headers: { "User-Agent": "TrailPlan/1.0" }, next: { revalidate: 86400 } }
    );
    
    if (geoRes.ok) {
      const geoData = await geoRes.json();
      if (geoData.length > 0) {
        const geo = geoData[0];
        const isStatePark = query.toLowerCase().includes("state");
        
        const entry: ParkEntry = {
          id,
          name: query.replace(/ state park| national park| park/gi, "").trim(),
          fullName: query,
          type: isStatePark ? "state_park"
            : query.toLowerCase().includes("national") ? "national_park"
            : "state_park",
          state: geo.display_name?.split(",").slice(-2, -1)[0]?.trim() || "Unknown",
          description: `${query} — discovered and added by TrailPlan AI. Help us improve this listing by contributing trail info and tips!`,
          coordinates: {
            lat: parseFloat(geo.lat),
            lng: parseFloat(geo.lon),
          },
          activities: ["hiking", "sightseeing", "camping"],
          bestSeason: "Check local listings for seasonal info",
          addedBy: "ai_discovery",
          addedAt: new Date().toISOString().split("T")[0],
        };

        parkDatabase.set(id, entry);
        return entry;
      }
    }
  } catch (e) {
    // Geocoding failed
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
