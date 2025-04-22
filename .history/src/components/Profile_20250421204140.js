// app/[username]/page.js
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

// Import the fixed components
import Profile from "@/components/Profile";
import LinkContainer from "@/components/LinkContainer";

export const dynamic = "force-dynamic";

export default async function ProfilePage({ params }) {
  const { username } = params;
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });

  try {
    // Fetch profile data
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", username)
      .single();

    // If no profile found, show 404
    if (profileError || !profile) {
      console.error("Profile not found or error:", profileError);
      notFound();
    }

    // Fetch subtitles and links separately
    const [subtitlesResponse, linksResponse] = await Promise.all([
      supabase
        .from("subtitles")
        .select("*")
        .eq("user_id", profile.id)
        .order("order_index", { ascending: true }),
      supabase
        .from("links")
        .select("*")
        .eq("user_id", profile.id)
        .order("order_index", { ascending: true }),
    ]);

    const subtitles = subtitlesResponse.data || [];
    const links = linksResponse.data || [];

    // Get public URL for avatar (the client component will handle signing the URL)
    let avatarUrl = profile.avatar_url || "/api/placeholder/128/128";

    return (
      <main className="min-h-screen bg-gradient-to-tr from-gray-50 via-gray-100 to-gray-50 py-16 px-6">
        <div className="max-w-2xl mx-auto space-y-8">
          <Profile
            name={profile.name}
            title={profile.title}
            avatarUrl={avatarUrl}
            location={profile.location}
            availability={profile.availability}
            userId={profile.id}
            isEditable={false}
          />
          <LinkContainer subtitles={subtitles} links={links} />
          <div className="text-center text-sm text-gray-500">
            <a href="https://tap-in.io" className="hover:text-gray-700">
              ⚡️ Powered by tap-in.io
            </a>
          </div>
        </div>
      </main>
    );
  } catch (error) {
    console.error("Error in ProfilePage:", error);
    notFound();
  }
}
