import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ============================================================
// Trip Generation API — backed by Supabase
// Takes wizard selections and generates a full itinerary
// ============================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

interface TripRequest {
  parks: {
    id: string;
    name: string;
    fullName: string;
    type: string;
    state: string;
    description: string;
    coordinates: { lat: number; lng: number };
    activities: string[];
    bestSeason: string;
    image?: string;
  }[];
  startDate: string;
  endDate: string;
  adults: number;
  kids: number;
  pets: boolean;
  activities: string[];
  fitness: string;
  lodging: string;
  pace: string;
  budget: string;
}

interface GeneratedSlot {
  activityId: string | null;
  startTime: string;
  endTime: string;
  notes: string;
  type: "activity" | "meal" | "custom";
  customTitle?: string;
  customDescription?: string;
  customType?: "note" | "destination";
}

interface GeneratedMeal {
  type: "breakfast" | "lunch" | "dinner";
  style: "restaurant" | "packed" | "campfire" | "grocery" | "picnic";
  name: string;
  notes: string;
}

interface GeneratedDay {
  date: string;
  label: string;
  slots: GeneratedSlot[];
  meals: GeneratedMeal[];
  travel: { from: string; to: string; mode: string }[];
  lodging: { name: string; type: string; departureTime: string; arrivalTime: string };
}

// In-memory trip store (production: database)
const tripStore = new Map<string, any>();

// Template activities by type
const activityTemplates: Record<string, { name: string; duration: number; difficulty: string }[]> = {
  hiking: [
    { name: "Morning Nature Trail", duration: 2, difficulty: "Easy" },
    { name: "Scenic Loop Hike", duration: 3, difficulty: "Moderate" },
    { name: "Summit Trail", duration: 4, difficulty: "Hard" },
    { name: "Boardwalk Trail", duration: 1.5, difficulty: "Easy" },
    { name: "Waterfall Trail", duration: 2.5, difficulty: "Moderate" },
    { name: "Ridge Trail", duration: 3.5, difficulty: "Hard" },
  ],
  biking: [
    { name: "Paved Bike Path", duration: 2, difficulty: "Easy" },
    { name: "Mountain Bike Loop", duration: 3, difficulty: "Moderate" },
    { name: "Trail Cycling Route", duration: 2.5, difficulty: "Moderate" },
  ],
  fishing: [
    { name: "Lake Fishing", duration: 3, difficulty: "Easy" },
    { name: "River Fly Fishing", duration: 4, difficulty: "Moderate" },
    { name: "Pier Fishing", duration: 2, difficulty: "Easy" },
  ],
  kayaking: [
    { name: "Lake Kayaking", duration: 2.5, difficulty: "Easy" },
    { name: "River Kayaking", duration: 3, difficulty: "Moderate" },
    { name: "Coastal Kayak Tour", duration: 4, difficulty: "Moderate" },
  ],
  sightseeing: [
    { name: "Scenic Overlook Drive", duration: 2, difficulty: "Easy" },
    { name: "Visitor Center & Museum", duration: 1.5, difficulty: "Easy" },
    { name: "Guided Nature Tour", duration: 2.5, difficulty: "Easy" },
    { name: "Photography Walk", duration: 2, difficulty: "Easy" },
  ],
  camping: [
    { name: "Campsite Setup & Fire", duration: 2, difficulty: "Easy" },
    { name: "Stargazing Session", duration: 1.5, difficulty: "Easy" },
  ],
  "wildlife watching": [
    { name: "Wildlife Safari Drive", duration: 3, difficulty: "Easy" },
    { name: "Bird Watching Walk", duration: 2, difficulty: "Easy" },
    { name: "Dawn Wildlife Observation", duration: 2.5, difficulty: "Easy" },
  ],
  "horseback riding": [
    { name: "Trail Horseback Ride", duration: 2, difficulty: "Easy" },
    { name: "Guided Horse Tour", duration: 3, difficulty: "Moderate" },
  ],
  "rock climbing": [
    { name: "Beginner Climbing Wall", duration: 2, difficulty: "Moderate" },
    { name: "Bouldering Session", duration: 3, difficulty: "Hard" },
  ],
  swimming: [
    { name: "Lake Swimming", duration: 1.5, difficulty: "Easy" },
    { name: "Natural Springs Swim", duration: 2, difficulty: "Easy" },
  ],
};

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

