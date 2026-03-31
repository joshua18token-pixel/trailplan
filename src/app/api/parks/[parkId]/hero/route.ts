import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createAuthClient } from "@/lib/supabase-auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ parkId: string }> }
) {
  const { parkId } = await params;

  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["super_admin", "moderator"].includes(profile.role)) {
    return NextResponse.json({ error: "Moderator access required" }, { status: 403 });
  }

  const authClient = createAuthClient(token);
  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  // Upload to storage
  const fileExt = file.name.split(".").pop();
  const fileName = `heroes/${parkId}.${fileExt}`;

  const { error: uploadError } = await authClient.storage
    .from("park-photos")
    .upload(fileName, file, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: { publicUrl } } = authClient.storage
    .from("park-photos")
    .getPublicUrl(fileName);

  // Update park hero_image
  const { error: dbError } = await authClient
    .from("parks")
    .update({ hero_image: publicUrl })
    .eq("id", parkId);

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, hero_image: publicUrl });
}
