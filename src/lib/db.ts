import { supabase } from "./supabase";

// ============================================
// PARKS
// ============================================

export interface DBPark {
  id: string;
  name: string;
  full_name: string | null;
  type: string;
  state: string | null;
  region: string | null;
  description: string | null;
  coordinates: { lat: number; lng: number } | null;
  activities: string[];
  best_season: string | null;
  hero_image: string | null;
  nps_code: string | null;
  ai_discovery: boolean;
  source: string | null;
}

export async function searchParks(query: string): Promise<DBPark[]> {
  const q = query.toLowerCase().trim();
  const { data, error } = await supabase
    .from("parks")
    .select("*")
    .or(`name.ilike.%${q}%,full_name.ilike.%${q}%,state.ilike.%${q}%`)
    .limit(10);

  if (error) {
    console.error("searchParks error:", error);
    return [];
  }
  return data || [];
}

export async function getPark(id: string): Promise<DBPark | null> {
  const { data, error } = await supabase
    .from("parks")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}

export async function upsertPark(park: Partial<DBPark> & { id: string }): Promise<DBPark | null> {
  const { data, error } = await supabase
    .from("parks")
    .upsert(park, { onConflict: "id" })
    .select()
    .single();

  if (error) {
    console.error("upsertPark error:", error);
    return null;
  }
  return data;
}

// ============================================
// TRIPS
// ============================================

export interface DBTrip {
  id: string;
  user_id: string | null;
  name: string;
  slug: string | null;
  status: string;
  main_park_id: string | null;
  parks: any[];
  days: any[];
  settings: any;
  travel_from: any;
  dates: any;
  shared: boolean;
  is_template: boolean;
  template_source: string | null;
  created_at: string;
  updated_at: string;
}

export async function saveTrip(trip: Partial<DBTrip> & { id: string; name: string }): Promise<DBTrip | null> {
  const { data, error } = await supabase
    .from("trips")
    .upsert({
      ...trip,
      updated_at: new Date().toISOString(),
    }, { onConflict: "id" })
    .select()
    .single();

  if (error) {
    console.error("saveTrip error:", error);
    return null;
  }
  return data;
}

export async function getTrip(id: string): Promise<DBTrip | null> {
  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data;
}

export async function getTripBySlug(slug: string): Promise<DBTrip | null> {
  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) return null;
  return data;
}

export async function getUserTrips(userId: string): Promise<DBTrip[]> {
  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("getUserTrips error:", error);
    return [];
  }
  return data || [];
}

export async function deleteTrip(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("trips")
    .delete()
    .eq("id", id);

  return !error;
}

// ============================================
// COMMUNITY TRIPS
// ============================================

export async function getCommunityTrips(options?: {
  featured?: boolean;
  limit?: number;
  offset?: number;
  sort?: "votes" | "newest" | "popular";
}): Promise<any[]> {
  let query = supabase.from("community_trips").select("*");

  if (options?.featured) {
    query = query.eq("featured", true);
  }

  if (options?.sort === "votes" || options?.sort === "popular") {
    query = query.order("vote_count", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  if (options?.limit) query = query.limit(options.limit);
  if (options?.offset) query = query.range(options.offset, options.offset + (options.limit || 10) - 1);

  const { data, error } = await query;
  if (error) {
    console.error("getCommunityTrips error:", error);
    return [];
  }
  return data || [];
}

// ============================================
// PARK DISCOVERY LOG
// ============================================

export async function logParkDiscovery(query: string, parkId: string, source: string, coordinates?: { lat: number; lng: number }) {
  await supabase.from("park_discoveries").insert({
    query,
    park_id: parkId,
    source,
    coordinates,
  });
}
