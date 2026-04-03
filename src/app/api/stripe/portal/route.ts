import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAuthClient } from "@/lib/supabase-auth";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAuthClient(token);
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (!user || authError) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (!profile?.stripe_customer_id) {
    return NextResponse.json({ error: "No subscription found" }, { status: 404 });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${request.nextUrl.origin}/profile`,
  });

  return NextResponse.json({ url: session.url });
}
