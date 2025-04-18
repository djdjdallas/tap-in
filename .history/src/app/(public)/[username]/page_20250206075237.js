// app/[username]/page.js
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Profile from "@/components/Profile";
import LinkContainer from "@/components/LinkContainer";

export default async function ProfilePage({ params }) {
  const { username } = params;
  const supabase = createServerComponentClient({ cookies });

  // Fetch profile and links data
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(
      `
      *,
      subtitles (
        id,
        text,
        order_index
      ),
      links (
        id,
        title,
        url,
        icon,
        username,
        order_index,
        subtitle_id
      )
    `
    )
    .eq("username", username)
    .single();

  // If no profile found, show 404
  if (profileError || !profile) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gradient-to-tr from-gray-50 via-gray-100 to-gray-50 py-16 px-6">
      <div className="max-w-2xl mx-auto space-y-8">
        <Profile
          name={profile.name}
          title={profile.title}
          avatarUrl={profile.avatar_url}
          location={profile.location}
          availability={profile.availability}
        />

        <LinkContainer subtitles={profile.subtitles} links={profile.links} />

        <div className="text-center text-sm text-gray-500">
          <a href="https://tap-in.io" className="hover:text-gray-700">
            ⚡️ Powered by tap-in.io
          </a>
        </div>
      </div>
    </main>
  );
}
