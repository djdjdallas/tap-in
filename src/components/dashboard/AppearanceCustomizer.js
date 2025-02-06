import React, { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

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
    className={`px-4 py-2 rounded-md text-sm ${value} ${
      selectedValue === value
        ? "ring-2 ring-blue-500 ring-offset-2"
        : "border border-gray-200"
    }`}
  >
    {label}
  </button>
);

const ColorSection = ({ title, options, selectedValue, onChange }) => (
  <div className="space-y-3">
    <h3 className="text-sm font-medium text-gray-700">{title}</h3>
    <div className="grid grid-cols-2 gap-2">
      {options.map((option) => (
        <ColorOptionButton
          key={option.value}
          label={option.label}
          value={option.value}
          selectedValue={selectedValue}
          onChange={onChange}
        />
      ))}
    </div>
  </div>
);

export function AppearanceCustomizer({ user, initialProfile }) {
  const supabase = createClientComponentClient();
  const [isUpdating, setIsUpdating] = useState(false);

  // Convert initial values from short codes to Tailwind classes
  const getInitialTailwindClass = (shortCode, type) => {
    const mapping = {
      profile_bg_color: colorMappings.backgrounds,
      profile_text_color: colorMappings.text,
      button_bg_color: colorMappings.buttons,
      button_text_color: colorMappings.text,
    };
    return shortCode
      ? mapping[type][shortCode] || shortCode
      : colorOptions.cardBackgrounds[0].value;
  };

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

      console.log("Updating profile with:", updateData);

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", user.id);

      if (error) {
        console.error("Supabase update error:", error);
        throw new Error(error.message);
      }

      toast.success("Profile appearance updated successfully");
    } catch (error) {
      console.error("Update failed:", error);
      toast.error(error.message || "Failed to update appearance");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customize Profile Appearance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-6">
          <ColorSection
            title="Card Background"
            options={colorOptions.cardBackgrounds}
            selectedValue={customization.profile_bg_color}
            onChange={(value) =>
              setCustomization((prev) => ({ ...prev, profile_bg_color: value }))
            }
          />

          <ColorSection
            title="Text Color"
            options={colorOptions.textColors}
            selectedValue={customization.profile_text_color}
            onChange={(value) =>
              setCustomization((prev) => ({
                ...prev,
                profile_text_color: value,
              }))
            }
          />

          <ColorSection
            title="Button Style"
            options={colorOptions.buttonBackgrounds}
            selectedValue={customization.button_bg_color}
            onChange={(value) =>
              setCustomization((prev) => ({ ...prev, button_bg_color: value }))
            }
          />

          <Button
            onClick={handleUpdate}
            className="w-full"
            disabled={isUpdating}
          >
            {isUpdating ? "Updating..." : "Update Appearance"}
          </Button>
        </div>

        <div className="text-sm text-gray-500">
          Changes will be reflected in the preview immediately.
        </div>
      </CardContent>
    </Card>
  );
}

export default AppearanceCustomizer;
