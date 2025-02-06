import React, { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

// Predefined color options with corresponding Tailwind classes
const colorOptions = {
  backgrounds: [
    { label: "White", value: "bg-white" },
    { label: "Light Gray", value: "bg-gray-50" },
    { label: "Cool Gray", value: "bg-gray-100" },
    { label: "Light Blue", value: "bg-blue-50" },
    { label: "Light Green", value: "bg-green-50" },
    { label: "Light Purple", value: "bg-purple-50" },
  ],
  text: [
    { label: "Dark", value: "text-gray-900" },
    { label: "Gray", value: "text-gray-600" },
    { label: "Blue", value: "text-blue-600" },
    { label: "Green", value: "text-green-600" },
    { label: "Purple", value: "text-purple-600" },
  ],
  buttons: [
    { label: "Light Gray", value: "bg-gray-100" },
    { label: "Blue", value: "bg-blue-100" },
    { label: "Green", value: "bg-green-100" },
    { label: "Purple", value: "bg-purple-100" },
    { label: "Pink", value: "bg-pink-100" },
  ],
  buttonText: [
    { label: "Dark", value: "text-gray-900" },
    { label: "Gray", value: "text-gray-600" },
    { label: "Blue", value: "text-blue-600" },
    { label: "Green", value: "text-green-600" },
    { label: "Purple", value: "text-purple-600" },
  ],
};

const ColorSelect = ({ label, value, onChange, options }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border border-gray-300 p-2"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

export function AppearanceCustomizer({ user, initialProfile }) {
  const supabase = createClientComponentClient();
  const [customization, setCustomization] = useState({
    profile_bg_color: initialProfile?.profile_bg_color || "bg-white",
    button_bg_color: initialProfile?.button_bg_color || "bg-gray-100",
    button_text_color: initialProfile?.button_text_color || "text-gray-900",
    profile_text_color: initialProfile?.profile_text_color || "text-gray-600",
  });

  const handleUpdate = async () => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          profile_bg_color: customization.profile_bg_color,
          button_bg_color: customization.button_bg_color,
          button_text_color: customization.button_text_color,
          profile_text_color: customization.profile_text_color,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Profile appearance updated successfully");
    } catch (error) {
      console.error("Error updating appearance:", error);
      toast.error("Failed to update appearance");
    }
  };

  const updateCustomization = (key, value) => {
    setCustomization((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customize Profile Appearance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Card Appearance</h3>
            <ColorSelect
              label="Profile Card Background"
              value={customization.profile_bg_color}
              onChange={(val) => updateCustomization("profile_bg_color", val)}
              options={colorOptions.backgrounds}
            />
            <div className="mt-4">
              <ColorSelect
                label="Profile Text Color"
                value={customization.profile_text_color}
                onChange={(val) =>
                  updateCustomization("profile_text_color", val)
                }
                options={colorOptions.text}
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Button Styling</h3>
            <ColorSelect
              label="Button Background"
              value={customization.button_bg_color}
              onChange={(val) => updateCustomization("button_bg_color", val)}
              options={colorOptions.buttons}
            />
            <ColorSelect
              label="Button Text"
              value={customization.button_text_color}
              onChange={(val) => updateCustomization("button_text_color", val)}
              options={colorOptions.buttonText}
            />
          </div>
        </div>

        <Button onClick={handleUpdate} className="w-full">
          Update Appearance
        </Button>

        <div className="text-sm text-gray-500">
          Preview your changes in the profile preview section on the right.
        </div>
      </CardContent>
    </Card>
  );
}

export default AppearanceCustomizer;
