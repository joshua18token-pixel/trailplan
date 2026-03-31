import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createAuthClient } from "@/lib/supabase-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ parkId: string }> }
) {
  const { parkId } = await params;

  // Fetch comments (anon client is fine for SELECT — RLS allows all reads)
  const { data: rawComments, error } = await supabase
    .from("park_comments")
    .select("*")
    .eq("park_id", parkId)
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (error || !rawComments) {
    return NextResponse.json({ error: error?.message || "Failed to load" }, { status: 500 });
  }

  // Fetch profiles for all comment authors
  const userIds = [...new Set(rawComments.map((c: any) => c.user_id))];
  const { data: profiles } = userIds.length > 0
    ? await supabase.from("profiles").select("id, display_name, avatar_url").in("id", userIds)
    : { data: [] };

  const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));
  const comments = rawComments.map((c: any) => ({
    ...c,
    profiles: profileMap.get(c.user_id) || { display_name: "Anonymous", avatar_url: null },
  }));

  return NextResponse.json({ comments });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ parkId: string }> }
) {
  const { parkId } = await params;

  // Get token from Authorization header
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json({ error: "Unauthorized", details: "No token provided" }, { status: 401 });
  }

  // Verify user
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (!user || authError) {
    return NextResponse.json({ error: "Unauthorized", details: authError?.message || "Invalid token" }, { status: 401 });
  }

  const body = await request.json();
  const { content, photo_url } = body;

  if (!content || content.trim().length === 0) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  // Use authenticated client so auth.uid() works for RLS
  const authClient = createAuthClient(token);

  const { data: comment, error } = await authClient
    .from("park_comments")
    .insert({
      park_id: parkId,
      user_id: user.id,
      content: content.trim(),
      photo_url: photo_url || null,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, avatar_url")
    .eq("id", user.id)
    .single();

  return NextResponse.json({
    comment: {
      ...comment,
      profiles: profile || { display_name: user.email?.split("@")[0] || "User", avatar_url: null },
    }
  });
}
