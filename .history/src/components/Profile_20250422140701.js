// src/components/Profile.js - UPDATED
"use client";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function Profile({
  name,
  title,
  avatarUrl,
  location,
  availability,
  userId = null,
  isEditable = false,
}) {
  const [imageUrl, setImageUrl] = useState(
    avatarUrl || "/api/placeholder/128/128"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState({
    name: name || "User",
    title: title || "Digital Creator | App Developer",
    location: location || "",
    availability: availability ?? true,
  });

  const supabase = createClientComponentClient();

  // Function to get signed URLs for images
  const getSignedUrl = async (filePath) => {
    try {
      if (!filePath) return null;

      // Handle both full URLs and relative paths
      let relativePath;
      if (filePath.includes("avatars/")) {
        relativePath = filePath.split("avatars/").pop();
      } else {
        relativePath = filePath;
      }

      // Get signed URL
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
    // Handle avatar URL
    const handleAvatar = async () => {
      if (!avatarUrl) {
        setImageUrl("/api/placeholder/128/128");
        return;
      }

      try {
        // First try to use the avatar URL directly
        setImageUrl(avatarUrl);

        // Then try to get a signed URL if it seems to be from Supabase storage
        if (avatarUrl.includes("storage") || avatarUrl.includes("avatars")) {
          const signedUrl = await getSignedUrl(avatarUrl);
          if (signedUrl) {
            setImageUrl(signedUrl);
          }
        }
      } catch (error) {
        console.error("Error handling avatar:", error);
        setImageUrl("/api/placeholder/128/128");
      }
    };

    handleAvatar();
  }, [avatarUrl]);

  const handleImageError = () => {
    console.log("Image load error, falling back to placeholder");
    setImageUrl("/api/placeholder/128/128");
  };

  return (
    <div className="text-center space-y-4">
      {/* Profile Image with gradient border and optional upload functionality */}
      <div className="relative w-32 h-32 mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-full"></div>
        <div className="absolute inset-[3px] bg-white rounded-full overflow-hidden">
          <img
            src={imageUrl}
            alt={`${userData.name}'s Profile`}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        </div>
      </div>

      {/* Name and Title */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-800">{userData.name}</h1>
        <p className="text-gray-600">{userData.title}</p>
      </div>

      {/* Status Pills */}
      <div className="flex items-center justify-center gap-3 flex-wrap">
        {userData.location && (
          <span className="px-4 py-1.5 bg-white shadow-sm rounded-full text-sm text-gray-700 flex items-center gap-2">
            <span className="text-red-500">📍</span> {userData.location}
          </span>
        )}
        {userData.availability && (
          <span className="px-4 py-1.5 bg-white shadow-sm rounded-full text-sm text-gray-700 flex items-center gap-2">
            <span>💼</span> Available for work
          </span>
        )}
      </div>
    </div>
  );
}
