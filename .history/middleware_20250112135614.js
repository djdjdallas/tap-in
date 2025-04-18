export async function middleware(req) {
  console.log("Middleware: Processing request for:", req.nextUrl.pathname);
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  console.log("Middleware: Session exists:", !!session);

  // If not logged in and accessing a protected route
  if (!session && req.nextUrl.pathname.startsWith("/dashboard")) {
    console.log("Middleware: Redirecting to login");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // If logged in and accessing login page
  if (session && req.nextUrl.pathname === "/login") {
    console.log("Middleware: Redirecting to dashboard");
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return res;
}
