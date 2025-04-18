"use client";

import React, { useState, useEffect } from "react";
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
import {
  Upload,
  Image as ImageIcon,
  X,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// Color mappings between short codes and Tailwind classes
const colorMappings = {
  backgrounds: {
    wht: "bg-white",
    gry50: "bg-gray-50",
    gry100: "bg-gray-100",
    blu50: "bg-blue-50",
    grn50: "bg-green-50",
    pnk50: "bg-pink-50",
  },
  text: {
    gry900: "text-gray-900",
    gry600: "text-gray-600",
    blu600: "text-blue-600",
    grn600: "text-green-600",
    prp600: "text-purple-600",
  },
  buttons: {
    gry100: "bg-gray-100",
    blu100: "bg-blue-100",
    grn100: "bg-green-100",
    pnk100: "bg-pink-100",
    prp100: "bg-purple-100",
  },
};

const getInitialTailwindClass = (shortCode, type) => {
  if (!shortCode) {
    // Default values for each type
    const defaults = {
      profile_bg_color: "bg-white",
      profile_text_color: "text-gray-900",
      button_bg_color: "bg-gray-100",
      button_text_color: "text-gray-900",
    };
    return defaults[type];
  }

  // Map the shortcode to the corresponding Tailwind class based on type
  switch (type) {
    case "profile_bg_color":
      return colorMappings.backgrounds[shortCode] || "bg-white";
    case "profile_text_color":
    case "button_text_color":
      return colorMappings.text[shortCode] || "text-gray-900";
    case "button_bg_color":
      return colorMappings.buttons[shortCode] || "bg-gray-100";
    default:
      return null;
  }
};

// Reverse mappings for converting Tailwind classes back to short codes
const reverseColorMappings = {
  backgrounds: Object.entries(colorMappings.backgrounds).reduce(
    (acc, [key, value]) => ({ ...acc, [value]: key }),
    {}
  ),
  text: Object.entries(colorMappings.text).reduce(
    (acc, [key, value]) => ({ ...acc, [value]: key }),
    {}
  ),
  buttons: Object.entries(colorMappings.buttons).reduce(
    (acc, [key, value]) => ({ ...acc, [value]: key }),
    {}
  ),
};

// Color options for the UI
const colorOptions = {
  cardBackgrounds: [
    { label: "White", value: colorMappings.backgrounds.wht },
    { label: "Light Gray", value: colorMappings.backgrounds.gry50 },
    { label: "Cool Gray", value: colorMappings.backgrounds.gry100 },
    { label: "Light Blue", value: colorMappings.backgrounds.blu50 },
    { label: "Light Green", value: colorMappings.backgrounds.grn50 },
    { label: "Light Pink", value: colorMappings.backgrounds.pnk50 },
  ],
  textColors: [
    { label: "Dark Gray", value: colorMappings.text.gry900 },
    { label: "Medium Gray", value: colorMappings.text.gry600 },
    { label: "Blue", value: colorMappings.text.blu600 },
    { label: "Green", value: colorMappings.text.grn600 },
    { label: "Purple", value: colorMappings.text.prp600 },
  ],
  buttonBackgrounds: [
    { label: "Gray", value: colorMappings.buttons.gry100 },
    { label: "Blue", value: colorMappings.buttons.blu100 },
    { label: "Green", value: colorMappings.buttons.grn100 },
    { label: "Pink", value: colorMappings.buttons.pnk100 },
    { label: "Purple", value: colorMappings.buttons.prp100 },
  ],
};

const ColorOptionButton = ({ label, value, selectedValue, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(value)}
    className={`flex items-center justify-between px-4 py-3 rounded-md ${value} ${
      selectedValue === value
        ? "ring-2 ring-blue-500 ring-offset-2"
        : "border border-gray-200 hover:border-gray-300"
    } transition-all duration-200`}
  >
    <span className="font-medium">{label}</span>
    {selectedValue === value && (
      <CheckCircle className="w-5 h-5 text-blue-500" />
    )}
  </button>
);

// Preview card that shows how selected styles will look
const StylePreview = ({ customization, backgroundImage }) => (
  <div className="mt-6 border rounded-lg overflow-hidden">
    <div className="p-4 bg-gray-100 border-b">
      <h3 className="text-sm font-medium text-gray-700">Live Preview</h3>
    </div>
    <div
      className={`p-6 ${
        backgroundImage ? "bg-cover bg-center" : customization.profile_bg_color
      }`}
      style={
        backgroundImage
          ? {
              backgroundImage: `url(${backgroundImage})`,
              position: "relative",
            }
          : {}
      }
    >
      {backgroundImage && (
        <div
          className="absolute inset-0 bg-black bg-opacity-40"
          style={{ zIndex: 0 }}
        />
      )}
      <div className="relative z-10">
        <div className="text-center mb-4">
          <div className="w-16 h-16 mx-auto bg-gray-300 rounded-full mb-2 flex items-center justify-center text-white">
            <span>Avatar</span>
          </div>
          <h3
            className={`text-lg font-bold ${
              backgroundImage ? "text-white" : customization.profile_text_color
            }`}
          >
            Profile Name
          </h3>
          <p
            className={`text-sm ${
              backgroundImage ? "text-white" : customization.profile_text_color
            }`}
          >
            Your Title Goes Here
          </p>
        </div>
        <div className="mt-4">
          <div
            className={`p-3 ${customization.button_bg_color} rounded-lg flex items-center justify-between mb-2`}
          >
            <span className={`${customization.button_text_color}`}>
              Sample Link
            </span>
            <span className={`${customization.button_text_color}`}>→</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export function AppearanceCustomizer({ user, initialProfile }) {
  const supabase = createClientComponentClient();
  const [isUpdating, setIsUpdating] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [isCheckingBackground, setIsCheckingBackground] = useState(true);
  const [activeTab, setActiveTab] = useState("background");

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

  // Effect to check for background image on mount and profile updates
  useEffect(() => {
    const checkBackgroundImage = async () => {
      if (!user?.id) return;

      setIsCheckingBackground(true);
      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("background_image")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        // If there's a background image URL, verify it exists
        if (profile?.background_image) {
          // Try to fetch the image to verify it exists
          try {
            const response = await fetch(profile.background_image, {
              method: "HEAD",
            });
            if (response.ok) {
              setBackgroundImage(profile.background_image);
            } else {
              // If image doesn't exist, clear it from the profile
              await supabase
                .from("profiles")
                .update({ background_image: null })
                .eq("id", user.id);
              setBackgroundImage(null);
            }
          } catch (e) {
            console.warn("Error verifying background image:", e);
            setBackgroundImage(null);
          }
        } else {
          setBackgroundImage(null);
        }
      } catch (error) {
        console.error("Error checking background image:", error);
        toast.error("Failed to check background image");
      } finally {
        setIsCheckingBackground(false);
      }
    };

    checkBackgroundImage();
  }, [user?.id, initialProfile]);

  // Effect to update customization when initialProfile changes
  useEffect(() => {
    if (initialProfile) {
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

  const handleImageUpload = async (e) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        throw new Error("Please upload an image file");
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error("File size must be less than 5MB");
      }

      setIsUpdating(true);

      // Delete old background if exists
      if (backgroundImage) {
        const oldPath = backgroundImage.split("/backgrounds/")[1];
        if (oldPath) {
          await supabase.storage.from("backgrounds").remove([oldPath]);
        }
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

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          background_image: newBackgroundUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setBackgroundImage(newBackgroundUrl);
      toast.success("Background image updated successfully");
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

      if (backgroundImage) {
        const oldPath = backgroundImage.split("/backgrounds/")[1];
        if (oldPath) {
          await supabase.storage.from("backgrounds").remove([oldPath]);
        }
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          background_image: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setBackgroundImage(null);
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
      // Convert Tailwind classes back to short codes for storage
      const updateData = {
        profile_bg_color:
          reverseColorMappings.backgrounds[customization.profile_bg_color],
        profile_text_color:
          reverseColorMappings.text[customization.profile_text_color],
        button_bg_color:
          reverseColorMappings.buttons[customization.button_bg_color],
        button_text_color:
          reverseColorMappings.text[customization.button_text_color],
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Profile appearance updated successfully");
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
          <ImageIcon className="w-5 h-5 mr-2 text-blue-500" />
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

          <TabsContent value="background" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-medium text-gray-700">
                  Profile Background
                </h3>
                {backgroundImage && !isCheckingBackground && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveImage}
                    className="text-red-500 hover:text-red-600"
                    disabled={isUpdating}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Remove Image
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed rounded-lg cursor-pointer hover:border-blue-500 transition-colors bg-gray-50">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUpdating || isCheckingBackground}
                  />
                  <ImageIcon className="w-8 h-8 mb-2 text-gray-400" />
                  <span className="text-sm text-center text-gray-500">
                    {isCheckingBackground
                      ? "Checking..."
                      : "Upload Background Image"}
                  </span>
                </label>

                {colorOptions.cardBackgrounds.map((option) => (
                  <ColorOptionButton
                    key={option.value}
                    label={option.label}
                    value={option.value}
                    selectedValue={customization.profile_bg_color}
                    onChange={(value) =>
                      setCustomization((prev) => ({
                        ...prev,
                        profile_bg_color: value,
                      }))
                    }
                  />
                ))}
              </div>

              {backgroundImage && !isCheckingBackground && (
                <div className="mt-4">
                  <div className="relative w-full h-32 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={backgroundImage}
                      alt="Background Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                      <span className="text-white text-sm font-medium px-3 py-1 bg-black bg-opacity-50 rounded-full">
                        Current Background
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="text" className="space-y-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-medium text-gray-700 mb-3">
                  Profile Text Color
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {colorOptions.textColors.map((option) => (
                    <ColorOptionButton
                      key={option.value}
                      label={option.label}
                      value={option.value}
                      selectedValue={customization.profile_text_color}
                      onChange={(value) =>
                        setCustomization((prev) => ({
                          ...prev,
                          profile_text_color: value,
                        }))
                      }
                    />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-base font-medium text-gray-700 mb-3">
                  Button Text Color
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {colorOptions.textColors.map((option) => (
                    <ColorOptionButton
                      key={option.value}
                      label={option.label}
                      value={option.value}
                      selectedValue={customization.button_text_color}
                      onChange={(value) =>
                        setCustomization((prev) => ({
                          ...prev,
                          button_text_color: value,
                        }))
                      }
                    />
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="buttons" className="space-y-6">
            <div>
              <h3 className="text-base font-medium text-gray-700 mb-3">
                Button Background Colors
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {colorOptions.buttonBackgrounds.map((option) => (
                  <ColorOptionButton
                    key={option.value}
                    label={option.label}
                    value={option.value}
                    selectedValue={customization.button_bg_color}
                    onChange={(value) =>
                      setCustomization((prev) => ({
                        ...prev,
                        button_bg_color: value,
                      }))
                    }
                  />
                ))}
              </div>
            </div>
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
