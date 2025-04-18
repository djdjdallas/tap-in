"use client";
// app/(auth)/dashboard/settings/page.js
import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Briefcase, Globe, Lock, Mail, Shield, User } from "lucide-react";
import useProfile from "@/app/hooks/useProfile";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function SettingsPage({ user }) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { profileData, isLoading, handleSave } = useProfile(user);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleProfileUpdate = async (updates) => {
    setIsSaving(true);
    try {
      const success = await handleSave({
        ...profileData,
        ...updates,
        updated_at: new Date().toISOString(),
      });

      if (success) {
        toast.success("Settings updated successfully");
      }
    } catch (error) {
      toast.error("Failed to update settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      // Delete profile data
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .match({ id: user.id });

      if (profileError) throw profileError;

      // Delete user account
      const { error: authError } = await supabase.auth.admin.deleteUser(
        user.id
      );
      if (authError) throw authError;

      toast.success("Account deleted successfully");
      router.push("/");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Settings</h1>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="w-5 h-5" />
            <CardTitle>Profile Information</CardTitle>
          </div>
          <CardDescription>
            Update your personal information and public profile details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input
              id="name"
              value={profileData.name}
              onChange={(e) => handleProfileUpdate({ name: e.target.value })}
              placeholder="Your name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Professional Title</Label>
            <Input
              id="title"
              value={profileData.title}
              onChange={(e) => handleProfileUpdate({ title: e.target.value })}
              placeholder="e.g. Digital Creator | Developer"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <textarea
              id="bio"
              value={profileData.bio}
              onChange={(e) => handleProfileUpdate({ bio: e.target.value })}
              className="w-full min-h-[100px] p-2 border rounded-md"
              placeholder="Tell visitors about yourself..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={profileData.location}
              onChange={(e) =>
                handleProfileUpdate({ location: e.target.value })
              }
              placeholder="e.g. New York, NY"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            <CardTitle>Visibility Settings</CardTitle>
          </div>
          <CardDescription>
            Control what information is visible on your public profile
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Profile Visibility</Label>
              <div className="text-sm text-gray-500">
                Make your profile visible to the public
              </div>
            </div>
            <Switch
              checked={profileData.is_public}
              onCheckedChange={(checked) =>
                handleProfileUpdate({ is_public: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Location</Label>
              <div className="text-sm text-gray-500">
                Display your location on your profile
              </div>
            </div>
            <Switch
              checked={profileData.show_location}
              onCheckedChange={(checked) =>
                handleProfileUpdate({ show_location: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Availability Status</Label>
              <div className="text-sm text-gray-500">
                Show if you're available for work
              </div>
            </div>
            <Switch
              checked={profileData.availability}
              onCheckedChange={(checked) =>
                handleProfileUpdate({ availability: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            <CardTitle>Email Preferences</CardTitle>
          </div>
          <CardDescription>
            Manage your email notifications and updates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Marketing Emails</Label>
              <div className="text-sm text-gray-500">
                Receive updates about new features and announcements
              </div>
            </div>
            <Switch
              checked={profileData.marketing_emails}
              onCheckedChange={(checked) =>
                handleProfileUpdate({ marketing_emails: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Analytics Reports</Label>
              <div className="text-sm text-gray-500">
                Get weekly reports about your profile performance
              </div>
            </div>
            <Switch
              checked={profileData.analytics_emails}
              onCheckedChange={(checked) =>
                handleProfileUpdate({ analytics_emails: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-500" />
            <CardTitle>Danger Zone</CardTitle>
          </div>
          <CardDescription>
            Permanent actions that cannot be undone
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Delete Account</h3>
              <p className="text-sm text-gray-500">
                Permanently delete your account and all associated data. This
                action cannot be undone.
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Account"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
