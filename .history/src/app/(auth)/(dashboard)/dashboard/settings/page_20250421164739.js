"use client";

import { useState, useCallback, useMemo } from "react";
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
import { Briefcase, Globe, Mail, Shield, User } from "lucide-react";
import useProfile from "@/app/hooks/useProfile";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsPage({ user }) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { profileData, isLoading, handleSave } = useProfile(user);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [localProfile, setLocalProfile] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize local state once profile data is loaded
  useMemo(() => {
    if (!isLoading && profileData) {
      setLocalProfile(profileData);
    }
  }, [isLoading, profileData]);

  // Handle input changes
  const handleInputChange = useCallback((field, value) => {
    setLocalProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
    setHasChanges(true);
  }, []);

  // Save all changes at once
  const saveAllChanges = useCallback(async () => {
    setIsSaving(true);
    try {
      const success = await handleSave({
        ...localProfile,
        updated_at: new Date().toISOString(),
      });

      if (success) {
        toast.success("Settings updated successfully");
        setHasChanges(false);
      }
    } catch (error) {
      toast.error("Failed to update settings");
    } finally {
      setIsSaving(false);
    }
  }, [localProfile, handleSave]);

  // Handle account deletion
  const handleDeleteAccount = useCallback(async () => {
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
      toast.error("Failed to delete account: " + error.message);
    } finally {
      setIsDeleting(false);
    }
  }, [user?.id, supabase, router]);

  if (isLoading) {
    return <SettingsPageSkeleton />;
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
        {hasChanges && (
          <Button onClick={saveAllChanges} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save All Changes"}
          </Button>
        )}
      </div>

      <ProfileInfoCard
        profileData={localProfile}
        onChange={handleInputChange}
      />

      <VisibilityCard profileData={localProfile} onChange={handleInputChange} />

      <EmailPreferencesCard
        profileData={localProfile}
        onChange={handleInputChange}
      />

      <DangerZoneCard
        isDeleting={isDeleting}
        onDeleteAccount={handleDeleteAccount}
      />
    </div>
  );
}

// Extracted components for better organization and potential code-splitting
function ProfileInfoCard({ profileData, onChange }) {
  return (
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
            value={profileData.name || ""}
            onChange={(e) => onChange("name", e.target.value)}
            placeholder="Your name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Professional Title</Label>
          <Input
            id="title"
            value={profileData.title || ""}
            onChange={(e) => onChange("title", e.target.value)}
            placeholder="e.g. Digital Creator | Developer"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <textarea
            id="bio"
            value={profileData.bio || ""}
            onChange={(e) => onChange("bio", e.target.value)}
            className="w-full min-h-[100px] p-2 border rounded-md"
            placeholder="Tell visitors about yourself..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={profileData.location || ""}
            onChange={(e) => onChange("location", e.target.value)}
            placeholder="e.g. New York, NY"
          />
        </div>
      </CardContent>
    </Card>
  );
}

function VisibilityCard({ profileData, onChange }) {
  return (
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
            checked={!!profileData.is_public}
            onCheckedChange={(checked) => onChange("is_public", checked)}
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
            checked={!!profileData.show_location}
            onCheckedChange={(checked) => onChange("show_location", checked)}
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
            checked={!!profileData.availability}
            onCheckedChange={(checked) => onChange("availability", checked)}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function EmailPreferencesCard({ profileData, onChange }) {
  return (
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
            checked={!!profileData.marketing_emails}
            onCheckedChange={(checked) => onChange("marketing_emails", checked)}
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
            checked={!!profileData.analytics_emails}
            onCheckedChange={(checked) => onChange("analytics_emails", checked)}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function DangerZoneCard({ isDeleting, onDeleteAccount }) {
  return (
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
            onClick={onDeleteAccount}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Account"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function SettingsPageSkeleton() {
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <Skeleton className="h-10 w-48" />

      {/* Profile Information Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Visibility Settings Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-56" />
              </div>
              <Skeleton className="h-5 w-10 rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Email Preferences Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-44" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-52" />
              </div>
              <Skeleton className="h-5 w-10 rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Danger Zone Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-1">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-3 w-full" />
            </div>
            <Skeleton className="h-10 w-40" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
