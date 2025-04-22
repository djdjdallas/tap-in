"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Eye,
  Share2,
  LogOut,
  Copy,
  Check,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import useProfile from "@/app/hooks/useProfile";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const DashboardHeader = ({ user, onSignOut }) => {
  const router = useRouter();
  const { profileData, isLoading } = useProfile(user);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (profileData?.username) {
      const url = `${window.location.origin}/${profileData.username}`;
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success("Profile URL copied to clipboard!");

        // Reset the copied state after 2 seconds
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        toast.error("Failed to copy URL");
      }
    } else {
      toast.error("Please set a username first");
      router.push("/dashboard/username");
    }
  };

  const handlePreview = () => {
    if (profileData?.username) {
      router.push(`/preview/${profileData.username}`);
    } else {
      // Fallback to user ID if no username is set
      router.push(`/preview/${user.id}`);
    }
  };

  const handleVisitProfile = () => {
    if (profileData?.username) {
      window.open(`/${profileData.username}`, "_blank");
    } else {
      toast.error("Please set a username first");
      router.push("/dashboard/username");
    }
  };

  const profileUrl = profileData?.username
    ? `${window.location.origin}/${profileData.username}`
    : "No username set";

  return (
    <header className="sticky top-0 z-10 bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center">
            <Link
              href="/dashboard"
              className="flex items-center space-x-3 text-blue-600 hover:text-blue-700 transition"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                T
              </div>
              <span className="font-semibold text-xl">Tap In</span>
            </Link>
          </div>

          {/* User Info & Actions (Desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Username/Profile URL Display */}
            {profileData?.username && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className="flex items-center px-3 py-1.5 bg-gray-50 rounded-md cursor-pointer hover:bg-gray-100 transition"
                      onClick={handleShare}
                    >
                      <span className="text-sm text-gray-600 mr-2 truncate max-w-[180px]">
                        {profileUrl}
                      </span>
                      {copied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Click to copy your profile URL</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* Action Buttons */}
            <Button
              onClick={handlePreview}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              <span>Preview</span>
            </Button>

            <Button
              onClick={handleShare}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-800 border-gray-200"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </Button>

            <Button
              onClick={onSignOut}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </Button>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Menu
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {profileData?.username && (
                  <>
                    <div className="px-2 py-1.5">
                      <p className="text-xs text-gray-500">Your profile</p>
                      <div className="flex items-center justify-between text-sm font-medium text-gray-900 truncate">
                        {profileUrl.substring(0, 30)}...
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={handleShare}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={handlePreview}>
                  <Eye className="w-4 h-4 mr-2" />
                  Preview Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleVisitProfile}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Visit Public Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onSignOut} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Welcome Bar (below header) */}
      <div className="bg-gray-50 py-4 px-4 border-b">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome, {user?.email}</p>
            </div>
            {!profileData?.username && (
              <Button
                onClick={() => router.push("/dashboard/username")}
                className="mt-3 sm:mt-0"
                size="sm"
              >
                <span>Set Username</span>
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
