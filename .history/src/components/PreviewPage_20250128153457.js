"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
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

export default function PreviewPage({ userId }) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [profile, setProfile] = useState(null);
  const [subtitles, setSubtitles] = useState([]);
  const [links, setLinks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState(PLACEHOLDER_IMAGE);

  // Dynamic styles based on profile customization
  const styles = {
    background: {
      background:
        profile?.background_gradient_start && profile?.background_gradient_end
          ? `linear-gradient(to right, ${profile.background_gradient_start}, ${profile.background_gradient_end})`
          : "linear-gradient(to right, #f9fafb, #f3f4f6)",
    },
    button: {
      backgroundColor: profile?.button_bg_color || "#f3f4f6",
      color: profile?.button_text_color || "#1f2937",
    },
    text: {
      color: profile?.profile_text_color || "#4b5563",
    },
  };

  const getSignedUrl = async (filePath) => {
    try {
      if (!filePath) return null;
      const pathParts = filePath.split("avatars/");
      const relativePath = pathParts[pathParts.length - 1];
      const { data, error } = await supabase.storage
        .from("avatars")
        .createSignedUrl(relativePath, 3600);
      if (error) throw error;
      return data.signedUrl;
    } catch (error) {
      console.error("Error getting signed URL:", error);
      return null;
    }
  };

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      try {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (profileError) throw profileError;

        if (profileData?.avatar_url) {
          const signedUrl = await getSignedUrl(profileData.avatar_url);
          setAvatarUrl(signedUrl || PLACEHOLDER_IMAGE);
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
  }, [userId]);

  const getLinkIcon = (iconName) => {
    const Icon = socialIcons[iconName?.toLowerCase()] || Globe;
    return <Icon className="w-5 h-5" style={styles.text} />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={styles.background}>
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
            <h1 className="text-3xl font-bold" style={styles.text}>
              {profile?.name || "New User"}
            </h1>
            <p style={styles.text}>{profile?.title || "Digital Creator"}</p>

            {/* Location and Availability */}
            <div className="flex justify-center gap-3">
              {profile?.location && (
                <span
                  className="px-4 py-1.5 shadow-sm rounded-full text-sm"
                  style={styles.button}
                >
                  📍 {profile.location}
                </span>
              )}
              {profile?.availability && (
                <span
                  className="px-4 py-1.5 shadow-sm rounded-full text-sm"
                  style={styles.button}
                >
                  💼 Available for work
                </span>
              )}
            </div>
          </div>

          {/* Links by Subtitle */}
          {subtitles.map((subtitle) => (
            <div key={subtitle.id} className="space-y-4">
              <h2
                className="text-xl font-semibold text-center"
                style={styles.text}
              >
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
                      className="block p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                      style={styles.button}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white/50 rounded-lg flex items-center justify-center">
                            {getLinkIcon(link.icon)}
                          </div>
                          <div>
                            <p className="font-medium">{link.title}</p>
                            {link.username && (
                              <p className="text-sm opacity-75">
                                {link.username}
                              </p>
                            )}
                          </div>
                        </div>
                        <span>→</span>
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
