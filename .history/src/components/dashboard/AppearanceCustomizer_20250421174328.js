"use client";

import React, { useState, useEffect, useRef } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// Import components
import BackgroundTab from "@/app/utils/backgroundTab";
import TextTab from "@/app/utils/textTab";
import ButtonsTab from "@/app/utils/buttonsTab";

import StylePreview from "@/app/utils/stylePreview";

// Import services
import { backgroundService } from "./backgroundService";
import { backgroundService } from "@/app/utils/backgroundService";
import { profileService } from "@/app/utils/profileService";

// Import utility functions
import { getInitialTailwindClass } from "@/app/utils/color-utils";

export function AppearanceCustomizer({ user, initialProfile }) {
  const supabase = createClientComponentClient();
  const [isUpdating, setIsUpdating] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [isCheckingBackground, setIsCheckingBackground] = useState(true);
  const [activeTab, setActiveTab] = useState("background");
  const [profileUpdated, setProfileUpdated] = useState(false);

  // Add debug ref to track initialProfile changes
  const previousProfileRef = useRef();

  // Initialize customization state with proper color mappings
  const [customization, setCustomization] = useState({
    profile_bg_color: getInitialTailwindClass(
      initialProfile?.profile_bg_color,
      "profile_bg_color"
    ),
    profile_text_color: getInitialTailwindClass(
      initialProfile?.profile_text_color,
      "profile_text_color"
    ),
    button_bg_color: getInitialTailwindClass(
      initialProfile?.button_bg_color,
      "button_bg_color"
    ),
    button_text_color: getInitialTailwindClass(
      initialProfile?.button_text_color,
      "button_text_color"
    ),
  });

  // Debugging log for profile and background image changes
  useEffect(() => {
    console.log("initialProfile updated:", initialProfile);
    console.log("backgroundImage state:", backgroundImage);

    // Track if the initialProfile has changed
    if (previousProfileRef.current !== initialProfile) {
      console.log("Profile changed, updating state");
      previousProfileRef.current = initialProfile;
    }
  }, [initialProfile, backgroundImage]);

  // Effect to check for background image on mount and profile updates
  useEffect(() => {
    const checkBackgroundImage = async () => {
      if (!user?.id) return;

      setIsCheckingBackground(true);
      try {
        const latestBackgroundImage =
          await backgroundService.getBackgroundImage(supabase, user.id);

        setBackgroundImage(latestBackgroundImage);
      } catch (error) {
        console.error("Error checking background image:", error);
        toast.error("Failed to check background image");
      } finally {
        setIsCheckingBackground(false);
      }
    };

    checkBackgroundImage();
  }, [user?.id, initialProfile, profileUpdated]);

  // Effect to update customization when initialProfile changes
  useEffect(() => {
    if (initialProfile) {
      console.log("Updating customization from initialProfile", initialProfile);
      setCustomization({
        profile_bg_color: getInitialTailwindClass(
          initialProfile.profile_bg_color,
          "profile_bg_color"
        ),
        profile_text_color: getInitialTailwindClass(
          initialProfile.profile_text_color,
          "profile_text_color"
        ),
        button_bg_color: getInitialTailwindClass(
          initialProfile.button_bg_color,
          "button_bg_color"
        ),
        button_text_color: getInitialTailwindClass(
          initialProfile.button_text_color,
          "button_text_color"
        ),
      });
    }
  }, [initialProfile]);

  // Subscribe to real-time updates for the profile
  useEffect(() => {
    if (!user?.id) return;

    const channel = profileService.subscribeToProfileChanges(
      supabase,
      user.id,
      (payload) => {
        // If background_image was updated in the database
        if (payload.new.background_image !== payload.old.background_image) {
          setBackgroundImage(payload.new.background_image);
          console.log(
            "Background image updated via subscription to:",
            payload.new.background_image
          );
        }
      }
    );

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [user?.id]);

  const handleImageUpload = async (e) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsUpdating(true);
      const newBackgroundUrl = await backgroundService.uploadBackgroundImage(
        supabase,
        file,
        user,
        backgroundImage
      );

      if (newBackgroundUrl) {
        setBackgroundImage(newBackgroundUrl);
        setProfileUpdated((prev) => !prev); // Toggle to trigger useEffect
        toast.success("Background image updated successfully");
      }
    } catch (error) {
      console.error("Image upload failed:", error);
      toast.error(error.message || "Failed to upload image");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveImage = async () => {
    try {
      setIsUpdating(true);

      // First, remove the image from storage
      await backgroundService.removeBackgroundImage(supabase, backgroundImage);

      // Then update the profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          background_image: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setBackgroundImage(null);
      setProfileUpdated((prev) => !prev); // Toggle to trigger useEffect
      console.log("Background image removed");

      toast.success("Background image removed");
    } catch (error) {
      console.error("Error removing image:", error);
      toast.error("Failed to remove image");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdate = async () => {
    if (!user?.id) {
      toast.error("User ID is required");
      return;
    }

    setIsUpdating(true);
    try {
      const success = await profileService.updateProfileCustomization(
        supabase,
        user.id,
        customization,
        backgroundImage
      );

      if (success) {
        // Toggle profileUpdated to trigger a refresh
        setProfileUpdated((prev) => !prev);
        toast.success("Profile appearance updated successfully");
      }
    } catch (error) {
      console.error("Update failed:", error);
      toast.error(error.message || "Failed to update appearance");
    } finally {
      setIsUpdating(false);
    }
  };

  // Render component based on selected tab
  return (
    <Card className="overflow-hidden shadow-sm">
      <CardHeader className="bg-gray-50">
        <CardTitle className="flex items-center text-xl">
          <span className="text-blue-500 mr-2">🎨</span>
          Customize Profile Appearance
        </CardTitle>
        <CardDescription>
          Personalize your profile with colors and background images
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs
          defaultValue="background"
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="background">Background</TabsTrigger>
            <TabsTrigger value="text">Text Colors</TabsTrigger>
            <TabsTrigger value="buttons">Buttons</TabsTrigger>
          </TabsList>

          <TabsContent value="background">
            <BackgroundTab
              user={user}
              backgroundImage={backgroundImage}
              isCheckingBackground={isCheckingBackground}
              isUpdating={isUpdating}
              handleRemoveImage={handleRemoveImage}
              handleImageUpload={handleImageUpload}
              customization={customization}
              setCustomization={setCustomization}
            />
          </TabsContent>

          <TabsContent value="text">
            <TextTab
              customization={customization}
              setCustomization={setCustomization}
            />
          </TabsContent>

          <TabsContent value="buttons">
            <ButtonsTab
              customization={customization}
              setCustomization={setCustomization}
            />
          </TabsContent>
        </Tabs>

        <StylePreview
          customization={customization}
          backgroundImage={backgroundImage}
        />
      </CardContent>

      <CardFooter className="bg-gray-50 p-6 flex justify-end">
        <Button
          onClick={handleUpdate}
          disabled={isUpdating || isCheckingBackground}
          className="w-full sm:w-auto"
        >
          {isUpdating ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            "Save Appearance"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default AppearanceCustomizer;
