import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  const { commentId } = await params;
  
  // Get token from Authorization header
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  
  if (!user || authError) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if already liked
  const { data: existing } = await supabase
    .from("park_comment_likes")
    .select("id")
    .eq("comment_id", commentId)
    .eq("user_id", user.id)
    .single();

  if (existing) {
    return NextResponse.json({ error: "Already liked" }, { status: 400 });
  }

  const { error } = await supabase
    .from("park_comment_likes")
    .insert({
      comment_id: commentId,
      user_id: user.id,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  const { commentId } = await params;
  
  // Get token from Authorization header
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  
  if (!user || authError) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("park_comment_likes")
    .delete()
    .eq("comment_id", commentId)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
