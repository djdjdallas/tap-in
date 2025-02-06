"use client";

import { useState, useEffect } from "react";
import { Briefcase, Map, Edit2, X, Check, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "sonner";

// Updated constants for better image handling
const SUPABASE_URL = "https://fgcfzzrmfavqcwslqilf.supabase.co";
const STORAGE_URL = `${SUPABASE_URL}/storage/v1/object/public`;
const DEFAULT_AVATAR = `${STORAGE_URL}/avatars/default-avatar.png`;
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
        // Create default profile if none exists
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

      // Create unique filename with user ID and timestamp
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Delete old avatar if it exists and isn't the default
      if (
        profileData.avatar_url &&
        !profileData.avatar_url.includes("default-avatar")
      ) {
        try {
          const oldFilePath = profileData.avatar_url
            .split("/avatars/")[1]
            ?.split("?")[0];

          if (oldFilePath) {
            const { error: deleteError } = await supabase.storage
              .from("avatars")
              .remove([oldFilePath]);

            if (deleteError) {
              console.warn("Error deleting old avatar:", deleteError);
            }
          }
        } catch (error) {
          console.warn("Error deleting old avatar:", error);
        }
      }

      // Upload new avatar with content type
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      // Construct the public URL manually
      const publicUrl = `${STORAGE_URL}/avatars/${fileName}`;

      // Add cache-busting parameter
      const publicUrlWithCache = `${publicUrl}?v=${Date.now()}`;

      // Update profile in database
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          avatar_url: publicUrlWithCache,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) throw updateError;

      // Update local state
      setProfileData((prev) => ({
        ...prev,
        avatar_url: publicUrlWithCache,
      }));

      toast.success("Profile image updated successfully");
    } catch (error) {
      console.error("Image upload failed:", error);
      setError(error.message || "Failed to upload image. Please try again.");
      toast.error(error.message || "Failed to upload image");
    } finally {
      setIsLoading(false);
    }
  };

  const renderProfileImage = () => (
    <div className="relative w-24 h-24 mx-auto group">
      <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-full" />
      <div className="absolute inset-[2px] bg-white rounded-full p-1">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900" />
          </div>
        ) : (
          <img
            key={profileData.avatar_url}
            src={profileData.avatar_url}
            alt={`${profileData.name}'s profile`}
            className="w-full h-full object-cover rounded-full"
            onError={(e) => {
              console.error("Image load error for URL:", e.target.src);
              if (!e.target.src.includes("default-avatar")) {
                e.target.src = DEFAULT_AVATAR;
              }
            }}
          />
        )}
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
  );

  if (isLoading && !profileData.avatar_url) {
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
            {renderProfileImage()}

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

            {subtitles?.map((subtitle) => (
              <div key={subtitle.id} className="mt-4">
                <h3 className="text-lg font-medium mb-2">{subtitle.text}</h3>
                <div className="space-y-2">
                  {links
                    ?.filter((link) => link.subtitle_id === subtitle.id)
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
