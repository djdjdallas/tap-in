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
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// Username validation regex
const USERNAME_REGEX = /^[a-z0-9][a-z0-9-]{2,28}[a-z0-9]$/;

export default function UsernamePage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const {
    profileData,
    handleSave,
    isLoading: profileLoading,
  } = useProfile(user);
  const [username, setUsername] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch user on mount
  useEffect(() => {
    const getUser = async () => {
      try {
        setLoading(true);
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        if (error) throw error;
        if (!user) {
          router.push("/login");
          return;
        }
        setUser(user);
      } catch (error) {
        console.error("Auth error:", error);
        toast.error("Authentication error");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, [router]);

  // Update username state when profile data loads
  useEffect(() => {
    if (profileData?.username) {
      setUsername(profileData.username);
    }
  }, [profileData?.username]);

  const validateUsername = (value) => {
    if (!value) {
      return "Username is required";
    }

    if (value.length < 3) {
      return "Username must be at least 3 characters";
    }

    if (value.length > 30) {
      return "Username must be less than 30 characters";
    }

    if (!USERNAME_REGEX.test(value)) {
      return "Username must start and end with a letter or number, and can only contain lowercase letters, numbers, and hyphens";
    }

    return "";
  };

  const checkUsernameAvailability = async (value) => {
    if (!user?.id) {
      console.log("No user ID available for username check");
      return false;
    }

    try {
      // First validate format
      const validationError = validateUsername(value);
      if (validationError) {
        setIsAvailable(false);
        setError(validationError);
        return false;
      }

      // If username hasn't changed from current user's username, consider it available
      if (value === profileData?.username) {
        setIsAvailable(true);
        setError("");
        return true;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", value)
        .neq("id", user.id)
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
    const value = e.target.value.toLowerCase().trim();
    setUsername(value);

    if (!value) {
      setIsAvailable(false);
      setError("Username is required");
      return;
    }

    setIsChecking(true);
    await checkUsernameAvailability(value);
    setIsChecking(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id) {
      toast.error("Please sign in to save username");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      // Final validation check
      const validationError = validateUsername(username);
      if (validationError) {
        setError(validationError);
        setIsSaving(false);
        return;
      }

      const available = await checkUsernameAvailability(username);
      if (!available) {
        setIsSaving(false);
        return;
      }

      const success = await handleSave({
        username,
        updated_at: new Date().toISOString(),
      });

      if (success) {
        toast.success("Username updated successfully!");
        // Redirect to dashboard after successful update
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } else {
        throw new Error("Failed to update username");
      }
    } catch (error) {
      console.error("Username update error:", error);
      setError(error.message || "Failed to update username");
      toast.error("Failed to update username");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || profileLoading) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
              <p className="text-sm text-gray-500">Loading...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <CardTitle>Choose Your Username</CardTitle>
          <CardDescription>
            Your username must be between 3-30 characters, start and end with a
            letter or number, and can only contain lowercase letters, numbers,
            and hyphens.
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
                  required
                  disabled={isChecking || isSaving}
                />
              </div>

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
              disabled={isChecking || !isAvailable || !username || isSaving}
              className="w-full"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Username"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
