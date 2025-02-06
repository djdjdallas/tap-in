import React, { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const ColorPicker = ({ label, value, onChange }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <div className="flex items-center space-x-3">
      <Input
        type="color"
        value={value || "#000000"}
        onChange={(e) => onChange(e.target.value)}
        className="w-16 h-10 p-0 border-none"
      />
      <Input
        type="text"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Hex Color (e.g., #FF0000)"
        className="flex-grow"
      />
    </div>
  </div>
);

export function AppearanceCustomizer({ user, initialProfile }) {
  const supabase = createClientComponentClient();
  const [customization, setCustomization] = useState({
    background_gradient_start:
      initialProfile?.background_gradient_start || "#ffffff",
    background_gradient_end:
      initialProfile?.background_gradient_end || "#f0f0f0",
    button_bg_color: initialProfile?.button_bg_color || "#000000",
    button_text_color: initialProfile?.button_text_color || "#ffffff",
    profile_text_color: initialProfile?.profile_text_color || "#333333",
    profile_bg_color: initialProfile?.profile_bg_color || "#ffffff",
  });

  const handleUpdate = async () => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          background_gradient_start: customization.background_gradient_start,
          background_gradient_end: customization.background_gradient_end,
          button_bg_color: customization.button_bg_color,
          button_text_color: customization.button_text_color,
          profile_text_color: customization.profile_text_color,
          profile_bg_color: customization.profile_bg_color,
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
            <h3 className="text-lg font-semibold mb-4">Background Colors</h3>
            <ColorPicker
              label="Page Gradient Start"
              value={customization.background_gradient_start}
              onChange={(val) =>
                updateCustomization("background_gradient_start", val)
              }
            />
            <ColorPicker
              label="Page Gradient End"
              value={customization.background_gradient_end}
              onChange={(val) =>
                updateCustomization("background_gradient_end", val)
              }
            />
            <div className="mt-4">
              <ColorPicker
                label="Profile Background"
                value={customization.profile_bg_color}
                onChange={(val) => updateCustomization("profile_bg_color", val)}
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Button Styling</h3>
            <ColorPicker
              label="Button Background"
              value={customization.button_bg_color}
              onChange={(val) => updateCustomization("button_bg_color", val)}
            />
            <ColorPicker
              label="Button Text"
              value={customization.button_text_color}
              onChange={(val) => updateCustomization("button_text_color", val)}
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Text Color</h3>
          <ColorPicker
            label="Profile Text"
            value={customization.profile_text_color}
            onChange={(val) => updateCustomization("profile_text_color", val)}
          />
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
