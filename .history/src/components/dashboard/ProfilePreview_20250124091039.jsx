"use client";

import { useState, useEffect } from "react";
import { Briefcase, Map, Edit2, X, Check, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "sonner";

// Define constants for better maintainability
const DEFAULT_AVATAR =
  "https://fgcfzzrmfavqcwslqilf.supabase.co/storage/v1/object/public/avatars/default-avatar.png";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

export const ProfilePreview = ({ user, subtitles, links, getLinkIcon }) => {
  const supabase = createClientComponentClient();
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    name: "",
    title: "Digital Creator | App Developer",
    location: "Los Angeles, CA",
    availability: true,
    bio: "",
    avatar_url: DEFAULT_AVATAR,
  });

  useEffect(() => {
    if (user?.id) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      let { data: profile, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (fetchError && fetchError.code === "PGRST116") {
        // Profile doesn't exist, create a new one
        const defaultProfile = {
          id: user.id,
          name: user?.name || "New User",
          title: "Digital Creator | App Developer",
          location: "Los Angeles, CA",
          availability: true,
          bio: "",
          avatar_url: DEFAULT_AVATAR,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { data: newProfile, error: createError } = await supabase
          .from("profiles")
          .insert([defaultProfile])
          .select()
          .single();

        if (createError) throw createError;
        profile = newProfile;
      } else if (fetchError) {
        throw fetchError;
      }

      if (profile) {
        setProfileData({
          name: profile.name || user?.name || "New User",
          title: profile.title || "Digital Creator | App Developer",
          location: profile.location || "Los Angeles, CA",
          availability: profile.availability ?? true,
          bio: profile.bio || "",
          avatar_url: profile.avatar_url || DEFAULT_AVATAR,
        });
      }
    } catch (error) {
      console.error("Profile fetch failed:", error);
      setError("Failed to load profile. Please refresh the page.");
      toast.error("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id) {
      setError("User ID is required");
      return;
    }

    try {
      setError(null);
      const updates = {
        id: user.id,
        name: profileData.name,
        title: profileData.title,
        location: profileData.location,
        availability: profileData.availability,
        bio: profileData.bio,
        avatar_url: profileData.avatar_url,
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
      setError("Failed to save profile changes. Please try again.");
      toast.error("Failed to save profile");
    }
  };

  const handleImageUpload = async (e) => {
    try {
      setError(null);
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file type and size
      if (!file.type.startsWith("image/")) {
        throw new Error("Please upload an image file");
      }

      if (file.size > MAX_FILE_SIZE) {
        throw new Error("File size must be less than 5MB");
      }

      setIsLoading(true);

      // Create unique filename with user ID prefix
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Delete old avatar if it exists and isn't the default
      if (
        profileData.avatar_url &&
        !profileData.avatar_url.includes("default-avatar")
      ) {
        try {
          const oldPath = profileData.avatar_url.split("/avatars/").pop();
          if (oldPath) {
            await supabase.storage.from("avatars").remove([oldPath]);
          }
        } catch (deleteError) {
          console.warn("Error deleting old avatar:", deleteError);
        }
      }

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get the public URL - this is the key change
      const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);

      // Log the URL to debug
      console.log("Public URL:", data.publicUrl);

      // Update profile in database
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          avatar_url: data.publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) throw updateError;

      // Update local state
      setProfileData((prev) => ({ ...prev, avatar_url: data.publicUrl }));

      // Verify the URL is set correctly
      console.log("Updated profile data:", profileData);

      toast.success("Profile image updated successfully");
    } catch (error) {
      console.error("Image upload failed:", error);
      setError(error.message || "Failed to upload image. Please try again.");
      toast.error(error.message || "Failed to upload image");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Profile Preview</CardTitle>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="p-2 text-green-500 hover:text-green-700 rounded-full hover:bg-green-50"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setError(null);
              }}
              className="p-2 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="scale-90 transform origin-top">
          <div className="text-center space-y-4">
            {/* Profile Image */}
            <div className="relative w-24 h-24 mx-auto group">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-full" />
              <div className="absolute inset-[2px] bg-white rounded-full p-1">
                <img
                  src={profileData.avatar_url}
                  alt={`${profileData.name}'s profile`}
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    console.warn("Image failed to load, using default avatar");
                    e.target.src = DEFAULT_AVATAR;
                  }}
                />
                {isEditing && (
                  <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
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
            <div>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, name: e.target.value })
                  }
                  className="text-xl font-bold text-center bg-gray-50 border rounded px-2 py-1 w-full"
                  placeholder="Your name"
                />
              ) : (
                <h2 className="text-xl font-bold">{profileData.name}</h2>
              )}
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.title}
                  onChange={(e) =>
                    setProfileData({ ...profileData, title: e.target.value })
                  }
                  className="text-sm text-gray-600 text-center bg-gray-50 border rounded px-2 py-1 w-full mt-1"
                  placeholder="Your title"
                />
              ) : (
                <p className="text-sm text-gray-600">{profileData.title}</p>
              )}
            </div>

            {/* Location and Availability */}
            <div className="flex justify-center gap-2 text-sm">
              <span className="flex items-center gap-1">
                <Map className="w-4 h-4" />
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.location}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        location: e.target.value,
                      })
                    }
                    className="bg-gray-50 border rounded px-2 py-1"
                    placeholder="Your location"
                  />
                ) : (
                  profileData.location
                )}
              </span>
              {isEditing ? (
                <label className="flex items-center gap-1 cursor-pointer">
                  <Briefcase className="w-4 h-4" />
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
                  <span>Available for work</span>
                </label>
              ) : (
                profileData.availability && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    Available for work
                  </span>
                )
              )}
            </div>

            {/* Links Sections */}
            {subtitles.map((subtitle) => (
              <div key={subtitle.id} className="mt-4">
                <h3 className="text-lg font-medium mb-2">{subtitle.text}</h3>
                <div className="space-y-2">
                  {links
                    .filter((link) => link.subtitle_id === subtitle.id)
                    .map((link) => (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 justify-center text-gray-600 hover:text-gray-900"
                      >
                        {getLinkIcon(link.icon)}
                        <span>{link.username || link.title}</span>
                      </a>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfilePreview;
