"use client";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "sonner";

const PLACEHOLDER_IMAGE = "/api/placeholder/96/96";

export const useProfile = (user) => {
  const supabase = createClientComponentClient();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [defaultAvatar, setDefaultAvatar] = useState(PLACEHOLDER_IMAGE);
  const [profileData, setProfileData] = useState({
    name: "",
    title: "Digital Creator | App Developer",
    location: "Los Angeles, CA",
    availability: true,
    bio: "",
    avatar_url: "",
    background_gradient_start: "from-gray-50",
    background_gradient_end: "to-gray-50",
    button_bg_color: "bg-gray-100",
    button_text_color: "text-gray-800",
    profile_text_color: "text-gray-600",
  });

  useEffect(() => {
    const getDefaultAvatarUrl = async () => {
      try {
        const { data, error } = await supabase.storage
          .from("avatars")
          .createSignedUrl("default-avatar.png", 60 * 60);

        if (error) {
          console.error("Error getting signed URL:", error);
          setDefaultAvatar(PLACEHOLDER_IMAGE);
          return;
        }

        setDefaultAvatar(data?.signedUrl || PLACEHOLDER_IMAGE);
      } catch (error) {
        console.error("Error in getDefaultAvatarUrl:", error);
        setDefaultAvatar(PLACEHOLDER_IMAGE);
      }
    };

    getDefaultAvatarUrl();
  }, []);

  // Subscribe to profile changes
  useEffect(() => {
    if (!user?.id) return;

    const profileChannel = supabase
      .channel("profile_preview_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new) {
            setProfileData((prevData) => ({
              ...prevData,
              ...payload.new,
              background_gradient_start:
                payload.new.background_gradient_start ||
                prevData.background_gradient_start,
              background_gradient_end:
                payload.new.background_gradient_end ||
                prevData.background_gradient_end,
              button_bg_color:
                payload.new.button_bg_color || prevData.button_bg_color,
              button_text_color:
                payload.new.button_text_color || prevData.button_text_color,
              profile_text_color:
                payload.new.profile_text_color || prevData.profile_text_color,
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profileChannel);
    };
  }, [user?.id]);

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
        const defaultProfile = {
          id: user.id,
          name: user?.name || "New User",
          title: "Digital Creator | App Developer",
          location: "Los Angeles, CA",
          availability: true,
          bio: "",
          avatar_url: defaultAvatar,
          background_gradient_start: "from-gray-50",
          background_gradient_end: "to-gray-50",
          button_bg_color: "bg-gray-100",
          button_text_color: "text-gray-800",
          profile_text_color: "text-gray-600",
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
          ...profile,
          name: profile.name || user?.name || "New User",
          title: profile.title || "Digital Creator | App Developer",
          location: profile.location || "Los Angeles, CA",
          availability: profile.availability ?? true,
          bio: profile.bio || "",
          avatar_url: profile.avatar_url || defaultAvatar,
          background_gradient_start:
            profile.background_gradient_start || "from-gray-50",
          background_gradient_end:
            profile.background_gradient_end || "to-gray-50",
          button_bg_color: profile.button_bg_color || "bg-gray-100",
          button_text_color: profile.button_text_color || "text-gray-800",
          profile_text_color: profile.profile_text_color || "text-gray-600",
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

  const handleSave = async (updates) => {
    if (!user?.id) {
      setError("User ID is required");
      return;
    }

    try {
      setError(null);
      const { error: updateError } = await supabase.from("profiles").upsert({
        ...updates,
        id: user.id,
        updated_at: new Date().toISOString(),
      });

      if (updateError) throw updateError;
      toast.success("Profile saved successfully");
      return true;
    } catch (error) {
      console.error("Profile save failed:", error);
      setError("Failed to save profile changes. Please try again.");
      toast.error("Failed to save profile");
      return false;
    }
  };

  return {
    profileData,
    setProfileData,
    isLoading,
    error,
    setError,
    defaultAvatar,
    handleSave,
    supabase,
  };
};

export default useProfile;
