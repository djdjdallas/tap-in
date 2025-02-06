"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

// Import our components and icon config
import { ProfileImage } from "@/components/dashboard/profile/ProfileImage";
import { ProfileInfo } from "@/components/dashboard/profile/ProfileInfo";
import { ProfileLinks } from "@/components/dashboard/profile/ProfileLinks";
import { socialIcons } from "@/utils/socialIcons"; // You might want to move the socialIcons to a separate utils file

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
  const profileData = {
    ...profile,
    avatar_url: avatarUrl,
    background_gradient_start:
      profile?.background_gradient_start || "from-gray-50",
    background_gradient_end: profile?.background_gradient_end || "to-gray-50",
    button_bg_color: profile?.button_bg_color || "bg-gray-100",
    button_text_color: profile?.button_text_color || "text-gray-800",
    profile_text_color: profile?.profile_text_color || "text-gray-600",
  };

  // Helper function to get signed URL
  const getSignedUrl = async (filePath) => {
    try {
      if (!filePath) return null;
      const pathParts = filePath.split("avatars/");
      const relativePath = pathParts[pathParts.length - 1];
      const { data, error } = await supabase.storage
        .from("avatars")
        .createSignedUrl(relativePath, 3600);

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
    return Icon ? (
      <Icon className={`w-5 h-5 ${profileData.profile_text_color}`} />
    ) : null;
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
      className={`min-h-screen bg-gradient-to-tr ${profileData.background_gradient_start} ${profileData.background_gradient_end}`}
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
        <div className="space-y-8 bg-white border rounded-2xl shadow-sm p-8">
          {/* Using our components but with isEditing=false */}
          <ProfileImage
            userId={userId}
            isEditing={false}
            isLoading={isLoading}
            profileData={profileData}
            defaultAvatar={PLACEHOLDER_IMAGE}
            setProfileData={setProfile}
            setIsLoading={setIsLoading}
          />

          <ProfileInfo
            isEditing={false}
            profileData={profileData}
            setProfileData={setProfile}
          />

          <ProfileLinks
            subtitles={subtitles}
            links={links}
            getLinkIcon={getLinkIcon}
            profileData={profileData}
          />
        </div>
      </div>
    </div>
  );
}
