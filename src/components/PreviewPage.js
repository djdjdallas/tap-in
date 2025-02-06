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

// Color mappings between short codes and Tailwind classes
const colorMappings = {
  backgrounds: {
    wht: "bg-white",
    gry50: "bg-gray-50",
    gry100: "bg-gray-100",
    blu50: "bg-blue-50",
    grn50: "bg-green-50",
    pnk50: "bg-pink-50",
  },
  text: {
    gry900: "text-gray-900",
    gry600: "text-gray-600",
    blu600: "text-blue-600",
    grn600: "text-green-600",
    prp600: "text-purple-600",
  },
  buttons: {
    gry100: "bg-gray-100",
    blu100: "bg-blue-100",
    grn100: "bg-green-100",
    pnk100: "bg-pink-100",
    prp100: "bg-purple-100",
  },
};

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

const convertShortCodeToTailwind = (shortCode, type) => {
  if (!shortCode) return null;
  const mapping = {
    profile_bg_color: colorMappings.backgrounds,
    profile_text_color: colorMappings.text,
    button_bg_color: colorMappings.buttons,
    button_text_color: colorMappings.text,
  };
  return mapping[type]?.[shortCode] || colorMappings.backgrounds.wht;
};

const LinkCard = ({ link, getLinkIcon, profileData }) => {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`block p-3 ${profileData.button_bg_color} rounded-lg transition-shadow hover:shadow-md relative`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/50 rounded-lg flex items-center justify-center">
            {getLinkIcon(link.icon)}
          </div>
          <div className="flex flex-col">
            <span className={`font-medium ${profileData.button_text_color}`}>
              {link.title}
            </span>
            {link.username && (
              <span
                className={`text-sm opacity-75 ${profileData.button_text_color}`}
              >
                {link.username}
              </span>
            )}
          </div>
        </div>
        <span className={`${profileData.button_text_color}`}>→</span>
      </div>
    </a>
  );
};

export default function PreviewPage({ userId }) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [profile, setProfile] = useState(null);
  const [subtitles, setSubtitles] = useState([]);
  const [links, setLinks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState(PLACEHOLDER_IMAGE);
  const [backgroundImageUrl, setBackgroundImageUrl] = useState(null);

  // Get custom appearance settings with fallbacks
  const profileData = {
    profile_bg_color:
      convertShortCodeToTailwind(
        profile?.profile_bg_color,
        "profile_bg_color"
      ) || "bg-white",
    button_bg_color:
      convertShortCodeToTailwind(profile?.button_bg_color, "button_bg_color") ||
      "bg-gray-100",
    button_text_color:
      convertShortCodeToTailwind(
        profile?.button_text_color,
        "button_text_color"
      ) || "text-gray-900",
    profile_text_color:
      convertShortCodeToTailwind(
        profile?.profile_text_color,
        "profile_text_color"
      ) || "text-gray-600",
  };

  const getSignedUrl = async (bucket, filePath) => {
    try {
      if (!filePath) return null;
      const pathParts = filePath.split(`${bucket}/`);
      const relativePath = pathParts[pathParts.length - 1];
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(relativePath, 3600);
      if (error) throw error;
      return data.signedUrl;
    } catch (error) {
      console.error(`Error getting signed URL from ${bucket}:`, error);
      return null;
    }
  };

  const getLinkIcon = (iconName) => {
    const Icon = socialIcons[iconName?.toLowerCase()] || socialIcons.link;
    return Icon ? (
      <Icon className={`w-5 h-5 ${profileData.profile_text_color}`} />
    ) : null;
  };

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel("profile_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${userId}`,
        },
        async (payload) => {
          console.log("Profile updated:", payload);
          if (payload.new) {
            setProfile(payload.new);
            // Update background image URL if it changes
            if (payload.new.background_image) {
              const signedUrl = await getSignedUrl(
                "backgrounds",
                payload.new.background_image
              );
              setBackgroundImageUrl(signedUrl);
            } else {
              setBackgroundImageUrl(null);
            }
          }
        }
      )
      .subscribe();

    const fetchData = async () => {
      try {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (profileError) throw profileError;

        // Handle avatar URL
        if (profileData?.avatar_url) {
          const signedUrl = await getSignedUrl(
            "avatars",
            profileData.avatar_url
          );
          setAvatarUrl(signedUrl || PLACEHOLDER_IMAGE);
        }

        // Handle background image URL
        if (profileData?.background_image) {
          const signedUrl = await getSignedUrl(
            "backgrounds",
            profileData.background_image
          );
          setBackgroundImageUrl(signedUrl);
        }

        const { data: subtitlesData, error: subtitlesError } = await supabase
          .from("subtitles")
          .select("*")
          .eq("user_id", userId)
          .order("order_index", { ascending: true });

        if (subtitlesError) throw subtitlesError;

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

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
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
        <div
          className={`space-y-8 ${
            backgroundImageUrl ? "" : profileData.profile_bg_color
          } border rounded-2xl shadow-sm p-8 relative overflow-hidden`}
          style={{
            backgroundImage: backgroundImageUrl
              ? `url(${backgroundImageUrl})`
              : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Background overlay for better text readability when using image */}
          {backgroundImageUrl && (
            <div className="absolute inset-0 bg-black bg-opacity-40" />
          )}

          {/* Content wrapper to keep everything above the overlay */}
          <div className="relative z-10">
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
              <h1
                className={`text-3xl font-bold ${
                  backgroundImageUrl
                    ? "text-white"
                    : profileData.profile_text_color
                }`}
              >
                {profile?.name || "New User"}
              </h1>
              <p
                className={
                  backgroundImageUrl
                    ? "text-white"
                    : profileData.profile_text_color
                }
              >
                {profile?.title || "Digital Creator"}
              </p>

              {/* Location and Availability */}
              <div className="flex justify-center gap-3">
                {profile?.location && (
                  <span
                    className={`px-4 py-1.5 ${profileData.button_bg_color} shadow-sm rounded-full text-sm ${profileData.button_text_color}`}
                  >
                    📍 {profile.location}
                  </span>
                )}
                {profile?.availability && (
                  <span
                    className={`px-4 py-1.5 ${profileData.button_bg_color} shadow-sm rounded-full text-sm ${profileData.button_text_color}`}
                  >
                    💼 Available for work
                  </span>
                )}
              </div>
            </div>

            {/* Links Section */}
            <div className="space-y-6">
              {subtitles?.map((subtitle) => (
                <div key={subtitle.id} className="space-y-4">
                  <h3
                    className={`text-lg font-medium text-center ${
                      backgroundImageUrl
                        ? "text-white"
                        : profileData.profile_text_color
                    }`}
                  >
                    {subtitle.text}
                  </h3>
                  <div className="space-y-3">
                    {links
                      ?.filter((link) => link.subtitle_id === subtitle.id)
                      .map((link) => (
                        <LinkCard
                          key={link.id}
                          link={link}
                          getLinkIcon={getLinkIcon}
                          profileData={profileData}
                        />
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
