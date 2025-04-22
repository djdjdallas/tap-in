"use client";

import { toast } from "sonner";
import {
  isCustomColor,
  extractCustomColor,
  reverseColorMappings,
} from "./color-utils";

// Service functions to handle profile updates
export const profileService = {
  // Update profile customization settings
  updateProfileCustomization: async (
    supabase,
    userId,
    customization,
    backgroundImage
  ) => {
    try {
      if (!userId) {
        throw new Error("User ID is required");
      }

      // Convert values for storage
      // For standard Tailwind classes, use the short code mapping
      // For custom colors, store the hex value directly
      const updateData = {
        updated_at: new Date().toISOString(),
      };

      // Handle profile background color
      if (isCustomColor(customization.profile_bg_color)) {
        updateData.profile_bg_color = extractCustomColor(
          customization.profile_bg_color
        );
      } else {
        updateData.profile_bg_color =
          reverseColorMappings.backgrounds[customization.profile_bg_color];
      }

      // Handle profile text color
      if (isCustomColor(customization.profile_text_color)) {
        updateData.profile_text_color = extractCustomColor(
          customization.profile_text_color
        );
      } else {
        updateData.profile_text_color =
          reverseColorMappings.text[customization.profile_text_color];
      }

      // Handle button background color
      if (isCustomColor(customization.button_bg_color)) {
        updateData.button_bg_color = extractCustomColor(
          customization.button_bg_color
        );
      } else {
        updateData.button_bg_color =
          reverseColorMappings.buttons[customization.button_bg_color];
      }

      // Handle button text color
      if (isCustomColor(customization.button_text_color)) {
        updateData.button_text_color = extractCustomColor(
          customization.button_text_color
        );
      } else {
        updateData.button_text_color =
          reverseColorMappings.text[customization.button_text_color];
      }

      // Keep the current background image if it exists
      if (backgroundImage) {
        updateData.background_image = backgroundImage;
      }

      console.log("Updating profile with:", updateData);

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", userId);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error("Update failed:", error);
      toast.error(error.message || "Failed to update appearance");
      return false;
    }
  },

  // Subscribe to profile changes
  subscribeToProfileChanges: (supabase, userId, callback) => {
    if (!userId) return null;

    const channel = supabase
      .channel(`profile-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          console.log("Real-time profile update:", payload);
          callback(payload);
        }
      )
      .subscribe();

    return channel;
  },
};
