// middleware.js
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const { pathname } = req.nextUrl;

  // Don't process system routes
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js)$/) ||
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/dashboard" ||
    pathname.startsWith("/preview")
  ) {
    return res;
  }

  // Handle dashboard routes - authentication check
  if (pathname.startsWith("/dashboard")) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return res;
  }

  // Possible username route - single segment paths that match username pattern
  if (pathname.match(/^\/[a-z0-9][a-z0-9-]{2,28}[a-z0-9]$/)) {
    const username = pathname.slice(1);
    try {
      // Check if username exists in database
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username")
        .eq("username", username)
        .single();

      if (error || !data) {
        // Don't redirect - let the Next.js 404 handling work
        console.log(
          `Username ${username} not found - will show not-found page`
        );
      } else {
        console.log(`Username ${username} found - will show profile page`);
        // Add profile data to response headers to improve performance
        res.headers.set("X-Profile-Found", "true");
      }
    } catch (error) {
      console.error("Error in middleware:", error);
      // On error, still allow the request to proceed to Next.js handling
    }
  }

  return res;
}

export const config = {
  matcher: [
    // Match all routes except static files and api routes
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
