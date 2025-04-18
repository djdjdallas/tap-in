"use client";

import React, { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Settings,
  Users,
  Activity,
  Globe,
  Twitter,
  Github,
  Linkedin,
  Instagram,
  Youtube,
  Mail,
  Link as LinkIcon,
  Facebook,
  Plus,
} from "lucide-react";
import useProfile from "@/app/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

// Custom Components
import { StatsCard } from "./StatsCard";
import { LinkForm } from "./dashboard/LinkForm";
import { SubtitleEditor } from "./dashboard/SubtitleEditor";
import { ProfilePreview } from "./dashboard/ProfilePreview";
import { SubtitleSection } from "./dashboard/SubtitleSection";
import { AppearanceCustomizer } from "./dashboard/AppearanceCustomizer";

// Context Provider
import { AnalyticsProvider } from "@/contexts/AnalyticsContext";
import DashboardHeader from "./DashboardHeader";

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
  const [initialProfile, setInitialProfile] = useState(null);
  const [editingLink, setEditingLink] = useState(null);
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSubtitleId, setCurrentSubtitleId] = useState(null);
  const [activeTab, setActiveTab] = useState("links"); // New state for tab navigation
  const { profileData } = useProfile(user);
  const [formData, setFormData] = useState({
    title: "",
    username: "",
    icon: "website",
    url: "",
    order_index: 0,
    subtitle_id: null,
  });

  // Fetch initial profile data
  useEffect(() => {
    const fetchInitialProfile = async () => {
      try {
        if (!user?.id) return;

        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          return;
        }

        setInitialProfile(data);
      } catch (error) {
        console.error("Unexpected error fetching profile:", error);
      }
    };

    fetchInitialProfile();
  }, [user?.id]);

  // Subscribe to profile changes
  useEffect(() => {
    if (!user?.id) return;

    const profileChannel = supabase
      .channel("profile_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          setInitialProfile(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profileChannel);
    };
  }, [user?.id]);

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
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (error && !isAddingLink && !editingLink) {
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <div className="text-red-500 mb-4 text-center font-medium">
          Error: {error}
        </div>
        <Button onClick={fetchLinks} className="w-full">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <AnalyticsProvider user={user}>
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader user={user} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {/* Stats Cards */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatsCard
              title="Total Views"
              metric="views"
              Icon={Activity}
              iconColor="text-blue-500"
            />
            <StatsCard
              title="Click Rate"
              metric="clickRate"
              Icon={Users}
              iconColor="text-green-500"
            />
            <StatsCard
              title="Active Links"
              metric="activeLinks"
              Icon={Settings}
              iconColor="text-orange-500"
            />
          </div>

          {/* Tab Navigation */}
          <div className="mt-10 mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab("links")}
                  className={`${
                    activeTab === "links"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Links & Content
                </button>
                <button
                  onClick={() => setActiveTab("appearance")}
                  className={`${
                    activeTab === "appearance"
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Appearance
                </button>
              </nav>
            </div>
          </div>

          {/* Content Area */}
          {activeTab === "appearance" ? (
            <div className="max-w-2xl mx-auto">
              <AppearanceCustomizer
                user={user}
                initialProfile={initialProfile}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card className="shadow-sm">
                  <div className="p-6 space-y-8">
                    <SubtitleEditor
                      user={user}
                      subtitles={subtitles}
                      setSubtitles={setSubtitles}
                    />

                    {error && (
                      <div className="bg-red-50 text-red-500 p-4 rounded-md">
                        {error}
                      </div>
                    )}

                    {subtitles.length === 0 ? (
                      <div className="text-center py-10 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <h3 className="text-lg font-medium text-gray-600 mb-2">
                          No sections yet
                        </h3>
                        <p className="text-gray-500 mb-4">
                          Add a section to start organizing your links
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
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
                    )}

                    {(isAddingLink || editingLink) && (
                      <div className="mt-6 border-t pt-6">
                        <h3 className="text-lg font-medium mb-4">
                          {editingLink ? "Edit Link" : "Add New Link"}
                        </h3>
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
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              <div className="lg:col-span-1">
                <div className="sticky top-8">
                  <ProfilePreview
                    user={user}
                    subtitles={subtitles}
                    links={links}
                    getLinkIcon={getLinkIcon}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AnalyticsProvider>
  );
}
