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

// Import UI components
import { StatsCard } from "./StatsCard";
import { LinkForm } from "./dashboard/LinkForm";
import { SubtitleEditor } from "./dashboard/SubtitleEditor";
import { ProfilePreview } from "./dashboard/ProfilePreview";
import { LinksList } from "./dashboard/LinksList";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

// Social icons mapping
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
  const [subtitles, setSubtitles] = useState([{ id: 1, text: "SOCIALS:" }]);
  const [editingLink, setEditingLink] = useState(null);
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    username: "",
    icon: "website",
    url: "",
  });

  // Check authentication and fetch links
  useEffect(() => {
    const checkAuthAndFetchLinks = async () => {
      try {
        const {
          data: { session },
          error: authError,
        } = await supabase.auth.getSession();

        if (authError || !session) {
          throw new Error("Authentication error. Please sign in again.");
        }

        await fetchLinks();

        // Subscribe to realtime changes
        const channel = supabase
          .channel("links_changes")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "links" },
            (payload) => {
              console.log("Change received!", payload);
              fetchLinks();
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      } catch (error) {
        console.error("Setup error:", error);
        setError(error.message);
        setIsLoading(false);
      }
    };

    checkAuthAndFetchLinks();
  }, [user?.id]);

  const fetchLinks = async () => {
    try {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from("links")
        .select("*")
        .eq("user_id", user.id)
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

  const handleAddLink = () => {
    setIsAddingLink(true);
    setEditingLink(null);
    setFormData({
      title: "",
      username: "",
      icon: "website",
      url: "",
    });
  };

  const handleEditLink = (link) => {
    setEditingLink(link.id);
    setIsAddingLink(false);
    setFormData({
      title: link.title,
      username: link.username,
      icon: link.icon,
      url: link.url,
    });
  };

  const handleDeleteLink = async (linkId) => {
    try {
      const { error } = await supabase
        .from("links")
        .delete()
        .match({ id: linkId, user_id: user.id });

      if (error) throw error;

      setLinks(links.filter((link) => link.id !== linkId));
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

      if (editingLink) {
        const { error } = await supabase
          .from("links")
          .update({
            title: formData.title,
            username: formData.username,
            icon: formData.icon,
            url: formData.url,
            updated_at: new Date().toISOString(),
          })
          .match({ id: editingLink, user_id: user.id });

        if (error) throw error;
        toast.success("Link updated successfully");
      } else {
        const { error } = await supabase.from("links").insert([
          {
            title: formData.title,
            username: formData.username,
            icon: formData.icon,
            url: formData.url,
            user_id: user.id,
          },
        ]);

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
    setFormData({
      title: "",
      username: "",
      icon: "website",
      url: "",
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
      {/* Quick Stats */}
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
        {/* Links Manager */}
        <div className="lg:col-span-8">
          <Card>
            <div className="space-y-6 p-6">
              {/* Subtitle Editor */}
              <SubtitleEditor
                subtitles={subtitles}
                setSubtitles={setSubtitles}
              />

              {error && (
                <div className="bg-red-50 text-red-500 p-3 rounded-md">
                  {error}
                </div>
              )}

              {/* Add New Link Button */}
              {!isAddingLink && !editingLink && (
                <Button
                  onClick={handleAddLink}
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add New Link
                </Button>
              )}

              {/* Link Form */}
              {(isAddingLink || editingLink) && (
                <LinkForm
                  formData={formData}
                  setFormData={setFormData}
                  handleSubmit={handleSubmitLink}
                  handleCancel={handleCancelEdit}
                  editingLink={editingLink}
                />
              )}

              {/* Links List */}
              {!isAddingLink && !editingLink && links.length > 0 && (
                <LinksList
                  links={links}
                  onEdit={handleEditLink}
                  onDelete={handleDeleteLink}
                  getLinkIcon={getLinkIcon}
                />
              )}
            </div>
          </Card>
        </div>

        {/* Profile Preview */}
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
