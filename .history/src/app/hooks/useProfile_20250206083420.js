"use client";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "sonner";

const PLACEHOLDER_IMAGE = "/api/placeholder/96/96";

export const useProfile = (input) => {
  const supabase = createClientComponentClient();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [defaultAvatar, setDefaultAvatar] = useState(PLACEHOLDER_IMAGE);
  const [profileData, setProfileData] = useState({
    name: "",
    username: "",
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
    links: [],
    subtitles: [],
  });

  // Fetch default avatar
  useEffect(() => {
    const getDefaultAvatarUrl = async () => {
      try {
        const { data, error } = await supabase.storage
          .from("avatars")
          .createSignedUrl("default-avatar.png", 60 * 60);

        if (error) throw error;
        setDefaultAvatar(data?.signedUrl || PLACEHOLDER_IMAGE);
      } catch (error) {
        console.warn("Failed to get default avatar:", error);
        setDefaultAvatar(PLACEHOLDER_IMAGE);
      }
    };

    getDefaultAvatarUrl();
  }, []);

  // Set up realtime subscription
  useEffect(() => {
    if (!input?.id && typeof input !== "string") return;

    const profileFilter =
      typeof input === "string" ? `username=eq.${input}` : `id=eq.${input.id}`;

    const profileChannel = supabase
      .channel("profile_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
          filter: profileFilter,
        },
        (payload) => {
          if (payload.new) {
            setProfileData((prevData) => ({
              ...prevData,
              ...payload.new,
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profileChannel);
    };
  }, [input]);

  // Fetch profile data
  useEffect(() => {
    if (!input?.id && typeof input !== "string") {
      setIsLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setError(null);
        let query = supabase
          .from("profiles")
          .select("*, links (*), subtitles (*)");

        // Handle different input types (username or user object)
        if (typeof input === "string") {
          query = query.eq("username", input);
        } else if (input?.id) {
          query = query.eq("id", input.id);
        } else {
          throw new Error(
            "Invalid input: must be username string or user object with id"
          );
        }

        const { data: profile, error: fetchError } = await query.single();

        if (fetchError) {
          // Handle case where profile doesn't exist for a new user
          if (fetchError.code === "PGRST116" && input?.id) {
            const defaultProfile = {
              id: input.id,
              name: input?.name || "New User",
              username: null,
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

            setProfileData({
              ...profileData,
              ...newProfile,
              links: [],
              subtitles: [],
              avatar_url: defaultAvatar,
            });
            return;
          }
          throw fetchError;
        }

        if (profile) {
          setProfileData({
            ...profileData,
            ...profile,
            links: profile.links || [],
            subtitles: profile.subtitles || [],
            avatar_url: profile.avatar_url || defaultAvatar,
          });
        }
      } catch (error) {
        console.error("Profile fetch failed:", error);
        setError(error.message || "Failed to load profile");
        toast.error("Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [input, defaultAvatar]);

  const handleSave = async (updates) => {
    if (!input?.id) {
      const error = new Error("User ID is required");
      setError(error.message);
      return false;
    }

    try {
      setError(null);
      const { error: updateError } = await supabase.from("profiles").upsert({
        ...updates,
        id: input.id,
        updated_at: new Date().toISOString(),
      });

      if (updateError) throw updateError;

      toast.success("Profile saved successfully");
      return true;
    } catch (error) {
      console.error("Profile save failed:", error);
      setError(error.message || "Failed to save profile changes");
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
