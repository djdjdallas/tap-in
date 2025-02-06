import React, { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient"; // Adjust the path as needed

const ProfilePreview = ({ profileData, setProfileData }) => {
  const [defaultAvatar, setDefaultAvatar] = useState("/fallback-avatar.png"); // Local fallback URL

  useEffect(() => {
    const fetchDefaultAvatar = async () => {
      try {
        const { data, error } = supabase.storage
          .from("avatars")
          .getPublicUrl("default-avatar.png");

        if (error) {
          console.error("Error fetching default avatar URL:", error);
          return;
        }

        // Set default avatar if the URL is valid
        if (data?.publicUrl) {
          setDefaultAvatar(data.publicUrl);
        }
      } catch (error) {
        console.error("Unexpected error fetching default avatar:", error);
      }
    };

    fetchDefaultAvatar();
  }, []);

  const handleImageError = (e) => {
    console.error("Image load error for URL:", e.target.src);
    e.target.src = defaultAvatar; // Use the default avatar on error
    setProfileData((prev) => ({
      ...prev,
      avatar_url: defaultAvatar,
    }));
  };

  return (
    <div className="profile-preview">
      <div className="avatar-container">
        <img
          key={profileData.avatar_url}
          src={profileData.avatar_url || defaultAvatar}
          alt={`${profileData.name || "User"}'s profile`}
          className="w-full h-full object-cover rounded-full"
          onError={handleImageError}
        />
      </div>

      <div className="profile-info">
        <h2 className="text-lg font-bold">
          {profileData.name || "Unnamed User"}
        </h2>
        <p className="text-gray-600">
          {profileData.email || "No email provided"}
        </p>
      </div>
    </div>
  );
};

export default ProfilePreview;
