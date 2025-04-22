"use client";

import { toast } from "sonner";

// Service functions to handle background image operations
export const backgroundService = {
  // Upload a new background image
  uploadBackgroundImage: async (supabase, file, user, backgroundImage) => {
    try {
      if (!file) return null;

      if (!file.type.startsWith("image/")) {
        throw new Error("Please upload an image file");
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error("File size must be less than 5MB");
      }

      // Delete old background if exists
      if (backgroundImage) {
        await backgroundService.removeBackgroundImage(
          supabase,
          backgroundImage
        );
      }

      // Upload new image
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/background-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("backgrounds")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("backgrounds")
        .getPublicUrl(fileName);

      const newBackgroundUrl = urlData?.publicUrl;
      if (!newBackgroundUrl) throw new Error("Failed to get public URL");

      // Update the profile with the new background image
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          background_image: newBackgroundUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) throw updateError;

      console.log(
        "Background image uploaded and updated to:",
        newBackgroundUrl
      );
      return newBackgroundUrl;
    } catch (error) {
      console.error("Image upload failed:", error);
      toast.error(error.message || "Failed to upload image");
      return null;
    }
  },

  // Remove an existing background image
  removeBackgroundImage: async (supabase, backgroundImage) => {
    try {
      if (!backgroundImage) return true;

      const oldPath = backgroundImage.split("/backgrounds/")[1];
      if (oldPath) {
        await supabase.storage.from("backgrounds").remove([oldPath]);
      }
      return true;
    } catch (error) {
      console.error("Error removing image from storage:", error);
      return false;
    }
  },

  // Get the latest background image from profile
  getBackgroundImage: async (supabase, userId) => {
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("background_image")
        .eq("id", userId)
        .single();

      if (error) throw error;

      return profile?.background_image || null;
    } catch (error) {
      console.error("Error fetching background image:", error);
      return null;
    }
  },
};
