"use client";
import { useState, useEffect } from "react";
import useProfile from "@/app/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "sonner";

export default function UsernamePage({ user }) {
  const supabase = createClientComponentClient();
  const { profileData, handleSave } = useProfile(user);
  const [username, setUsername] = useState(profileData?.username || "");
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    // Update username state when profileData changes
    if (profileData?.username) {
      setUsername(profileData.username);
    }
  }, [profileData?.username]);

  const checkUsernameAvailability = async (value) => {
    try {
      if (!value) {
        setIsAvailable(false);
        setError("Username is required");
        return false;
      }

      // Check if username follows pattern
      if (!/^[a-z0-9-]+$/.test(value)) {
        setIsAvailable(false);
        setError(
          "Username can only contain lowercase letters, numbers, and hyphens"
        );
        return false;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", value)
        .neq("id", user.id) // Exclude current user
        .maybeSingle();

      if (error) throw error;

      const available = !data;
      setIsAvailable(available);
      setError(available ? "" : "Username is already taken");
      return available;
    } catch (error) {
      console.error("Error checking username:", error);
      setError("Error checking username availability");
      return false;
    }
  };

  const handleUsernameChange = async (e) => {
    const value = e.target.value.toLowerCase();
    setUsername(value);
    setIsChecking(true);
    await checkUsernameAvailability(value);
    setIsChecking(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsChecking(true);
    setError("");

    try {
      // Final availability check before saving
      const available = await checkUsernameAvailability(username);
      if (!available) {
        setIsChecking(false);
        return;
      }

      console.log("Saving username:", username); // Debug log

      const success = await handleSave({
        username,
        updated_at: new Date().toISOString(),
      });

      if (success) {
        toast.success("Username updated successfully!");
      } else {
        throw new Error("Failed to update username");
      }
    } catch (error) {
      console.error("Username update error:", error);
      setError(error.message || "Failed to update username");
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
          <CardDescription>
            Pick a unique username for your public profile
          </CardDescription>
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
                  onChange={handleUsernameChange}
                  className="pl-20"
                  placeholder="your-username"
                  pattern="^[a-z0-9-]+$"
                  title="Only lowercase letters, numbers, and hyphens allowed"
                  required
                  disabled={isChecking}
                />
              </div>

              {/* Username feedback */}
              {username && (
                <p
                  className={`text-sm ${
                    error
                      ? "text-red-500"
                      : isAvailable
                      ? "text-green-500"
                      : "text-gray-500"
                  }`}
                >
                  {error
                    ? error
                    : isAvailable
                    ? "✓ Username is available"
                    : "Checking availability..."}
                </p>
              )}

              <p className="text-sm text-gray-500">
                Your public profile will be available at tap-in.io/
                {username || "username"}
              </p>
            </div>

            <Button
              type="submit"
              disabled={isChecking || !isAvailable || !username}
              className="w-full"
            >
              {isChecking ? "Saving..." : "Save Username"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
