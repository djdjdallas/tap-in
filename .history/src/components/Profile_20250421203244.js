"use client";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "sonner";

export default function Profile() {
  const [avatarUrl, setAvatarUrl] = useState("/api/placeholder/128/128");
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({
    name: "Dominick",
    title: "Digital Creator | App Developer",
    location: "Bangkok, TH",
    availability: true,
  });

  const supabase = createClientComponentClient();
  const STORAGE_URL = "https://fgcfzzrmfavqcwslqilf.supabase.co/storage/v1/s3";

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("name, avatar_url, title, location, availability")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        setUserData({
          name: data.name || "Dominick",
          title: data.title || "Digital Creator | App Developer",
          location: data.location || "Bangkok, TH",
          availability: data.availability ?? true,
        });

        if (data.avatar_url) {
          setAvatarUrl(data.avatar_url);
        }
      }
    } catch (error) {
      toast.error("Error fetching profile");
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleImageUpload(event) {
    try {
      setLoading(true);
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type and size
      if (!file.type.startsWith("image/")) {
        throw new Error("Please upload an image file");
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error("File size must be less than 5MB");
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Create unique file path
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Construct the full URL using the storage endpoint
      const fullAvatarUrl = `${STORAGE_URL}/avatars/${fileName}`;

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: fullAvatarUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setAvatarUrl(fullAvatarUrl);
      toast.success("Profile image updated successfully");
    } catch (error) {
      toast.error(error.message || "Error uploading image");
      console.error("Error uploading image:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="text-center space-y-4">
      {/* Profile Image with gradient border and upload functionality */}
      <div className="relative w-32 h-32 mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-full animate-spin-slow"></div>
        <div className="absolute inset-[3px] bg-white rounded-full overflow-hidden">
          <label className="cursor-pointer block relative w-full h-full group">
            <img
              src={avatarUrl}
              alt="Profile"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = "/api/placeholder/128/128";
              }}
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={loading}
              className="hidden"
            />
            {/* Upload overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
              <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity">
                {loading ? "Uploading..." : "Update Photo"}
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* Name and Title */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-800">{userData.name}</h1>
        <p className="text-gray-600">{userData.title}</p>
      </div>

      {/* Status Pills */}
      <div className="flex items-center justify-center gap-3">
        <span className="px-4 py-1.5 bg-white shadow-sm rounded-full text-sm text-gray-700 flex items-center gap-2">
          <span className="text-red-500">📍</span> {userData.location}
        </span>
        {userData.availability && (
          <span className="px-4 py-1.5 bg-white shadow-sm rounded-full text-sm text-gray-700 flex items-center gap-2">
            <span>💼</span> Available for work
          </span>
        )}
      </div>
    </div>
  );
}
