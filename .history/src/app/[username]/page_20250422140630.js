// src/app/[username]/page.js - UPDATED
"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { notFound } from "next/navigation";

// Import components
import Profile from "@/components/Profile";
import LinkContainer from "@/components/LinkContainer";

export default function ProfilePage({ params }) {
  const { username } = params;
  const [profile, setProfile] = useState(null);
  const [subtitles, setSubtitles] = useState([]);
  const [links, setLinks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (!username) {
      notFound();
      return;
    }

    async function fetchProfileData() {
      try {
        setIsLoading(true);
        setError(null);

        // First fetch the profile data
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("username", username)
          .single();

        // Handle profile not found
        if (profileError) {
          if (profileError.code === "PGRST116") {
            console.error("Profile not found:", username);
            notFound();
            return;
          }
          throw profileError;
        }

        if (!profileData) {
          notFound();
          return;
        }

        setProfile(profileData);

        // Now fetch subtitles and links
        const [subtitlesResponse, linksResponse] = await Promise.all([
          supabase
            .from("subtitles")
            .select("*")
            .eq("user_id", profileData.id)
            .order("order_index", { ascending: true }),
          supabase
            .from("links")
            .select("*")
            .eq("user_id", profileData.id)
            .order("order_index", { ascending: true }),
        ]);

        if (subtitlesResponse.error) throw subtitlesResponse.error;
        if (linksResponse.error) throw linksResponse.error;

        setSubtitles(subtitlesResponse.data || []);
        setLinks(linksResponse.data || []);
      } catch (err) {
        console.error("Error fetching profile data:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfileData();
  }, [username, supabase]);

  // Return a loading state with the same structure as the final component
  // to prevent hydration mismatches
  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-tr from-gray-50 via-gray-100 to-gray-50 py-16 px-6">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <div className="relative w-32 h-32 mx-auto">
              <div className="animate-pulse rounded-full h-32 w-32 bg-gray-200"></div>
            </div>
            <div className="animate-pulse h-8 w-48 bg-gray-200 rounded mx-auto"></div>
            <div className="animate-pulse h-4 w-32 bg-gray-200 rounded mx-auto"></div>
          </div>
        </div>
      </main>
    );
  }

  // If the profile doesn't exist, show the 404 page
  if (!profile && !isLoading) {
    return notFound();
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
}
