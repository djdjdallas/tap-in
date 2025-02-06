"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Upload } from "lucide-react";
import { toast } from "sonner";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const AvatarUpload = ({
  user,
  onAvatarChange,
  className = "",
  size = "medium", // small, medium, large
}) => {
  const supabase = createClientComponentClient();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [defaultAvatar, setDefaultAvatar] = useState("");

  // Size mappings
  const sizeClasses = {
    small: "w-16 h-16",
    medium: "w-24 h-24",
    large: "w-32 h-32",
  };

  useEffect(() => {
    const getDefaultAvatar = async () => {
      const { data } = supabase.storage
        .from("avatars")
        .getPublicUrl("default-avatar.png");
      console.log("Default avatar URL:", data?.publicUrl);
      setDefaultAvatar(data?.publicUrl);
    };

    getDefaultAvatar();
  }, []);

  const handleImageUpload = async (event) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file
      if (!file.type.startsWith("image/")) {
        throw new Error("Please upload an image file");
      }

      if (file.size > MAX_FILE_SIZE) {
        throw new Error("File size must be less than 5MB");
      }

      setIsLoading(true);

      // Create unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Delete old avatar if exists
      if (avatarUrl && avatarUrl !== defaultAvatar) {
        try {
          const oldPath = new URL(avatarUrl).pathname.split("/").pop();
          if (oldPath) {
            await supabase.storage
              .from("avatars")
              .remove([`${user.id}/${oldPath}`]);
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

      // Get URL
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      if (!urlData?.publicUrl) {
        throw new Error("Failed to get public URL");
      }

      const publicUrlWithCache = `${urlData.publicUrl}?v=${Date.now()}`;
      setAvatarUrl(publicUrlWithCache);
      onAvatarChange?.(publicUrlWithCache);

      toast.success("Profile image updated successfully");
    } catch (error) {
      console.error("Image upload failed:", error);
      toast.error(error.message || "Failed to upload image");
    } finally {
      setIsLoading(false);
    }
  };

  const currentAvatarUrl = avatarUrl || defaultAvatar;

  return (
    <div className={`relative ${sizeClasses[size]} mx-auto group ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-full" />
      <div className="absolute inset-[2px] bg-white rounded-full p-1">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900" />
          </div>
        ) : (
          <img
            src={currentAvatarUrl}
            alt="Profile avatar"
            className="w-full h-full object-cover rounded-full"
            onError={(e) => {
              console.error("Image load error for URL:", e.target.src);
              if (e.target.src !== defaultAvatar) {
                e.target.src = defaultAvatar;
                setAvatarUrl(defaultAvatar);
                onAvatarChange?.(defaultAvatar);
              }
            }}
          />
        )}
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
      </div>
    </div>
  );
};
