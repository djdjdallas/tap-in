"use client";

import { Upload } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "sonner";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

export const ProfileImage = ({
  userId,
  isEditing,
  isLoading,
  profileData,
  defaultAvatar,
  setProfileData,
  setIsLoading,
}) => {
  const supabase = createClientComponentClient();

  const handleImageUpload = async (e) => {
    try {
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
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      // Delete old avatar if it exists and isn't the default
      if (
        profileData.avatar_url &&
        !profileData.avatar_url.includes("default-avatar")
      ) {
        try {
          const oldPath = profileData.avatar_url.split("/").pop();
          if (oldPath) {
            await supabase.storage
              .from("avatars")
              .remove([`${userId}/${oldPath}`]);
          }
        } catch (error) {
          console.warn("Error deleting old avatar:", error);
        }
      }

      // Upload new avatar
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      // Get signed URL for the uploaded file
      const { data: urlData } = await supabase.storage
        .from("avatars")
        .createSignedUrl(fileName, 60 * 60);

      if (!urlData?.signedUrl) {
        throw new Error("Failed to get signed URL");
      }

      // Update profile in database
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          avatar_url: urlData.signedUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (updateError) throw updateError;

      // Update local state
      setProfileData((prev) => ({
        ...prev,
        avatar_url: urlData.signedUrl,
      }));

      toast.success("Profile image updated successfully");
    } catch (error) {
      console.error("Image upload failed:", error);
      toast.error(error.message || "Failed to upload image");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageError = async (e) => {
    console.log("Image load failed, attempting to get signed URL");
    try {
      if (profileData.avatar_url) {
        const path = profileData.avatar_url.split("/").pop();
        const { data, error } = await supabase.storage
          .from("avatars")
          .createSignedUrl(`${userId}/${path}`, 60 * 60);

        if (!error && data?.signedUrl) {
          e.target.src = data.signedUrl;
          return;
        }
      }

      e.target.src = defaultAvatar;
      setProfileData((prev) => ({
        ...prev,
        avatar_url: defaultAvatar,
      }));

      await supabase
        .from("profiles")
        .update({ avatar_url: defaultAvatar })
        .eq("id", userId);
    } catch (error) {
      console.error("Error handling image load failure:", error);
      e.target.src = defaultAvatar;
    }
  };

  return (
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
            src={profileData.avatar_url || defaultAvatar}
            alt={`${profileData.name}'s profile`}
            className="w-full h-full object-cover rounded-full"
            onError={handleImageError}
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
};

export default ProfileImage;
