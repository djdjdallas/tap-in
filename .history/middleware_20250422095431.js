// middleware.js
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const { pathname } = req.nextUrl;

  // Debug info for troubleshooting
  console.log("Middleware processing path:", pathname);

  // Allow public profile access - matches paths like /username but not paths that start with specific keywords
  // This is a more specific regex than before to avoid catching admin routes
  if (
    pathname.match(/^\/[^\/]+$/) && // Only match single segment routes like /username
    !pathname.startsWith("/api") &&
    !pathname.startsWith("/_next") &&
    !pathname.startsWith("/dashboard") &&
    !pathname.startsWith("/login") &&
    !pathname.startsWith("/preview") &&
    !pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js)$/)
  ) {
    console.log("Public profile access detected:", pathname);

    // Check if the username exists (optional - adds DB query overhead)
    try {
      const username = pathname.slice(1); // Remove the leading slash

      // Only check for alphanumeric usernames to avoid unnecessary DB queries
      if (/^[a-z0-9][a-z0-9-]{2,28}[a-z0-9]$/.test(username)) {
        const { data } = await supabase
          .from("profiles")
          .select("id")
          .eq("username", username)
          .single();

        if (data) {
          console.log("Valid profile found for:", username);
          return res;
        }
      }
    } catch (error) {
      console.error("Error checking username:", error);
    }
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

  // Redirect logged-in users from login
  if (pathname === "/login") {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
};
