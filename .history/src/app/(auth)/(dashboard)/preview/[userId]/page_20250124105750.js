// app/preview/[userId]/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { socialIcons } from "@/utils/socialIcons";

export default function PreviewPage({ params }) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [profile, setProfile] = useState(null);
  const [subtitles, setSubtitles] = useState([]);
  const [links, setLinks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", params.userId)
          .single();

        if (profileError) throw profileError;

        // Fetch subtitles
        const { data: subtitlesData, error: subtitlesError } = await supabase
          .from("subtitles")
          .select("*")
          .eq("user_id", params.userId)
          .order("order_index", { ascending: true });

        if (subtitlesError) throw subtitlesError;

        // Fetch links
        const { data: linksData, error: linksError } = await supabase
          .from("links")
          .select("*")
          .eq("user_id", params.userId)
          .order("order_index", { ascending: true });

        if (linksError) throw linksError;

        setProfile(profileData);
        setSubtitles(subtitlesData);
        setLinks(linksData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.userId]);

  const getLinkIcon = (iconName) => {
    const Icon = socialIcons[iconName.toLowerCase()]?.icon;
    return Icon ? <Icon className="w-5 h-5" /> : null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-gray-50 via-gray-100 to-gray-50">
      {/* Preview Header */}
      <div className="p-4 border-b bg-white">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          <div className="text-sm text-gray-500">Preview Mode</div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-2xl mx-auto p-8">
        <div className="space-y-8">
          {/* Profile Image */}
          <div className="relative w-32 h-32 mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-full"></div>
            <div className="absolute inset-[3px] bg-white rounded-full overflow-hidden">
              <img
                src={profile?.avatar_url || "/api/placeholder/128/128"}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Profile Info */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">{profile?.name}</h1>
            <p className="text-gray-600">{profile?.title}</p>

            {/* Location and Availability */}
            <div className="flex justify-center gap-3">
              {profile?.location && (
                <span className="px-4 py-1.5 bg-white shadow-sm rounded-full text-sm text-gray-700">
                  📍 {profile.location}
                </span>
              )}
              {profile?.availability && (
                <span className="px-4 py-1.5 bg-white shadow-sm rounded-full text-sm text-gray-700">
                  💼 Available for work
                </span>
              )}
            </div>
          </div>

          {/* Links by Subtitle */}
          {subtitles.map((subtitle) => (
            <div key={subtitle.id} className="space-y-4">
              <h2 className="text-xl font-semibold text-center">
                {subtitle.text}
              </h2>
              <div className="space-y-3">
                {links
                  .filter((link) => link.subtitle_id === subtitle.id)
                  .map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                            {getLinkIcon(link.icon)}
                          </div>
                          <div>
                            <p className="font-medium">{link.title}</p>
                            {link.username && (
                              <p className="text-sm text-gray-500">
                                {link.username}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="text-gray-400">→</span>
                      </div>
                    </a>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
