import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AvatarUpload } from "@/components/dashboard/AvatarUpload";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const colorOptions = {
  backgrounds: [
    { label: "White", value: "bg-white" },
    { label: "Light Gray", value: "bg-gray-50" },
    { label: "Cool Gray", value: "bg-gray-100" },
    { label: "Light Blue", value: "bg-blue-50" },
    { label: "Light Green", value: "bg-green-50" },
    { label: "Light Pink", value: "bg-pink-50" },
  ],
  text: [
    { label: "Dark Gray", value: "text-gray-900" },
    { label: "Medium Gray", value: "text-gray-600" },
    { label: "Blue", value: "text-blue-600" },
    { label: "Green", value: "text-green-600" },
    { label: "Purple", value: "text-purple-600" },
  ],
  buttons: [
    { label: "Gray", value: "bg-gray-100" },
    { label: "Blue", value: "bg-blue-100" },
    { label: "Green", value: "bg-green-100" },
    { label: "Pink", value: "bg-pink-100" },
    { label: "Purple", value: "bg-purple-100" },
  ],
};

export default function AppearancePage({ user }) {
  const supabase = createClientComponentClient();
  const [isUploading, setIsUploading] = useState(false);
  const [profileData, setProfileData] = useState({
    profile_bg_color: "bg-white",
    profile_text_color: "text-gray-900",
    button_bg_color: "bg-gray-100",
  });

  const handleBackgroundUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);

      // Create unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/background-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("backgrounds")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("backgrounds")
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ background_image: urlData.publicUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      toast.success("Background updated successfully");
    } catch (error) {
      console.error("Background upload failed:", error);
      toast.error("Failed to upload background");
    } finally {
      setIsUploading(false);
    }
  };

  const handleColorChange = async (type, value) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ [type]: value })
        .eq("id", user.id);

      if (error) throw error;

      setProfileData((prev) => ({ ...prev, [type]: value }));
      toast.success("Appearance updated successfully");
    } catch (error) {
      toast.error("Failed to update appearance");
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Customize Appearance</h1>

      <Card>
        <CardHeader>
          <CardTitle>Profile Image</CardTitle>
        </CardHeader>
        <CardContent>
          <AvatarUpload
            user={user}
            size="large"
            onAvatarChange={(url) => {
              toast.success("Profile image updated successfully");
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Background</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <Label>Upload Image</Label>
              <div className="mt-2">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleBackgroundUpload}
                    disabled={isUploading}
                  />
                  {isUploading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900" />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-400" />
                      <span className="mt-2 text-sm text-gray-500">
                        Upload Background
                      </span>
                    </>
                  )}
                </label>
              </div>
            </div>

            {colorOptions.backgrounds.map((option) => (
              <button
                key={option.value}
                onClick={() =>
                  handleColorChange("profile_bg_color", option.value)
                }
                className={`p-4 rounded-lg border ${option.value} ${
                  profileData.profile_bg_color === option.value
                    ? "ring-2 ring-blue-500"
                    : ""
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Colors</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label>Text Color</Label>
            <div className="grid grid-cols-2 gap-4">
              {colorOptions.text.map((option) => (
                <button
                  key={option.value}
                  onClick={() =>
                    handleColorChange("profile_text_color", option.value)
                  }
                  className={`p-4 rounded-lg border ${option.value} ${
                    profileData.profile_text_color === option.value
                      ? "ring-2 ring-blue-500"
                      : ""
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Label>Button Style</Label>
            <div className="grid grid-cols-2 gap-4">
              {colorOptions.buttons.map((option) => (
                <button
                  key={option.value}
                  onClick={() =>
                    handleColorChange("button_bg_color", option.value)
                  }
                  className={`p-4 rounded-lg border ${option.value} ${
                    profileData.button_bg_color === option.value
                      ? "ring-2 ring-blue-500"
                      : ""
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
