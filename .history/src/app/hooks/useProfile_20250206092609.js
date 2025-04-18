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
    if (!input?.id) return;

    console.log("Setting up profile subscription for:", input);

    const profileChannel = supabase
      .channel("profile_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${input.id}`,
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
      .subscribe((status) => {
        console.log("Profile subscription status:", status);
      });

    return () => {
      console.log("Cleaning up profile subscription");
      supabase.removeChannel(profileChannel);
    };
  }, [input]);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!input?.id) {
          setIsLoading(false);
          return;
        }

        console.log("Fetching profile for:", input);
        setError(null);

        // Fetch profile
        const { data: profile, error: fetchError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", input.id)
          .single();

        console.log("Profile fetch response:", { profile, fetchError });

        if (fetchError) {
          if (fetchError.code === "PGRST116") {
            console.log("Creating default profile for new user");

            const defaultProfile = {
              id: input.id,
              name: input?.user_metadata?.name || "New User",
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

            if (createError) {
              console.error("Error creating default profile:", createError);
              throw createError;
            }

            console.log("Created default profile:", newProfile);
            setProfileData(newProfile);
          } else {
            throw fetchError;
          }
        } else if (profile) {
          console.log("Setting existing profile data:", profile);
          setProfileData(profile);
        }

        // Fetch links
        const { data: links } = await supabase
          .from("links")
          .select("*")
          .eq("user_id", input.id)
          .order("order_index");

        // Fetch subtitles
        const { data: subtitles } = await supabase
          .from("subtitles")
          .select("*")
          .eq("user_id", input.id)
          .order("order_index");

        setProfileData((prev) => ({
          ...prev,
          links: links || [],
          subtitles: subtitles || [],
        }));
      } catch (error) {
        console.error("Profile fetch failed:", {
          error,
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        setError(error.message || "Failed to load profile");
        toast.error("Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [input, defaultAvatar]);

  const handleSave = async (updates) => {
    try {
      if (!input?.id) {
        throw new Error("User ID is required");
      }

      console.log("Attempting to save profile updates:", updates);
      setError(null);

      // First check if this is a username update and if it's already taken
      if (updates.username) {
        const { data: existingUser, error: checkError } = await supabase
          .from("profiles")
          .select("id")
          .eq("username", updates.username)
          .neq("id", input.id)
          .single();

        if (checkError && checkError.code !== "PGRST116") {
          throw checkError;
        }

        if (existingUser) {
          throw new Error("Username is already taken");
        }
      }

      // Prepare update data
      const updateData = {
        ...updates,
        id: input.id,
        updated_at: new Date().toISOString(),
      };

      console.log("Sending update to Supabase:", updateData);

      const { data, error: updateError } = await supabase
        .from("profiles")
        .upsert(updateData)
        .select()
        .single();

      if (updateError) {
        console.error("Supabase update error:", updateError);
        throw updateError;
      }

      console.log("Profile update successful:", data);

      // Update local state
      setProfileData((prev) => ({
        ...prev,
        ...data,
      }));

      return true;
    } catch (error) {
      console.error("Profile save failed:", {
        error,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      setError(error.message || "Failed to save profile changes");
      toast.error(error.message || "Failed to save profile changes");
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
