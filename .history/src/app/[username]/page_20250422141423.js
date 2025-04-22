// src/app/[username]/page.js
"use client";

import { useEffect, useState, useRef } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { notFound, useRouter } from "next/navigation";

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
  const initialLoadComplete = useRef(false);
  const router = useRouter();

  useEffect(() => {
    // Stabilization - prevent multiple fetches/renders
    if (initialLoadComplete.current) return;

    async function fetchProfileData() {
      try {
        console.log("Fetching profile data for username:", username);
        setIsLoading(true);
        setError(null);

        // First fetch the profile data with a timeout to ensure consistency
        const profilePromise = supabase
          .from("profiles")
          .select("*")
          .eq("username", username)
          .single();

        // Set a timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Profile fetch timeout")), 5000)
        );

        // Race the profile fetch against the timeout
        const { data: profileData, error: profileError } = await Promise.race([
          profilePromise,
          timeoutPromise.then(() => ({
            data: null,
            error: { message: "Timeout" },
          })),
        ]);

        // Handle profile not found - but don't trigger notFound() until all checks complete
        if (profileError || !profileData) {
          console.error(
            "Profile error or not found:",
            profileError?.message || "No data"
          );
          setError(profileError?.message || "Profile not found");
          setIsLoading(false);
          initialLoadComplete.current = true;
          return;
        }

        console.log("Profile found:", profileData.username);
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

        // Mark loading as complete only after all data is ready
        initialLoadComplete.current = true;
      } catch (err) {
        console.error("Error fetching profile data:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfileData();

    // Cleanup function to handle component unmount
    return () => {
      initialLoadComplete.current = true;
    };
  }, [username, supabase]);

  // Handle the not found case only after loading has completed
  useEffect(() => {
    if (!isLoading && (!profile || error)) {
      // Small delay to ensure stable state
      const timer = setTimeout(() => {
        console.log("Profile not found, showing 404");
        notFound();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isLoading, profile, error]);

  // Show a proper loading state that matches the final layout
  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-tr from-gray-50 via-gray-100 to-gray-50 py-16 px-6">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <div className="relative w-32 h-32 mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-full opacity-40"></div>
              <div className="absolute inset-[3px] bg-gray-100 rounded-full"></div>
            </div>
            <div className="h-8 w-48 bg-gray-200 rounded mx-auto"></div>
            <div className="h-4 w-32 bg-gray-200 rounded mx-auto"></div>
          </div>
          <div className="space-y-4">
            <div className="h-8 w-32 bg-gray-200 rounded"></div>
            <div className="space-y-2">
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Only render the profile when we have complete data
  return (
    <main className="min-h-screen bg-gradient-to-tr from-gray-50 via-gray-100 to-gray-50 py-16 px-6">
      <div className="max-w-2xl mx-auto space-y-8">
        <Profile
          name={profile?.name}
          title={profile?.title}
          avatarUrl={profile?.avatar_url}
          location={profile?.location}
          availability={profile?.availability}
          userId={profile?.id}
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
