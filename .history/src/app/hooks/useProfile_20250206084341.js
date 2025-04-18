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
    profile_bg_color: "bg-white",
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
        const { data } = supabase.storage
          .from("avatars")
          .getPublicUrl("default-avatar.png");

        if (data?.publicUrl) {
          setDefaultAvatar(data.publicUrl);
        }
      } catch (error) {
        console.warn("Failed to get default avatar:", error);
      }
    };

    getDefaultAvatarUrl();
  }, []);

  // Set up realtime subscription
  useEffect(() => {
    if (!input?.id && typeof input !== "string") return;

    console.log("Setting up subscriptions for:", input);

    const profileFilter =
      typeof input === "string" ? `username=eq.${input}` : `id=eq.${input.id}`;

    const userId = typeof input === "string" ? null : input?.id;

    // Profile changes
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
          console.log("Profile update received:", payload);
          if (payload.new) {
            setProfileData((prev) => ({
              ...prev,
              ...payload.new,
            }));
          }
        }
      )
      .subscribe();

    // Links changes
    const linksChannel = userId
      ? supabase
          .channel("links_changes")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "links",
              filter: `user_id=eq.${userId}`,
            },
            () => {
              // Refetch links on any change
              fetchLinks(userId);
            }
          )
          .subscribe()
      : null;

    // Subtitles changes
    const subtitlesChannel = userId
      ? supabase
          .channel("subtitles_changes")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "subtitles",
              filter: `user_id=eq.${userId}`,
            },
            () => {
              // Refetch subtitles on any change
              fetchSubtitles(userId);
            }
          )
          .subscribe()
      : null;

    return () => {
      supabase.removeChannel(profileChannel);
      if (linksChannel) supabase.removeChannel(linksChannel);
      if (subtitlesChannel) supabase.removeChannel(subtitlesChannel);
    };
  }, [input]);

  const fetchLinks = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("links")
        .select("*")
        .eq("user_id", userId)
        .order("order_index");

      if (error) throw error;

      setProfileData((prev) => ({
        ...prev,
        links: data || [],
      }));
    } catch (error) {
      console.error("Error fetching links:", error);
    }
  };

  const fetchSubtitles = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("subtitles")
        .select("*")
        .eq("user_id", userId)
        .order("order_index");

      if (error) throw error;

      setProfileData((prev) => ({
        ...prev,
        subtitles: data || [],
      }));
    } catch (error) {
      console.error("Error fetching subtitles:", error);
    }
  };

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!input?.id && typeof input !== "string") {
          setIsLoading(false);
          return;
        }

        setError(null);

        // Fetch profile
        const query = supabase.from("profiles").select("*");

        if (typeof input === "string") {
          query.eq("username", input);
        } else if (input?.id) {
          query.eq("id", input.id);
        }

        const { data: profile, error: fetchError } = await query.single();

        if (fetchError) {
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
              profile_bg_color: "bg-white",
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
          setProfileData((prev) => ({
            ...prev,
            ...profile,
            avatar_url: profile.avatar_url || defaultAvatar,
          }));

          // Fetch related data if we have a user ID
          if (profile.id) {
            await Promise.all([
              fetchLinks(profile.id),
              fetchSubtitles(profile.id),
            ]);
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
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
      setError("User ID is required");
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
