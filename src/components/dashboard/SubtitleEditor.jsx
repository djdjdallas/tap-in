"use client";

import { Edit2, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const SubtitleEditor = ({ user, subtitles, setSubtitles }) => {
  const supabase = createClientComponentClient();
  const [isEditing, setIsEditing] = useState(null);
  const [newSubtitle, setNewSubtitle] = useState("");
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }
    setIsLoading(false);
  }, [user?.id]);

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

      if (error) throw error;

      setSubtitles((prev) => [...prev, ...data]);
      setNewSubtitle("");
      setIsAddingNew(false);
      toast.success("Section added successfully");
    } catch (error) {
      console.error("Error adding section:", error);
      toast.error("Failed to add section");
    }
  };

  const handleUpdateSubtitle = async (id, newText) => {
    try {
      const { error } = await supabase
        .from("subtitles")
        .update({ text: newText })
        .match({ id: id, user_id: user.id });

      if (error) throw error;

      setSubtitles((prev) =>
        prev.map((sub) => (sub.id === id ? { ...sub, text: newText } : sub))
      );
      setIsEditing(null);
      toast.success("Section updated successfully");
    } catch (error) {
      console.error("Error updating section:", error);
      toast.error("Failed to update section");
    }
  };

  const handleDeleteSubtitle = async (id) => {
    try {
      // Delete all associated links first
      const { error: linksError } = await supabase
        .from("links")
        .delete()
        .match({ subtitle_id: id });

      if (linksError) throw linksError;

      // Then delete the subtitle
      const { error: subtitleError } = await supabase
        .from("subtitles")
        .delete()
        .match({ id: id, user_id: user.id });

      if (subtitleError) throw subtitleError;

      setSubtitles((prev) => prev.filter((sub) => sub.id !== id));
      toast.success("Section and associated links deleted successfully");
    } catch (error) {
      console.error("Error deleting section:", error);
      toast.error("Failed to delete section");
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
                    setSubtitles((prev) =>
                      prev.map((sub) =>
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
                  onClick={() => {
                    if (
                      window.confirm(
                        "Are you sure? This will delete all links in this section."
                      )
                    ) {
                      handleDeleteSubtitle(subtitle.id);
                    }
                  }}
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
