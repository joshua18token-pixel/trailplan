import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ============================================================
// AI-Powered Park Discovery API — backed by Supabase
// 1. Search Supabase first
// 2. If not found, discover via Nominatim/NPS and save to Supabase
// ============================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

interface ParkResult {
  id: string;
  name: string;
  fullName: string;
  type: string;
  state: string;
  description: string;
  coordinates: { lat: number; lng: number };
  image?: string;
  website?: string;
  activities: string[];
  bestSeason: string;
  addedBy: "seed" | "ai_discovery";
}

// ============================================================
// Supabase search
// ============================================================
async function searchSupabase(query: string): Promise<ParkResult[]> {
  if (!supabase) return [];
  const q = query.toLowerCase().trim();

  // Try exact ID match first
  const idMatch = q.replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const { data: exactData } = await supabase.from("parks").select("*").eq("id", idMatch).limit(1);
  if (exactData && exactData.length > 0) return exactData.map(dbToResult);

  // Fuzzy search by name, full_name, state
  const { data, error } = await supabase
    .from("parks")
    .select("*")
    .or(`name.ilike.%${q}%,full_name.ilike.%${q}%,state.ilike.%${q}%`)
    .limit(10);

  if (error || !data) return [];
  return data.map(dbToResult);
}

function dbToResult(row: any): ParkResult {
  return {
    id: row.id,
    name: row.name,
    fullName: row.full_name || row.name,
    type: row.type || "national_park",
    state: row.state || "Unknown",
    description: row.description || "",
    coordinates: row.coordinates || { lat: 0, lng: 0 },
    image: row.hero_image || undefined,
    activities: row.activities || [],
    bestSeason: row.best_season || "Check park website",
    addedBy: row.ai_discovery ? "ai_discovery" : "seed",
  };
}

async function saveParkToSupabase(park: ParkResult): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from("parks").upsert({
    id: park.id,
    name: park.name,
    full_name: park.fullName,
    type: park.type,
    state: park.state,
    description: park.description,
    coordinates: park.coordinates,
    hero_image: park.image || null,
    activities: park.activities,
    best_season: park.bestSeason,
    ai_discovery: park.addedBy === "ai_discovery",
    source: "ai_discovery",
    updated_at: new Date().toISOString(),
  }, { onConflict: "id" });
  if (error) console.error("Failed to save park:", error);

  // Log discovery
  try {
    await supabase.from("park_discoveries").insert({
      query: park.fullName,
      park_id: park.id,
      source: "nominatim",
      coordinates: park.coordinates,
    });
  } catch {}
}

