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
  const [imageUrl, setImageUrl] = useState("/api/placeholder/128/128");
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [userData, setUserData] = useState({
    name: name || "User",
    title: title || "Digital Creator | App Developer",
    location: location || "",
    availability: availability ?? true,
  });

  const supabase = createClientComponentClient();

  useEffect(() => {
    // Update local state when props change
    setUserData({
      name: name || "User",
      title: title || "Digital Creator | App Developer",
      location: location || "",
      availability: availability ?? true,
    });

    // Handle the avatar URL
    if (avatarUrl) {
      setImageUrl(avatarUrl);

      // If it's a Supabase URL, try to get a signed URL
      if (avatarUrl.includes("storage") || avatarUrl.includes("avatars")) {
        const getSignedUrl = async () => {
          try {
            let relativePath;
            if (avatarUrl.includes("avatars/")) {
              relativePath = avatarUrl.split("avatars/").pop();
            } else {
              relativePath = avatarUrl;
            }

            const { data, error } = await supabase.storage
              .from("avatars")
              .createSignedUrl(relativePath, 3600);

            if (data?.signedUrl && !error) {
              setImageUrl(data.signedUrl);
            }
          } catch (err) {
            console.error("Error getting signed URL:", err);
          }
        };

        getSignedUrl();
      }
    } else {
      setImageUrl("/api/placeholder/128/128");
    }
  }, [name, title, avatarUrl, location, availability]);

  const handleImageError = () => {
    console.log("Image failed to load, using placeholder");
    setImageUrl("/api/placeholder/128/128");
  };

  const handleImageLoad = () => {
    setIsImageLoaded(true);
  };

  return (
    <div className="text-center space-y-4">
      {/* Profile Image with gradient border */}
      <div className="relative w-32 h-32 mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-full"></div>
        <div className="absolute inset-[3px] bg-white rounded-full overflow-hidden">
          <img
            src={imageUrl}
            alt={`${userData.name}'s Profile`}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isImageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
          {!isImageLoaded && (
            <div className="absolute inset-0 bg-gray-100"></div>
          )}
        </div>
      </div>

      {/* Name and Title */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-800">{userData.name}</h1>
        <p className="text-gray-600">{userData.title}</p>
      </div>

      {/* Status Pills */}
      {(userData.location || userData.availability) && (
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
      )}
    </div>
  );
}
