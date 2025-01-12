// app/api/auth/callback/route.js
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// app/api/auth/callback/route.js
export async function GET(request) {
  console.log("Callback: Processing auth callback");
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    console.log("Callback: Found auth code");
    const supabase = createRouteHandlerClient({ cookies });
    await supabase.auth.exchangeCodeForSession(code);
    console.log("Callback: Exchanged code for session");
  }

  return NextResponse.redirect(new URL("/dashboard", request.url));
}
