// middleware.js
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const { pathname } = req.nextUrl;

  // Allow public profile access
  if (
    pathname.match(/^\/[^\/]+$/) &&
    !pathname.startsWith("/api") &&
    !pathname.startsWith("/dashboard")
  ) {
    return res;
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protected routes
  if (!session && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Redirect logged-in users from login
  if (session && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
};
