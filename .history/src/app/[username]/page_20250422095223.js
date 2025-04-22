"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { notFound } from "next/navigation";
import Image from "next/image";
import { ClientOnlyComponent } from "@/components/ClientWrappers";

// Import the fixed components
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
    async function fetchProfileData() {
      try {
        setIsLoading(true);

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

  // Handle loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-gray-50 via-gray-100 to-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-gray-50 via-gray-100 to-gray-50">
        <div className="max-w-md p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-red-500 mb-2">Error</h2>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  // Handle not found (should be caught by the notFound() call, but just in case)
  if (!profile) {
    return notFound();
  }

  // Get avatar URL with fallback
  const avatarUrl = profile.avatar_url || "/api/placeholder/128/128";

  return (
    <ClientOnlyComponent>
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
    </ClientOnlyComponent>
  );
}
