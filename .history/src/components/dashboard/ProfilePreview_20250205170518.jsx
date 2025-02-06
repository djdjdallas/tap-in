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

const LinkCard = ({ link, getLinkIcon, profileData }) => {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`block p-3 ${profileData.button_bg_color} rounded-lg transition-shadow hover:shadow-md`}
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

const EmptyLinksState = ({ profileData }) => {
  return (
    <div className="text-center py-4">
      <p className={`text-sm ${profileData.profile_text_color}`}>
        No links added yet
      </p>
    </div>
  );
};

export function ProfilePreview({ user }) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [profile, setProfile] = useState(null);
  const [subtitles, setSubtitles] = useState([]);
  const [links, setLinks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState(PLACEHOLDER_IMAGE);

  const userId = user?.id;

  // Get custom appearance settings with fallbacks
  const profileData = {
    profile_bg_color: profile?.profile_bg_color || "bg-white",
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
      if (error) throw error;
      return data.signedUrl;
    } catch (error) {
      console.error("Error getting signed URL:", error);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-gray-50 to-gray-100">
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
          className={`space-y-8 ${profileData.profile_bg_color} border rounded-2xl shadow-sm p-8`}
        >
          {/* Profile Image */}
          <div className="relative w-32 h-32 mx-auto ">
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
              className={`text-3xl font-bold ${profileData.profile_text_color}`}
            >
              {profile?.name || "New User"}
            </h1>
            <p className={profileData.profile_text_color}>
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
                  className={`text-lg font-medium text-center ${profileData.profile_text_color}`}
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
            {(!subtitles?.length || !links?.length) && (
              <EmptyLinksState profileData={profileData} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePreview;
