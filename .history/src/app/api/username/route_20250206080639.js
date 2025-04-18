// app/api/username/route.js
export async function POST(req) {
  const { username } = await req.json();
  const supabase = createRouteHandlerClient({ cookies });

  const { data, error } = await supabase
    .from("profiles")
    .select("username")
    .eq("username", username)
    .single();

  return NextResponse.json({ available: !data });
}
