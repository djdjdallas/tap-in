// middleware.js - UPDATED
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const { pathname } = req.nextUrl;

  // Simplified regex for username routes - only match single segment paths
  const isUsernameRoute = pathname.match(/^\/[a-z0-9][a-z0-9-]{2,28}[a-z0-9]$/);

  // Known system routes should be excluded
  const isSystemRoute =
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/preview") ||
    pathname === "/" ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js)$/);

  // Public profile access
  if (isUsernameRoute && !isSystemRoute) {
    try {
      const username = pathname.slice(1);
      const { data } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .single();

      if (data) {
        return res;
      }
    } catch (error) {
      console.error("Error checking username:", error);
    }

    // If username doesn't exist, continue to let Next.js 404 handling work
  }

  // Protected routes
  if (pathname.startsWith("/dashboard")) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
