"use client";

import { useState } from "react";
import { Edit2, X, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

// Import custom hook and components
import { useProfile } from "@/hooks/useProfile";
import { ProfileImage } from "./profile/ProfileImage";
import { ProfileInfo } from "./profile/ProfileInfo";
import { ProfileLinks } from "./profile/ProfileLinks";

export const ProfilePreview = ({ user, subtitles, links, getLinkIcon }) => {
  const [isEditing, setIsEditing] = useState(false);
  const {
    profileData,
    setProfileData,
    isLoading,
    error,
    setError,
    defaultAvatar,
    handleSave,
    setIsLoading,
  } = useProfile(user);

  const onSave = async () => {
    const success = await handleSave(profileData);
    if (success) {
      setIsEditing(false);
      toast.success("Profile updated successfully");
    }
  };

  if (isLoading && !profileData.avatar_url) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Profile Preview</CardTitle>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={onSave}
              className="p-2 text-green-500 hover:text-green-700 rounded-full hover:bg-green-50"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setError(null);
              }}
              className="p-2 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="scale-90 transform origin-top">
          <div
            className={`bg-gradient-to-tr ${profileData.background_gradient_start} ${profileData.background_gradient_end} rounded-lg p-6`}
          >
            <div className="text-center space-y-8">
              <ProfileImage
                userId={user.id}
                isEditing={isEditing}
                isLoading={isLoading}
                profileData={profileData}
                defaultAvatar={defaultAvatar}
                setProfileData={setProfileData}
                setIsLoading={setIsLoading}
              />

              <ProfileInfo
                isEditing={isEditing}
                profileData={profileData}
                setProfileData={setProfileData}
              />

              <ProfileLinks
                subtitles={subtitles}
                links={links}
                getLinkIcon={getLinkIcon}
                profileData={profileData}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfilePreview;
