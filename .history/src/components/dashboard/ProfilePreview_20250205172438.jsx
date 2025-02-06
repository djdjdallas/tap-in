import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
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
  Edit2,
  X,
  Check,
  Upload,
  Briefcase,
  Map,
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
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const LinkCard = ({ link, getLinkIcon, profileData }) => (
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

const EmptyLinksState = ({ profileData }) => (
  <div className="text-center py-4">
    <p className={`text-sm ${profileData.profile_text_color}`}>
      No links added yet
    </p>
  </div>
);

export function ProfilePreview({ user }) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [subtitles, setSubtitles] = useState([]);
  const [links, setLinks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(PLACEHOLDER_IMAGE);
  const [profileData, setProfileData] = useState({
    name: "",
    title: "Digital Creator | App Developer",
    location: "Los Angeles, CA",
    availability: true,
    bio: "",
    profile_bg_color: "bg-white",
    button_bg_color: "bg-gray-100",
    button_text_color: "text-gray-800",
    profile_text_color: "text-gray-600",
  });

  const userId = user?.id;

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

  const handleSave = async () => {
    if (!userId) {
      setError("User ID is required");
      return;
    }

    try {
      setError(null);
      const updates = {
        id: userId,
        name: profileData.name,
        title: profileData.title,
        location: profileData.location,
        availability: profileData.availability,
        bio: profileData.bio,
        updated_at: new Date().toISOString(),
      };

      const { error: updateError } = await supabase
        .from("profiles")
        .upsert(updates);

      if (updateError) throw updateError;

      setIsEditing(false);
      toast.success("Profile saved successfully");
    } catch (error) {
      console.error("Profile save failed:", error);
      setError("Failed to save profile changes");
      toast.error("Failed to save profile");
    }
  };

  const handleImageUpload = async (e) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        throw new Error("Please upload an image file");
      }

      if (file.size > MAX_FILE_SIZE) {
        throw new Error("File size must be less than 5MB");
      }

      setIsLoading(true);
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      // Delete old avatar if exists
      if (avatarUrl && !avatarUrl.includes("default-avatar")) {
        try {
          const oldPath = avatarUrl.split("/avatars/")[1];
          if (oldPath) {
            await supabase.storage.from("avatars").remove([oldPath]);
          }
        } catch (error) {
          console.warn("Error deleting old avatar:", error);
        }
      }

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      const newAvatarUrl = urlData?.publicUrl;
      setAvatarUrl(newAvatarUrl);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: newAvatarUrl })
        .eq("id", userId);

      if (updateError) throw updateError;

      toast.success("Profile image updated successfully");
    } catch (error) {
      console.error("Image upload failed:", error);
      toast.error(error.message || "Failed to upload image");
    } finally {
      setIsLoading(false);
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

        if (profileError && profileError.code !== "PGRST116")
          throw profileError;

        if (profileData) {
          if (profileData.avatar_url) {
            const signedUrl = await getSignedUrl(profileData.avatar_url);
            setAvatarUrl(signedUrl || PLACEHOLDER_IMAGE);
          }
          setProfileData({
            name: profileData.name || user?.name || "New User",
            title: profileData.title || "Digital Creator",
            location: profileData.location || "Los Angeles, CA",
            availability: profileData.availability ?? true,
            bio: profileData.bio || "",
            profile_bg_color: profileData.profile_bg_color || "bg-white",
            button_bg_color: profileData.button_bg_color || "bg-gray-100",
            button_text_color: profileData.button_text_color || "text-gray-800",
            profile_text_color:
              profileData.profile_text_color || "text-gray-600",
          });
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
        toast.error("Failed to load profile data");
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
    <div className="min-h-screen bg-white">
      <div className="p-4 border-b bg-white">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">Preview Mode</div>
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  variant="default"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Save
                </Button>
                <Button
                  onClick={() => {
                    setIsEditing(false);
                    setError(null);
                  }}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-8">
        <div
          className={`space-y-8 ${profileData.profile_bg_color} border rounded-2xl shadow-sm p-8`}
        >
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
          )}

          {/* Profile Image */}
          <div className="relative w-32 h-32 mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-full" />
            <div className="absolute inset-[3px] bg-white rounded-full overflow-hidden group">
              <img
                src={avatarUrl}
                alt={`${profileData.name}'s profile`}
                className="w-full h-full object-cover"
                onError={() => setAvatarUrl(PLACEHOLDER_IMAGE)}
              />
              {isEditing && (
                <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                  <Upload className="w-6 h-6 text-white" />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isLoading}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Profile Info */}
          <div className="text-center space-y-4">
            {isEditing ? (
              <input
                type="text"
                value={profileData.name}
                onChange={(e) =>
                  setProfileData({ ...profileData, name: e.target.value })
                }
                className={`text-3xl font-bold text-center bg-gray-50 border rounded px-2 py-1 w-full ${profileData.profile_text_color}`}
                placeholder="Your name"
              />
            ) : (
              <h1
                className={`text-3xl font-bold ${profileData.profile_text_color}`}
              >
                {profileData.name}
              </h1>
            )}

            {isEditing ? (
              <input
                type="text"
                value={profileData.title}
                onChange={(e) =>
                  setProfileData({ ...profileData, title: e.target.value })
                }
                className={`text-center bg-gray-50 border rounded px-2 py-1 w-full ${profileData.profile_text_color}`}
                placeholder="Your title"
              />
            ) : (
              <p className={profileData.profile_text_color}>
                {profileData.title}
              </p>
            )}

            {/* Location and Availability */}
            <div className="flex justify-center gap-3">
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <Map className="w-4 h-4" />
                    <input
                      type="text"
                      value={profileData.location}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          location: e.target.value,
                        })
                      }
                      className={`bg-gray-50 border rounded px-2 py-1 ${profileData.button_bg_color} ${profileData.button_text_color}`}
                      placeholder="Your location"
                    />
                  </div>
                ) : (
                  profileData.location && (
                    <span
                      className={`px-4 py-1.5 ${profileData.button_bg_color} shadow-sm rounded-full text-sm ${profileData.button_text_color}`}
                    >
                      📍 {profileData.location}
                    </span>
                  )
                )}
              </div>
              {isEditing ? (
                <label
                  className={`flex items-center gap-2 cursor-pointer ${profileData.button_bg_color} px-4 py-1.5 rounded-full`}
                >
                  <input
                    type="checkbox"
                    checked={profileData.availability}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        availability: e.target.checked,
                      })
                    }
                    className="form-checkbox h-4 w-4"
                  />
                  <span className={profileData.button_text_color}>
                    Available for work
                  </span>
                </label>
              ) : (
                profileData.availability && (
                  <span
                    className={`px-4 py-1.5 ${profileData.button_bg_color} shadow-sm rounded-full text-sm ${profileData.button_text_color}`}
                  >
                    💼 Available for work
                  </span>
                )
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
