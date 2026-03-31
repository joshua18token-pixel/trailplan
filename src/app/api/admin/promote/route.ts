import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createAuthClient } from "@/lib/supabase-auth";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify caller is super_admin
  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: callerProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (callerProfile?.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden — super admin only" }, { status: 403 });
  }

  const { email, role } = await request.json();

  if (!email || !["moderator", "user"].includes(role)) {
    return NextResponse.json({ error: "Valid email and role (moderator/user) required" }, { status: 400 });
  }

  // Find user by email and update role
  const authClient = createAuthClient(token);
  const { data: targetProfile, error: findError } = await authClient
    .from("profiles")
    .select("id, email, display_name, role")
    .eq("email", email)
    .single();

  if (!targetProfile || findError) {
    return NextResponse.json({ error: "User not found with that email" }, { status: 404 });
  }

  const { error: updateError } = await authClient
    .from("profiles")
    .update({ role })
    .eq("id", targetProfile.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    user: {
      email: targetProfile.email,
      display_name: targetProfile.display_name,
      previousRole: targetProfile.role,
      newRole: role,
    },
  });
}
