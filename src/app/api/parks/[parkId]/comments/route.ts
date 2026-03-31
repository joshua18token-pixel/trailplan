import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ parkId: string }> }
) {
  const { parkId } = await params;
  const supabase = await createClient();

  const { data: comments, error } = await supabase
    .from("park_comments")
    .select(`
      *,
      profiles:user_id (
        display_name,
        avatar_url
      )
    `)
    .eq("park_id", parkId)
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ comments: comments || [] });
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

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  
  if (!user || authError) {
    console.error("Auth error:", authError);
    return NextResponse.json({ error: "Unauthorized", details: authError?.message || "Invalid token" }, { status: 401 });
  }

  const body = await request.json();
  const { content, photo_url } = body;

  if (!content || content.trim().length === 0) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  const { data: comment, error } = await supabase
    .from("park_comments")
    .insert({
      park_id: parkId,
      user_id: user.id,
      content: content.trim(),
      photo_url: photo_url || null,
    })
    .select(`
      *,
      profiles:user_id (
        display_name,
        avatar_url
      )
    `)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ comment });
}
