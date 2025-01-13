// app/api/analytics/route.js
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const body = await request.json();
    const { link_id, event_type } = body;

    // Get user session
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();
    if (authError) throw authError;

    // Verify the link belongs to a valid user
    const { data: link, error: linkError } = await supabase
      .from("links")
      .select("user_id")
      .eq("id", link_id)
      .single();

    if (linkError) throw linkError;

    // Record the analytics event
    const { error: analyticsError } = await supabase.from("analytics").insert({
      link_id,
      user_id: link.user_id,
      event_type,
      ip_address: request.headers.get("x-forwarded-for") || "unknown",
      user_agent: request.headers.get("user-agent") || "unknown",
      referrer: request.headers.get("referer") || "unknown",
    });

    if (analyticsError) throw analyticsError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
