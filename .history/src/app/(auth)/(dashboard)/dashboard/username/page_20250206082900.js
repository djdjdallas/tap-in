// app/(auth)/dashboard/username/page.js
"use client";
import { useState } from "react";
import useProfile from "@/app/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export default function UsernamePage({ user }) {
  const { profileData, handleSave } = useProfile(user);
  const [username, setUsername] = useState(profileData?.username || "");
  const [isChecking, setIsChecking] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsChecking(true);

    try {
      const success = await handleSave({ username });
      if (success) {
        toast.success("Username updated successfully!");
      }
    } catch (error) {
      toast.error("Failed to update username");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <CardTitle>Choose Your Username</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Profile URL</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  tap-in.io/
                </span>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  className="pl-20"
                  placeholder="your-username"
                  pattern="^[a-z0-9-]+$"
                  title="Only lowercase letters, numbers, and hyphens allowed"
                  required
                />
              </div>
              <p className="text-sm text-gray-500">
                Your public profile will be available at tap-in.io/
                {username || "username"}
              </p>
            </div>

            <Button type="submit" disabled={isChecking}>
              {isChecking ? "Saving..." : "Save Username"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
