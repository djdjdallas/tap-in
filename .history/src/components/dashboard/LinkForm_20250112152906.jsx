"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
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

export const LinkForm = ({
  user,
  onSuccess,
  editingLinkId = null,
  formData,
  setFormData,
  handleSubmit,
  handleCancel,
}) => {
  const supabase = createClientComponentClient();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      console.error("No user provided to LinkForm");
      return;
    }

    if (editingLinkId) {
      fetchLinkData();
    }
  }, [user, editingLinkId]);

  const fetchLinkData = async () => {
    if (!user?.id || !editingLinkId) return;

    setIsLoading(true);
    try {
      console.log("Fetching link data for:", {
        userId: user.id,
        editingLinkId,
      });

      const { data, error } = await supabase
        .from("links")
        .select("*")
        .eq("id", editingLinkId)
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error fetching link:", error);
        toast.error("Failed to load link data");
        throw error;
      }

      if (data) {
        setFormData({
          title: data.title,
          username: data.username || "",
          icon: data.icon || "website",
          url: data.url,
          order_index: data.order_index || 0,
          subtitle_id: data.subtitle_id,
        });
        console.log("Link data loaded successfully:", data);
      }
    } catch (error) {
      console.error("Error in fetchLinkData:", error);
      toast.error("Failed to load link data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUrlChange = (e) => {
    let url = e.target.value;

    if (url && !url.match(/^https?:\/\/|mailto:/i)) {
      if (formData.icon === "email") {
        url = `mailto:${url}`;
      } else {
        url = `https://${url}`;
      }
    }

    setFormData({ ...formData, url });
  };

  const formatUrlForDisplay = (url) => {
    return url?.replace(/^(https?:\/\/|mailto:)/i, "") || "";
  };

  if (!user?.id) {
    return (
      <Card className="p-4">
        <div className="text-center text-gray-500">
          Please log in to manage links
        </div>
      </Card>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 bg-gray-50 rounded-lg"
    >
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Platform
        </label>
        <Input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g. Twitter, GitHub"
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Username (optional)
        </label>
        <Input
          type="text"
          value={formData.username}
          onChange={(e) =>
            setFormData({ ...formData, username: e.target.value })
          }
          placeholder="@username"
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">URL</label>
        <div className="relative">
          <Input
            type="text"
            value={formatUrlForDisplay(formData.url)}
            onChange={handleUrlChange}
            placeholder={
              formData.icon === "email"
                ? "example@email.com"
                : "www.example.com"
            }
            className="pl-8"
            required
            disabled={isLoading}
          />
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
            {formData.icon === "email"
              ? "@"
              : formData.url?.startsWith("https://")
              ? "https://"
              : ""}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Icon (optional)
        </label>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(socialIcons).map(([name, Icon]) => (
            <Button
              key={name}
              type="button"
              variant={formData.icon === name ? "default" : "outline"}
              className={`p-3 flex items-center justify-center gap-2 ${
                formData.icon === name
                  ? "bg-blue-50 border-blue-500 text-blue-500"
                  : ""
              }`}
              onClick={() => {
                setFormData({
                  ...formData,
                  icon: name,
                  url: "", // Clear URL when switching between email and web links
                });
              }}
              disabled={isLoading}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm capitalize">{name}</span>
            </Button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1" disabled={isLoading}>
          {isLoading
            ? "Saving..."
            : editingLinkId
            ? "Save Changes"
            : "Add Link"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default LinkForm;