function getDayCount(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  const diff = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, Math.min(diff, 14)); // Cap at 14 days
}

async function generateTrip(req: TripRequest) {
  const tripId = `trip-${generateId()}`;
  const mainPark = req.parks[0];
  const dayCount = getDayCount(req.startDate, req.endDate);
  const slug = mainPark.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-adventure";

  // Determine activities per day based on pace
  const activitiesPerDay = req.pace === "relaxed" ? 1 : req.pace === "packed" ? 3 : 2;

  // Build available activity pool
  const activityPool: { name: string; duration: number; difficulty: string; type: string; parkName: string }[] = [];
  for (const act of req.activities) {
    const templates = activityTemplates[act] || activityTemplates.sightseeing;
    for (const t of templates) {
      // Filter by fitness level
      if (req.fitness === "easy" && t.difficulty === "Hard") continue;
      if (req.fitness === "expert" || req.fitness === "hard") {
        // Include everything
      } else if (req.fitness === "moderate" && t.difficulty === "Hard") {
        // 50% chance to include hard activities
        if (Math.random() > 0.5) continue;
      }
      activityPool.push({ ...t, type: act, parkName: mainPark.name });
    }
  }

  // If pool is empty, add generic sightseeing
  if (activityPool.length === 0) {
    activityPool.push(
      { name: "Explore the Park", duration: 2, difficulty: "Easy", type: "sightseeing", parkName: mainPark.name },
      { name: "Visitor Center Tour", duration: 1.5, difficulty: "Easy", type: "sightseeing", parkName: mainPark.name },
    );
  }

  // Shuffle pool
  activityPool.sort(() => Math.random() - 0.5);

  // Meal style based on lodging preference
  const mealStyles = req.lodging === "camping"
    ? ["packed", "campfire", "packed"]
    : req.lodging === "hotel"
    ? ["restaurant", "packed", "restaurant"]
    : ["restaurant", "packed", "campfire"];

  // Lodging name based on preference
  const lodgingName = req.lodging === "camping"
    ? `${mainPark.name} Campground`
    : req.lodging === "hotel"
    ? `${mainPark.name} Lodge`
    : `${mainPark.name} Lodge / Campsite`;

  const lodgingType = req.lodging === "camping" ? "campsite" : "lodge";

  // Generate days
  const days: GeneratedDay[] = [];
  let activityIndex = 0;

  for (let d = 0; d < dayCount; d++) {
    const date = new Date(req.startDate);
    date.setDate(date.getDate() + d);
    const dateStr = date.toISOString().split("T")[0];

    // Pick which park this day is at
    const parkForDay = req.parks.length > 1
      ? req.parks[Math.min(d, req.parks.length - 1)]
      : mainPark;

    const isFirstDay = d === 0;
    const isLastDay = d === dayCount - 1;

    const departTime = isFirstDay ? "6:00 AM" : (req.pace === "relaxed" ? "8:30 AM" : "7:00 AM");
    const arriveTime = req.pace === "relaxed" ? "8:00 PM" : "9:00 PM";

    // Build activity slots
    const slots: GeneratedSlot[] = [];
    const slotCount = isFirstDay || isLastDay ? Math.max(1, activitiesPerDay - 1) : activitiesPerDay;

    const startHour = req.pace === "relaxed" ? 10 : 9;

    for (let s = 0; s < slotCount; s++) {
      const act = activityPool[activityIndex % activityPool.length];
      activityIndex++;

      const hour = startHour + s * 3;
      const startTime = `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? "PM" : "AM"}`;
      const endHour = hour + act.duration;
      const endTime = `${endHour > 12 ? endHour - 12 : endHour}:${act.duration % 1 === 0.5 ? "30" : "00"} ${endHour >= 12 ? "PM" : "AM"}`;

      slots.push({
        activityId: `gen-${generateId()}`,
        startTime,
        endTime,
        notes: `${act.name} at ${parkForDay.name}`,
        type: "activity",
        customTitle: act.name,
        customDescription: `${act.difficulty} · ${act.duration}h · ${act.type}`,
      });
    }

    // Meals
    const meals: GeneratedMeal[] = [
      { type: "breakfast", style: mealStyles[0] as any, name: isFirstDay ? "Quick breakfast before heading out" : `Breakfast at ${lodgingName}`, notes: "" },
      { type: "lunch", style: mealStyles[1] as any, name: req.lodging === "camping" ? "Trail lunch (packed)" : "Lunch break", notes: "" },
      { type: "dinner", style: mealStyles[2] as any, name: isLastDay ? "Farewell dinner" : `Dinner${req.lodging === "camping" ? " at campfire" : " at nearby restaurant"}`, notes: "" },
    ];

    days.push({
      date: dateStr,
      label: `Day ${d + 1}${parkForDay.id !== mainPark.id ? ` — ${parkForDay.name}` : ""}`,
      slots,
      meals,
      travel: [],
      lodging: {
        name: lodgingName,
        type: lodgingType,
        departureTime: departTime,
        arrivalTime: arriveTime,
      },
    });
  }

  const trip = {
    id: tripId,
    slug,
    name: `${mainPark.name} Adventure${req.parks.length > 1 ? ` + ${req.parks.length - 1} more` : ""} — ${dayCount} Days`,
    parks: req.parks,
    mainParkId: mainPark.id,
    days,
    settings: {
      adults: req.adults,
      kids: req.kids,
      pets: req.pets,
      activities: req.activities,
      fitness: req.fitness,
      lodging: req.lodging,
      pace: req.pace,
      budget: req.budget,
      startDate: req.startDate,
      endDate: req.endDate,
    },
    createdAt: new Date().toISOString(),
  };

  // Store in memory (fallback)
  tripStore.set(tripId, trip);
  tripStore.set(slug, trip);

  // Save to Supabase
  if (supabase) {
    await supabase.from("trips").upsert({
      id: tripId,
      name: trip.name,
      slug,
      status: "planning",
      main_park_id: mainPark.id,
      parks: trip.parks,
      days: trip.days,
      settings: trip.settings,
      dates: { start: req.startDate, end: req.endDate },
      shared: false,
    }, { onConflict: "id" }).then(({ error }) => {
      if (error) console.error("Failed to save trip to Supabase:", error);
    });
  }

  return trip;
}

