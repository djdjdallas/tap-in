"use client";
// app/(auth)/dashboard/links/page.js
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LinksList } from "@/components/LinksList";
import { LinkForm } from "@/components/LinkForm";
import { SubtitleEditor } from "@/components/SubtitleEditor";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import useProfile from "@/app/hooks/useProfile";

export default function LinksPage({ user }) {
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [currentSubtitleId, setCurrentSubtitleId] = useState(null);
  const { profileData, isLoading } = useProfile(user);

  const handleAddLink = (subtitleId) => {
    setIsAddingLink(true);
    setEditingLink(null);
    setCurrentSubtitleId(subtitleId);
  };

  const handleEditLink = (link) => {
    setEditingLink(link);
    setIsAddingLink(false);
    setCurrentSubtitleId(link.subtitle_id);
  };

  const handleCancelEdit = () => {
    setEditingLink(null);
    setIsAddingLink(false);
    setCurrentSubtitleId(null);
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
      <h1 className="text-3xl font-bold">Manage Links</h1>

      <Card>
        <CardHeader>
          <CardTitle>Section Headers</CardTitle>
        </CardHeader>
        <CardContent>
          <SubtitleEditor user={user} subtitles={profileData.subtitles} />
        </CardContent>
      </Card>

      {profileData.subtitles.map((subtitle) => (
        <Card key={subtitle.id}>
          <CardHeader>
            <CardTitle>{subtitle.text}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <LinksList
              links={profileData.links.filter(
                (link) => link.subtitle_id === subtitle.id
              )}
              onEdit={handleEditLink}
            />

            {!isAddingLink && !editingLink && (
              <Button
                onClick={() => handleAddLink(subtitle.id)}
                variant="outline"
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Link to {subtitle.text}
              </Button>
            )}

            {(isAddingLink || editingLink) &&
              currentSubtitleId === subtitle.id && (
                <LinkForm
                  user={user}
                  editingLinkId={editingLink?.id}
                  subtitle={subtitle}
                  onCancel={handleCancelEdit}
                />
              )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