// ============================================================
// Activity profiles by park name keyword
// ============================================================
const parkActivityProfiles: Record<string, { activities: string[]; description: string; bestSeason: string }> = {
  springs: {
    activities: ["tubing", "swimming", "kayaking", "snorkeling", "hiking", "camping", "wildlife watching"],
    description: "A natural springs park featuring crystal-clear spring-fed waters perfect for tubing, swimming, kayaking, and snorkeling.",
    bestSeason: "Year-round (springs maintain ~72°F), busiest May-September",
  },
  hammock: {
    activities: ["hiking", "biking", "camping", "wildlife watching", "horseback riding"],
    description: "A hardwood hammock preserve with ancient oaks, boardwalk trails through cypress swamps, and diverse wildlife.",
    bestSeason: "October - April (cooler, fewer mosquitoes)",
  },
  river: {
    activities: ["kayaking", "canoeing", "fishing", "swimming", "camping", "hiking"],
    description: "A scenic river park offering paddling, fishing, and riverside trails.",
    bestSeason: "March - November",
  },
  lake: {
    activities: ["fishing", "kayaking", "swimming", "camping", "hiking", "boating"],
    description: "A lake recreation area with fishing, swimming beaches, boating access, and lakeside camping.",
    bestSeason: "April - October",
  },
  beach: {
    activities: ["swimming", "fishing", "kayaking", "hiking", "camping", "wildlife watching"],
    description: "A coastal park with pristine beaches, dunes, and coastal trails.",
    bestSeason: "March - November",
  },
  canyon: {
    activities: ["hiking", "rock climbing", "sightseeing", "camping", "photography"],
    description: "A dramatic canyon landscape with scenic overlooks and challenging trails.",
    bestSeason: "March - May, September - November",
  },
  forest: {
    activities: ["hiking", "biking", "camping", "wildlife watching", "horseback riding", "fishing"],
    description: "A forested preserve with miles of trails through diverse woodland ecosystems.",
    bestSeason: "Year-round, best in spring and fall",
  },
  falls: {
    activities: ["hiking", "swimming", "sightseeing", "photography", "camping"],
    description: "A waterfall park featuring cascading falls, swimming holes, and scenic hiking trails.",
    bestSeason: "Spring (peak water flow) through fall",
  },
  mountain: {
    activities: ["hiking", "rock climbing", "camping", "sightseeing", "biking"],
    description: "A mountain park with summit trails, panoramic views, and diverse terrain.",
    bestSeason: "May - October",
  },
  default: {
    activities: ["hiking", "camping", "sightseeing", "wildlife watching"],
    description: "A scenic park offering trails, natural habitats, and outdoor recreation.",
    bestSeason: "Check local listings for seasonal info",
  },
};

function getActivityProfile(parkName: string) {
  const lower = parkName.toLowerCase();
  for (const [keyword, profile] of Object.entries(parkActivityProfiles)) {
    if (keyword !== "default" && lower.includes(keyword)) return profile;
  }
  return parkActivityProfiles.default;
}

const stateSeasons: Record<string, string> = {
  FL: "October - April", Florida: "October - April",
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

// ============================================================
// Park Image Discovery
// ============================================================
async function findParkImage(parkName: string): Promise<string | undefined> {
  try {
    // Try Wikimedia Commons for a photo
    const wikiRes = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(parkName)}&prop=pageimages&format=json&pithumbsize=800&origin=*`
    );
    if (wikiRes.ok) {
      const wikiData = await wikiRes.json();
      const pages = wikiData.query?.pages;
      if (pages) {
        const page = Object.values(pages)[0] as any;
        if (page?.thumbnail?.source) return page.thumbnail.source;
      }
    }
  } catch {}

  try {
    // Fallback: Unsplash Source (free, no API key, redirects to image)
    // Use a themed URL based on park keywords
    const keywords = parkName.replace(/state park|national park|park/gi, "").trim();
    return `https://source.unsplash.com/800x400/?${encodeURIComponent(keywords + " nature park")}`;
  } catch {}

  return undefined;
}

