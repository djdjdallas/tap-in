"use client";
import { useState, useEffect } from "react";

export default function Profile({
  name,
  title,
  avatarUrl,
  location,
  availability,
}) {
  const [imageUrl, setImageUrl] = useState("/api/placeholder/128/128");

  useEffect(() => {
    if (avatarUrl) {
      setImageUrl(avatarUrl);
    }
  }, [avatarUrl]);

  const handleImageError = () => {
    setImageUrl("/api/placeholder/128/128");
  };

  return (
    <div className="text-center space-y-4">
      {/* Profile Image with gradient border */}
      <div className="relative w-32 h-32 mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-full animate-spin-slow"></div>
        <div className="absolute inset-[3px] bg-white rounded-full overflow-hidden">
          <img
            src={imageUrl}
            alt={`${name || "User"}'s Profile`}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        </div>
      </div>

      {/* Name and Title */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-800">{name || "User"}</h1>
        <p className="text-gray-600">{title || "Digital Creator"}</p>
      </div>

      {/* Status Pills */}
      <div className="flex items-center justify-center gap-3 flex-wrap">
        {location && (
          <span className="px-4 py-1.5 bg-white shadow-sm rounded-full text-sm text-gray-700 flex items-center gap-2">
            <span className="text-red-500">📍</span> {location}
          </span>
        )}
        {availability && (
          <span className="px-4 py-1.5 bg-white shadow-sm rounded-full text-sm text-gray-700 flex items-center gap-2">
            <span>💼</span> Available for work
          </span>
        )}
      </div>
    </div>
  );
}
