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

  // Debug input
  useEffect(() => {
    console.log("useProfile input:", input);
  }, [input]);

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

    console.log("Setting up profile subscription for:", input);

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
          console.log("Profile update received:", payload);
          if (payload.new) {
            setProfileData((prevData) => ({
              ...prevData,
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
        // Input validation
        if (!input?.id && typeof input !== "string") {
          console.log("No valid input provided to useProfile");
          setIsLoading(false);
          return;
        }

        console.log("Fetching profile for:", input);
        setError(null);

        // Build query
        let query = supabase
          .from("profiles")
          .select("*, links (*), subtitles (*)");

        if (typeof input === "string") {
          query = query.eq("username", input);
        } else if (input?.id) {
          query = query.eq("id", input.id);
        } else {
          throw new Error(
            "Invalid input: must be username string or user object with id"
          );
        }

        // Execute query
        const { data: profile, error: fetchError } = await query.single();
        console.log("Profile query response:", { profile, fetchError });

        if (fetchError) {
          // Handle case where profile doesn't exist for a new user
          if (fetchError.code === "PGRST116" && input?.id) {
            console.log("Creating default profile for new user");

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

            if (createError) {
              console.error("Error creating default profile:", createError);
              throw createError;
            }

            console.log("Created default profile:", newProfile);

            setProfileData({
              ...newProfile,
              links: [],
              subtitles: [],
              avatar_url: defaultAvatar,
            });
            setIsLoading(false);
            return;
          }
          console.error("Error fetching profile:", fetchError);
          throw fetchError;
        }

        if (profile) {
          console.log("Setting profile data:", profile);
          setProfileData({
            ...profile,
            links: profile.links || [],
            subtitles: profile.subtitles || [],
            avatar_url: profile.avatar_url || defaultAvatar,
          });
        }
      } catch (error) {
        const errorMessage =
          error?.message || error?.toString() || "Failed to load profile";
        console.error("Profile fetch failed:", {
          error,
          message: errorMessage,
          details: error?.details,
          hint: error?.hint,
          code: error?.code,
        });
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [input, defaultAvatar]);

  const handleSave = async (updates) => {
    if (!input?.id) {
      const errorMessage = "User ID is required";
      console.error("Save failed:", errorMessage);
      setError(errorMessage);
      return false;
    }

    try {
      console.log("Saving profile updates:", updates);
      setError(null);

      const { error: updateError } = await supabase.from("profiles").upsert({
        ...updates,
        id: input.id,
        updated_at: new Date().toISOString(),
      });

      if (updateError) {
        console.error("Error updating profile:", updateError);
        throw updateError;
      }

      console.log("Profile saved successfully");
      toast.success("Profile saved successfully");
      return true;
    } catch (error) {
      const errorMessage =
        error?.message || error?.toString() || "Failed to save profile changes";
      console.error("Profile save failed:", {
        error,
        message: errorMessage,
        details: error?.details,
        hint: error?.hint,
        code: error?.code,
      });
      setError(errorMessage);
      toast.error(errorMessage);
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