// ============================================================
// AI Discovery: Nominatim + NPS
// ============================================================
async function discoverPark(query: string): Promise<ParkResult | null> {
  const qLower = query.toLowerCase();
  const isLikelyNational = qLower.includes("national") || qLower.includes("monument") || qLower.includes("nps");
  const id = query.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  // Step 1: Geocode with Nominatim (works for ALL parks)
  let geoResult: { lat: number; lng: number; state: string; displayName: string } | null = null;
  try {
    const searchQuery = qLower.includes("park") ? query : `${query} park`;
    const geoRes = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=3&addressdetails=1`,
      { headers: { "User-Agent": "TrailPlan/1.0 (contact@trailplan.app)" } }
    );
    if (geoRes.ok) {
      const geoData = await geoRes.json();
      const parkResult = geoData.find((r: any) =>
        r.type === "park" || r.type === "nature_reserve" || r.type === "national_park" ||
        r.class === "leisure" || r.class === "boundary" ||
        r.display_name?.toLowerCase().includes("park")
      ) || geoData[0];

      if (parkResult) {
        const stateGuess = parkResult.address?.state || parkResult.display_name?.split(",").slice(-2, -1)[0]?.trim() || "Unknown";
        geoResult = {
          lat: parseFloat(parkResult.lat),
          lng: parseFloat(parkResult.lon),
          state: stateGuess,
          displayName: parkResult.display_name || "",
        };
      }
    }
  } catch {}

  // Step 2: NPS API for national parks (richer data)
  if (isLikelyNational) {
    try {
      const npsRes = await fetch(
        `https://developer.nps.gov/api/v1/parks?q=${encodeURIComponent(query)}&limit=3&api_key=DEMO_KEY`
      );
      if (npsRes.ok) {
        const npsData = await npsRes.json();
        if (npsData.data?.length > 0) {
          const queryWords = qLower.replace(/national|park|state|monument/g, "").trim().split(/\s+/);
          const park = npsData.data.find((p: any) => {
            const pName = (p.fullName || p.name || "").toLowerCase();
            return queryWords.some((w: string) => w.length > 2 && pName.includes(w));
          });

          if (park) {
            const entry: ParkResult = {
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
              bestSeason: stateSeasons[park.states] || "Check park website",
              addedBy: "ai_discovery",
            };
            await saveParkToSupabase(entry);
            return entry;
          }
        }
      }
    } catch {}
  }

  // Step 3: Build from geocoding + keyword profile
  if (geoResult) {
    const profile = getActivityProfile(query);
    const cleanName = query.replace(/ state park| national park| park/gi, "").trim();
    const fullName = qLower.includes("park") ? query : `${query} Park`;

    const parkType = qLower.includes("state") ? "state_park"
      : qLower.includes("national forest") ? "national_forest"
      : qLower.includes("national") ? "national_park"
      : qLower.includes("monument") ? "monument"
      : "state_park";

    // Try to find an image
    const image = await findParkImage(fullName);

    const entry: ParkResult = {
      id,
      name: cleanName,
      fullName,
      type: parkType,
      state: geoResult.state,
      description: `${fullName} in ${geoResult.state}. ${profile.description}`,
      coordinates: { lat: geoResult.lat, lng: geoResult.lng },
      image,
      activities: profile.activities,
      bestSeason: stateSeasons[geoResult.state] || profile.bestSeason,
      addedBy: "ai_discovery",
    };

    await saveParkToSupabase(entry);
    return entry;
  }

  return null;
}

// ============================================================
// API Handler
// ============================================================
export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") || "";

  if (!query.trim()) {
    // Return all parks from Supabase
    if (supabase) {
      const { data } = await supabase.from("parks").select("*").order("name").limit(50);
      const results = (data || []).map(dbToResult);
      return NextResponse.json({ results, source: "database", total: results.length });
    }
    return NextResponse.json({ results: [], source: "database", total: 0 });
  }

  // 1. Search Supabase first
  const dbResults = await searchSupabase(query);
  if (dbResults.length > 0) {
    return NextResponse.json({
      results: dbResults,
      source: "database",
      total: dbResults.length,
      message: `Found ${dbResults.length} park(s) matching "${query}"`,
    });
  }

  // 2. AI discovery
  const discovered = await discoverPark(query);
  if (discovered) {
    return NextResponse.json({
      results: [discovered],
      source: "ai_discovery",
      total: 1,
      message: `🤖 AI discovered "${discovered.fullName}" and added it to TrailPlan!`,
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

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (body.action === "stats" && supabase) {
    const { data: all } = await supabase.from("parks").select("id, full_name, type, state, ai_discovery");
    const parks = all || [];
    return NextResponse.json({
      total: parks.length,
      seeded: parks.filter((p: any) => !p.ai_discovery).length,
      aiDiscovered: parks.filter((p: any) => p.ai_discovery).length,
      parks: parks.map((p: any) => ({ id: p.id, name: p.full_name, type: p.type, state: p.state, addedBy: p.ai_discovery ? "ai_discovery" : "seed" })),
    });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