export async function POST(request: NextRequest) {
  try {
    const body: TripRequest = await request.json();

    if (!body.parks || body.parks.length === 0) {
      return NextResponse.json({ error: "At least one park is required" }, { status: 400 });
    }

    const trip = await generateTrip(body);

    return NextResponse.json({
      ok: true,
      tripId: trip.id,
      slug: trip.slug,
      name: trip.name,
      dayCount: trip.days.length,
      redirect: `/trip/${trip.slug}`,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to generate trip" }, { status: 500 });
  }
}

// GET: retrieve a stored trip
export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id") || "";

  // Check in-memory first (fast)
  const memTrip = tripStore.get(id);
  if (memTrip) return NextResponse.json(memTrip);

  // Check Supabase
  if (supabase) {
    // Try by ID
    let { data } = await supabase.from("trips").select("*").eq("id", id).single();
    // Try by slug
    if (!data) {
      const slugResult = await supabase.from("trips").select("*").eq("slug", id).single();
      data = slugResult.data;
    }
    if (data) {
      // Reconstruct trip format from DB row
      const trip = {
        id: data.id,
        name: data.name,
        slug: data.slug,
        mainParkId: data.main_park_id,
        parks: data.parks || [],
        days: data.days || [],
        settings: data.settings || {},
        createdAt: data.created_at,
      };
      // Cache in memory
      tripStore.set(data.id, trip);
      if (data.slug) tripStore.set(data.slug, trip);
      return NextResponse.json(trip);
    }
  }

  return NextResponse.json({ error: "Trip not found" }, { status: 404 });
}
