// components/DashboardHeader.js
"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const DashboardHeader = ({ user, onSignOut }) => {
  const router = useRouter();
  const { profileData, isLoading } = useProfile(user);

  const handleShare = async () => {
    if (profileData?.username) {
      const url = `${window.location.origin}/${profileData.username}`;
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Profile URL copied to clipboard!");
      } catch (err) {
        toast.error("Failed to copy URL");
      }
    } else {
      toast.error("Please set a username first");
    }
  };

  const handlePreview = () => {
    if (profileData?.username) {
      window.open(`/${profileData.username}`, "_blank");
    } else {
      toast.error("Please set a username first");
    }
  };

  return (
    <div className="p-8 bg-white border-b">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-600">Welcome, {user?.email}</p>
            {profileData?.username && (
              <p className="text-sm text-gray-500 mt-1">
                Your profile: {window.location.origin}/{profileData.username}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handlePreview}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Preview Profile
            </Button>
            <Button
              onClick={handleShare}
              className="bg-gray-800 text-white hover:bg-gray-700"
            >
              Share Profile
            </Button>
            <Button
              onClick={onSignOut}
              className="bg-blue-600 hover:bg-blue-500"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
