"use client";

import { Edit2, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const SubtitleEditor = ({ user }) => {
  const supabase = createClientComponentClient();
  const [isEditing, setIsEditing] = useState(null);
  const [newSubtitle, setNewSubtitle] = useState("");
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [subtitles, setSubtitles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      console.log("No user ID available");
      setIsLoading(false);
      return;
    }

    console.log("Fetching subtitles for user:", user.id);
    fetchSubtitles();

    // Set up realtime subscription
    const channel = supabase
      .channel("subtitles_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "subtitles",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("Realtime change received:", payload);
          fetchSubtitles();
        }
      )
      .subscribe();

    return () => {
      console.log("Cleaning up subscription");
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const fetchSubtitles = async () => {
    console.log("Starting fetchSubtitles");

    try {
      console.log("Querying subtitles for user_id:", user.id);

      const { data, error } = await supabase
        .from("subtitles")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      console.log("Supabase response:", { data, error });

      if (error) {
        console.error("Supabase error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        toast.error(`Failed to load subtitles: ${error.message}`);
        throw error;
      }

      setSubtitles(data || []);
      console.log("Subtitles updated successfully:", data);
    } catch (error) {
      console.error("Error in fetchSubtitles:", error);
      toast.error("Failed to load subtitles. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSubtitle = async () => {
    if (!newSubtitle.trim()) return;

    try {
      const { data, error } = await supabase
        .from("subtitles")
        .insert([
          {
            text: newSubtitle.trim(),
            user_id: user.id,
          },
        ])
        .select();

      if (error) {
        console.error("Error adding subtitle:", error);
        toast.error("Failed to add subtitle");
        throw error;
      }

      console.log("Added subtitle:", data);
      setSubtitles([...subtitles, ...data]);
      setNewSubtitle("");
      setIsAddingNew(false);
      toast.success("Subtitle added successfully");
    } catch (error) {
      console.error("Error in handleAddSubtitle:", error);
      toast.error("Failed to add subtitle. Please try again.");
    }
  };

  const handleUpdateSubtitle = async (id, newText) => {
    try {
      console.log("Updating subtitle:", { id, newText });
      const { error } = await supabase
        .from("subtitles")
        .update({ text: newText })
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error updating subtitle:", error);
        toast.error("Failed to update subtitle");
        throw error;
      }

      setSubtitles(
        subtitles.map((sub) =>
          sub.id === id ? { ...sub, text: newText } : sub
        )
      );
      setIsEditing(null);
      toast.success("Subtitle updated successfully");
    } catch (error) {
      console.error("Error in handleUpdateSubtitle:", error);
      toast.error("Failed to update subtitle. Please try again.");
    }
  };

  const handleDeleteSubtitle = async (id) => {
    try {
      console.log("Deleting subtitle:", id);
      const { error } = await supabase
        .from("subtitles")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) {
        console.error("Error deleting subtitle:", error);
        toast.error("Failed to delete subtitle");
        throw error;
      }

      setSubtitles(subtitles.filter((sub) => sub.id !== id));
      toast.success("Subtitle deleted successfully");
    } catch (error) {
      console.error("Error in handleDeleteSubtitle:", error);
      toast.error("Failed to delete subtitle. Please try again.");
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-4">Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Section Headers</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {subtitles.map((subtitle) => (
          <div key={subtitle.id} className="flex items-center gap-2">
            {isEditing === subtitle.id ? (
              <>
                <Input
                  type="text"
                  value={subtitle.text}
                  onChange={(e) => {
                    const newText = e.target.value;
                    setSubtitles(
                      subtitles.map((sub) =>
                        sub.id === subtitle.id ? { ...sub, text: newText } : sub
                      )
                    );
                  }}
                  onBlur={() =>
                    handleUpdateSubtitle(subtitle.id, subtitle.text)
                  }
                  className="flex-1"
                />
                <Button
                  onClick={() =>
                    handleUpdateSubtitle(subtitle.id, subtitle.text)
                  }
                  variant="default"
                >
                  Save
                </Button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-medium flex-1">{subtitle.text}</h3>
                <Button
                  onClick={() => setIsEditing(subtitle.id)}
                  variant="ghost"
                  size="icon"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => handleDeleteSubtitle(subtitle.id)}
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        ))}

        {isAddingNew ? (
          <div className="flex items-center gap-2">
            <Input
              type="text"
              value={newSubtitle}
              onChange={(e) => setNewSubtitle(e.target.value)}
              placeholder="Enter new section header"
              className="flex-1"
            />
            <Button onClick={handleAddSubtitle} variant="default">
              Add
            </Button>
            <Button
              onClick={() => {
                setIsAddingNew(false);
                setNewSubtitle("");
              }}
              variant="ghost"
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => setIsAddingNew(true)}
            variant="ghost"
            className="text-blue-500 hover:text-blue-700"
          >
            + Add New Section Header
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default SubtitleEditor;
