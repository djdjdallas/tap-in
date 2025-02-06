import React, { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

// Predefined color options using Tailwind classes
const colorOptions = {
  cardBackgrounds: [
    { label: "White", value: "bg-white" },
    { label: "Light Gray", value: "bg-gray-50" },
    { label: "Cool Gray", value: "bg-gray-100" },
    { label: "Light Blue", value: "bg-blue-50" },
    { label: "Light Green", value: "bg-green-50" },
    { label: "Light Pink", value: "bg-pink-50" },
  ],
  textColors: [
    { label: "Dark Gray", value: "text-gray-900" },
    { label: "Medium Gray", value: "text-gray-600" },
    { label: "Blue", value: "text-blue-600" },
    { label: "Green", value: "text-green-600" },
    { label: "Purple", value: "text-purple-600" },
  ],
  buttonBackgrounds: [
    { label: "Gray", value: "bg-gray-100" },
    { label: "Blue", value: "bg-blue-100" },
    { label: "Green", value: "bg-green-100" },
    { label: "Pink", value: "bg-pink-100" },
    { label: "Purple", value: "bg-purple-100" },
  ],
  buttonTextColors: [
    { label: "Dark Gray", value: "text-gray-900" },
    { label: "Medium Gray", value: "text-gray-600" },
    { label: "Blue", value: "text-blue-600" },
    { label: "Green", value: "text-green-600" },
    { label: "Purple", value: "text-purple-600" },
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
  const [customization, setCustomization] = useState({
    background_gradient_start:
      initialProfile?.background_gradient_start || "bg-white",
    background_gradient_end:
      initialProfile?.background_gradient_end || "bg-white",
    button_bg_color: initialProfile?.button_bg_color || "bg-gray-100",
    button_text_color: initialProfile?.button_text_color || "text-gray-900",
    profile_text_color: initialProfile?.profile_text_color || "text-gray-600",
  });

  const handleUpdate = async () => {
    if (!user?.id) {
      toast.error("User ID is required");
      return;
    }

    setIsUpdating(true);
    try {
      console.log("Updating profile with:", customization);

      const { data, error } = await supabase
        .from("profiles")
        .update({
          background_gradient_start: customization.background_gradient_start,
          background_gradient_end: customization.background_gradient_end,
          button_bg_color: customization.button_bg_color,
          button_text_color: customization.button_text_color,
          profile_text_color: customization.profile_text_color,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Supabase update error:", error);
        throw new Error(error.message);
      }

      console.log("Update successful:", data);
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
            selectedValue={customization.background_gradient_start}
            onChange={(value) =>
              setCustomization((prev) => ({
                ...prev,
                background_gradient_start: value,
                background_gradient_end: value,
              }))
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
            title="Button Background"
            options={colorOptions.buttonBackgrounds}
            selectedValue={customization.button_bg_color}
            onChange={(value) =>
              setCustomization((prev) => ({
                ...prev,
                button_bg_color: value,
              }))
            }
          />

          <ColorSection
            title="Button Text"
            options={colorOptions.buttonTextColors}
            selectedValue={customization.button_text_color}
            onChange={(value) =>
              setCustomization((prev) => ({
                ...prev,
                button_text_color: value,
              }))
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
