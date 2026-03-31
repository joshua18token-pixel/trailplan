import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ parkId: string }> }
) {
  const { parkId } = await params;
  const supabase = await createClient();

  const { data: rawPhotos, error } = await supabase
    .from("park_photos")
    .select("*")
    .eq("park_id", parkId)
    .order("created_at", { ascending: false });

  if (error || !rawPhotos) {
    return NextResponse.json({ error: error?.message || "Failed to load" }, { status: 500 });
  }

  // Fetch profiles
  const userIds = [...new Set(rawPhotos.map((p: any) => p.user_id))];
  const { data: profiles } = userIds.length > 0
    ? await supabase.from("profiles").select("id, display_name, avatar_url").in("id", userIds)
    : { data: [] };

  const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));
  const photos = rawPhotos.map((p: any) => ({
    ...p,
    profiles: profileMap.get(p.user_id) || { display_name: "Anonymous", avatar_url: null },
  }));

  return NextResponse.json({ photos });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ parkId: string }> }
) {
  const { parkId } = await params;
  
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  
  if (!token) {
    return NextResponse.json({ error: "Unauthorized", details: "No token provided" }, { status: 401 });
  }

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  
  if (!user || authError) {
    return NextResponse.json({ error: "Unauthorized", details: authError?.message || "Invalid token" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File;
  const caption = formData.get("caption") as string;

  if (!file) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  // Upload to Supabase Storage
  const fileExt = file.name.split(".").pop();
  const fileName = `${user.id}/${Date.now()}.${fileExt}`;

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("park-photos")
    .upload(fileName, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from("park-photos")
    .getPublicUrl(fileName);

  // Save to database
  const { data: photo, error: dbError } = await supabase
    .from("park_photos")
    .insert({
      park_id: parkId,
      user_id: user.id,
      photo_url: publicUrl,
      caption: caption || null,
    })
    .select("*")
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  // Get profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, avatar_url")
    .eq("id", user.id)
    .single();

  return NextResponse.json({ 
    photo: {
      ...photo,
      profiles: profile || { display_name: user.email?.split("@")[0] || "User", avatar_url: null },
    }
  });
}
