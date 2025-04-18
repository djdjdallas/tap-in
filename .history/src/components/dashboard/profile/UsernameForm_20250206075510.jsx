// components/UsernameForm.jsx
import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function UsernameForm({ currentUsername, onUpdate }) {
  const [username, setUsername] = useState(currentUsername || "");
  const [isAvailable, setIsAvailable] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const supabase = createClientComponentClient();

  const checkUsername = async (value) => {
    if (!value || value === currentUsername) {
      setIsAvailable(true);
      return;
    }

    setIsChecking(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("username")
      .eq("username", value)
      .single();

    setIsAvailable(!data);
    setIsChecking(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !isAvailable || isChecking) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ username })
        .eq("id", (await supabase.auth.getUser()).data.user.id);

      if (error) throw error;

      toast.success("Username updated successfully!");
      onUpdate?.(username);
    } catch (error) {
      console.error("Error updating username:", error);
      toast.error("Failed to update username. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Choose your username</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type="text"
              value={username}
              onChange={(e) => {
                const value = e.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9-_]/g, "");
                setUsername(value);
                checkUsername(value);
              }}
              placeholder="your-username"
              className="pl-8"
              pattern="^[a-z0-9-_]{3,30}$"
              required
              minLength={3}
              maxLength={30}
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              @
            </span>
          </div>
          <Button type="submit" disabled={!isAvailable || isChecking}>
            Save
          </Button>
        </div>
      </div>

      {username && (
        <div className="text-sm">
          {isChecking ? (
            <span className="text-gray-500">Checking availability...</span>
          ) : isAvailable ? (
            <span className="text-green-600">✓ {username} is available</span>
          ) : (
            <span className="text-red-600">× Username is already taken</span>
          )}
        </div>
      )}

      <div className="text-sm text-gray-500">
        Your profile will be available at:
        <br />
        <code className="text-gray-700">
          tap-in.io/{username || "username"}
        </code>
      </div>
    </form>
  );
}
