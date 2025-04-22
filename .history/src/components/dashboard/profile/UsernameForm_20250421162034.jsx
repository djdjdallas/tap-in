// components/UsernameForm.jsx
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// Username validation regex - same as in your UsernamePage
const USERNAME_REGEX = /^[a-z0-9][a-z0-9-]{2,28}[a-z0-9]$/;

export default function UsernameForm({ currentUsername, userId, onUpdate }) {
  const [username, setUsername] = useState(currentUsername || "");
  const [isAvailable, setIsAvailable] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClientComponentClient();

  // Initialize with current username when it becomes available
  useEffect(() => {
    if (currentUsername) {
      setUsername(currentUsername);
    }
  }, [currentUsername]);

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
    if (!userId) {
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
      if (value === currentUsername) {
        setIsAvailable(true);
        setError("");
        return true;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", value)
        .neq("id", userId)
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
    if (!userId) {
      toast.error("Please sign in to save username");
      return;
    }

    setIsChecking(true);
    setError("");

    try {
      // Final validation check
      const validationError = validateUsername(username);
      if (validationError) {
        setError(validationError);
        setIsChecking(false);
        return;
      }

      const available = await checkUsernameAvailability(username);
      if (!available) {
        setIsChecking(false);
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          username,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) throw error;

      toast.success("Username updated successfully!");
      onUpdate?.(username);
    } catch (error) {
      console.error("Error updating username:", error);
      setError(error.message || "Failed to update username");
      toast.error("Failed to update username");
    } finally {
      setIsChecking(false);
    }
  };

  return (
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
            disabled={isChecking}
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
        disabled={isChecking || !isAvailable || !username}
        className="w-full"
      >
        {isChecking ? "Saving..." : "Save Username"}
      </Button>
    </form>
  );
}
