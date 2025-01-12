"use client";

import React, { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Settings,
  Users,
  Activity,
  Plus,
  Globe,
  Twitter,
  Github,
  Linkedin,
  Instagram,
  Youtube,
  Mail,
  Link as LinkIcon,
  Facebook,
} from "lucide-react";
import { StatsCard } from "./StatsCard";
import { LinkForm } from "./dashboard/LinkForm";
import { SubtitleEditor } from "./dashboard/SubtitleEditor";
import { ProfilePreview } from "./dashboard/ProfilePreview";
import { SubtitleSection } from "./dashboard/SubtitleSection";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export const socialIcons = {
  website: Globe,
  twitter: Twitter,
  github: Github,
  linkedin: Linkedin,
  instagram: Instagram,
  youtube: Youtube,
  facebook: Facebook,
  email: Mail,
  link: LinkIcon,
};

export default function AdminDashboard({ user }) {
  const supabase = createClientComponentClient();
  const [links, setLinks] = useState([]);
  const [subtitles, setSubtitles] = useState([]);
  const [editingLink, setEditingLink] = useState(null);
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSubtitleId, setCurrentSubtitleId] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    username: "",
    icon: "website",
    url: "",
    order_index: 0,
    subtitle_id: null,
  });

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      try {
        const {
          data: { session },
          error: authError,
        } = await supabase.auth.getSession();

        if (authError || !session) {
          throw new Error("Authentication error. Please sign in again.");
        }

        await Promise.all([fetchLinks(), fetchSubtitles()]);

        // Subscribe to realtime changes
        const linksChannel = supabase
          .channel("links_changes")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "links" },
            (payload) => {
              console.log("Links change received!", payload);
              fetchLinks();
            }
          )
          .subscribe();

        const subtitlesChannel = supabase
          .channel("subtitles_changes")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "subtitles" },
            (payload) => {
              console.log("Subtitles change received!", payload);
              fetchSubtitles();
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(linksChannel);
          supabase.removeChannel(subtitlesChannel);
        };
      } catch (error) {
        console.error("Setup error:", error);
        setError(error.message);
        setIsLoading(false);
      }
    };

    checkAuthAndFetchData();
  }, [user?.id]);

  const fetchLinks = async () => {
    try {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from("links")
        .select("*")
        .eq("user_id", user.id)
        .order("order_index", { ascending: true })
        .order("created_at", { ascending: true });

      if (error) throw error;

      console.log("Fetched links:", data); // Debug log
      setLinks(data || []);
      setIsLoading(false);
      setError(null);
    } catch (error) {
      console.error("Error fetching links:", error);
      setError(error.message);
      setIsLoading(false);
    }
  };

  const fetchSubtitles = async () => {
    try {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from("subtitles")
        .select("*")
        .eq("user_id", user.id)
        .order("order_index", { ascending: true });

      if (error) throw error;

      console.log("Fetched subtitles:", data); // Debug log
      setSubtitles(data || []);
    } catch (error) {
      console.error("Error fetching subtitles:", error);
      toast.error("Failed to load sections");
    }
  };

  const handleAddLink = (subtitleId) => {
    setIsAddingLink(true);
    setEditingLink(null);
    setCurrentSubtitleId(subtitleId);
    setFormData({
      title: "",
      username: "",
      icon: "website",
      url: "",
      subtitle_id: subtitleId,
      order_index: links.filter((l) => l.subtitle_id === subtitleId).length,
    });
  };

  const handleEditLink = (link) => {
    setEditingLink(link.id);
    setIsAddingLink(false);
    setCurrentSubtitleId(link.subtitle_id);
    setFormData({
      title: link.title,
      username: link.username || "",
      icon: link.icon || "website",
      url: link.url,
      subtitle_id: link.subtitle_id,
      order_index: link.order_index,
    });
  };

  const handleDeleteLink = async (linkId) => {
    try {
      const { error } = await supabase
        .from("links")
        .delete()
        .match({ id: linkId, user_id: user.id });

      if (error) throw error;

      // Reorder remaining links
      const remainingLinks = links.filter(
        (link) => link.id !== linkId && link.subtitle_id === currentSubtitleId
      );
      const updates = remainingLinks.map((link, index) => ({
        id: link.id,
        order_index: index,
      }));

      if (updates.length > 0) {
        const { error: updateError } = await supabase
          .from("links")
          .upsert(updates);

        if (updateError) throw updateError;
      }

      await fetchLinks();
      toast.success("Link deleted successfully");
    } catch (error) {
      console.error("Error deleting link:", error);
      setError(error.message);
      toast.error("Failed to delete link");
    }
  };

  const handleSubmitLink = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      if (!user?.id) {
        throw new Error("Please sign in to manage links");
      }

      if (!formData.subtitle_id) {
        throw new Error("Please select a section for this link");
      }

      const linkData = {
        title: formData.title,
        username: formData.username || null,
        icon: formData.icon || "website",
        url: formData.url,
        user_id: user.id,
        subtitle_id: formData.subtitle_id,
        order_index: formData.order_index,
      };

      if (editingLink) {
        const { error } = await supabase
          .from("links")
          .update(linkData)
          .match({ id: editingLink, user_id: user.id });

        if (error) throw error;
        toast.success("Link updated successfully");
      } else {
        const { error } = await supabase.from("links").insert([linkData]);

        if (error) throw error;
        toast.success("Link added successfully");
      }

      await fetchLinks();
      setEditingLink(null);
      setIsAddingLink(false);
      setFormData({
        title: "",
        username: "",
        icon: "website",
        url: "",
        order_index: 0,
        subtitle_id: null,
      });
    } catch (error) {
      console.error("Error saving link:", error);
      setError(error.message);
      toast.error(error.message || "Failed to save link");
    }
  };

  const handleCancelEdit = () => {
    setEditingLink(null);
    setIsAddingLink(false);
    setCurrentSubtitleId(null);
    setFormData({
      title: "",
      username: "",
      icon: "website",
      url: "",
      order_index: 0,
      subtitle_id: null,
    });
  };

  const getLinkIcon = (iconName) => {
    const Icon = socialIcons[iconName];
    return Icon ? <Icon className="w-5 h-5" /> : <Globe className="w-5 h-5" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (error && !isAddingLink && !editingLink) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 mb-4">Error: {error}</div>
        <Button onClick={fetchLinks}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Views"
          value="1,234"
          Icon={Activity}
          iconColor="text-blue-500"
        />
        <StatsCard
          title="Click Rate"
          value="23.5%"
          Icon={Users}
          iconColor="text-green-500"
        />
        <StatsCard
          title="Active Links"
          value={`${links.length}/10`}
          Icon={Settings}
          iconColor="text-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <Card>
            <div className="space-y-6 p-6">
              <SubtitleEditor
                user={user}
                subtitles={subtitles}
                setSubtitles={setSubtitles}
              />

              {error && (
                <div className="bg-red-50 text-red-500 p-3 rounded-md">
                  {error}
                </div>
              )}

              <div className="space-y-8">
                {subtitles.map((subtitle) => (
                  <SubtitleSection
                    key={subtitle.id}
                    subtitle={subtitle}
                    links={links}
                    onAddLink={handleAddLink}
                    onEditLink={handleEditLink}
                    onDeleteLink={handleDeleteLink}
                    getLinkIcon={getLinkIcon}
                  />
                ))}
              </div>

              {(isAddingLink || editingLink) && (
                <LinkForm
                  user={user}
                  onSuccess={() => {
                    fetchLinks();
                    setEditingLink(null);
                    setIsAddingLink(false);
                  }}
                  editingLinkId={editingLink}
                  formData={formData}
                  setFormData={setFormData}
                  handleSubmit={handleSubmitLink}
                  handleCancel={handleCancelEdit}
                />
              )}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-4">
          <ProfilePreview
            user={user}
            subtitles={subtitles}
            links={links}
            getLinkIcon={getLinkIcon}
          />
        </div>
      </div>
    </div>
  );
}
