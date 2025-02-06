"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import {
  Globe,
  Twitter,
  Github,
  Linkedin,
  Instagram,
  Youtube,
  Mail,
  Link as LinkIcon,
  Facebook,
} from "lucide-react";

const socialIcons = {
  website: Globe,
  twitter: Twitter,
  github: Github,
  linkedin: Linkedin,
  instagram: Instagram,
  youtube: Youtube,
  facebook: Facebook,
  email: Mail,
  link: LinkIcon,
};

const PLACEHOLDER_IMAGE = "/api/placeholder/128/128";

export default function PreviewPage({ params }) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [profile, setProfile] = useState(null);
  const [subtitles, setSubtitles] = useState([]);
  const [links, setLinks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState(PLACEHOLDER_IMAGE);
  const [userId, setUserId] = useState(null);

  // Get custom appearance settings with fallbacks
  const backgroundStart = profile?.background_gradient_start || "from-gray-50";
  const backgroundEnd = profile?.background_gradient_end || "to-gray-50";
  const buttonBgColor = profile?.button_bg_color || "bg-gray-100";
  const buttonTextColor = profile?.button_text_color || "text-gray-800";
  const textColor = profile?.profile_text_color || "text-gray-600";

  // Helper function to get signed URL
  const getSignedUrl = async (filePath) => {
    try {
      if (!filePath) return null;

      // Extract the file path after 'avatars/'
      const pathParts = filePath.split("avatars/");
      const relativePath = pathParts[pathParts.length - 1];

      const { data, error } = await supabase.storage
        .from("avatars")
        .createSignedUrl(relativePath, 3600); // 1 hour expiry

      if (error) {
        console.error("Error getting signed URL:", error);
        return null;
      }

      return data.signedUrl;
    } catch (error) {
      console.error("Error in getSignedUrl:", error);
      return null;
    }
  };

  useEffect(() => {
    if (params) {
      setUserId(params.userId);
    }
  }, [params]);

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (profileError) throw profileError;

        // Get signed URL for avatar if it exists
        if (profileData?.avatar_url) {
          const signedUrl = await getSignedUrl(profileData.avatar_url);
          if (signedUrl) {
            setAvatarUrl(signedUrl);
          } else {
            setAvatarUrl(PLACEHOLDER_IMAGE);
          }
        }

        // Fetch subtitles
        const { data: subtitlesData, error: subtitlesError } = await supabase
          .from("subtitles")
          .select("*")
          .eq("user_id", userId)
          .order("order_index", { ascending: true });

        if (subtitlesError) throw subtitlesError;

        // Fetch links
        const { data: linksData, error: linksError } = await supabase
          .from("links")
          .select("*")
          .eq("user_id", userId)
          .order("order_index", { ascending: true });

        if (linksError) throw linksError;

        setProfile(profileData);
        setSubtitles(subtitlesData || []);
        setLinks(linksData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const getLinkIcon = (iconName) => {
    const Icon = socialIcons[iconName?.toLowerCase()] || socialIcons.link;
    return Icon ? <Icon className={`w-5 h-5 ${textColor}`} /> : null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-tr ${backgroundStart} ${backgroundEnd}`}
    >
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
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-full" />
            <div className="absolute inset-[3px] bg-white rounded-full overflow-hidden">
              <img
                src={avatarUrl}
                alt={`${profile?.name || "User"}'s profile`}
                className="w-full h-full object-cover"
                onError={() => setAvatarUrl(PLACEHOLDER_IMAGE)}
              />
            </div>
          </div>

          {/* Profile Info */}
          <div className="text-center space-y-4">
            <h1 className={`text-3xl font-bold ${textColor}`}>
              {profile?.name || "New User"}
            </h1>
            <p className={textColor}>{profile?.title || "Digital Creator"}</p>

            {/* Location and Availability */}
            <div className="flex justify-center gap-3">
              {profile?.location && (
                <span
                  className={`px-4 py-1.5 ${buttonBgColor} shadow-sm rounded-full text-sm ${buttonTextColor}`}
                >
                  📍 {profile.location}
                </span>
              )}
              {profile?.availability && (
                <span
                  className={`px-4 py-1.5 ${buttonBgColor} shadow-sm rounded-full text-sm ${buttonTextColor}`}
                >
                  💼 Available for work
                </span>
              )}
            </div>
          </div>

          {/* Links by Subtitle */}
          {subtitles.map((subtitle) => (
            <div key={subtitle.id} className="space-y-4">
              <h2 className={`text-xl font-semibold text-center ${textColor}`}>
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
                      className={`block p-4 ${buttonBgColor} rounded-lg shadow-sm hover:shadow-md transition-shadow`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white/50 rounded-lg flex items-center justify-center">
                            {getLinkIcon(link.icon)}
                          </div>
                          <div>
                            <p className={`font-medium ${buttonTextColor}`}>
                              {link.title}
                            </p>
                            {link.username && (
                              <p
                                className={`text-sm opacity-75 ${buttonTextColor}`}
                              >
                                {link.username}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className={`${buttonTextColor}`}>→</span>
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
