// utils/socialIcons.js
import {
  Twitter,
  Instagram,
  Github,
  Globe,
  Youtube,
  Linkedin,
  Facebook,
  Mail,
  Music,
  Video,
  Link2,
  BookOpen,
  Twitch,
  MessageCircle,
  AtSign,
  Phone,
  MapPin,
  Calendar,
  Rss,
  Share2,
  Gift,
  ShoppingBag,
  DollarSign,
  HeartHandshake,
} from "lucide-react";

// Main social icons object
export const socialIcons = {
  twitter: {
    icon: Twitter,
    color: "text-blue-400",
    backgroundColor: "bg-blue-50",
  },
  instagram: {
    icon: Instagram,
    color: "text-pink-500",
    backgroundColor: "bg-pink-50",
  },
  github: {
    icon: Github,
    color: "text-gray-700",
    backgroundColor: "bg-gray-50",
  },
  linkedin: {
    icon: Linkedin,
    color: "text-blue-600",
    backgroundColor: "bg-blue-50",
  },
  youtube: {
    icon: Youtube,
    color: "text-red-500",
    backgroundColor: "bg-red-50",
  },
  facebook: {
    icon: Facebook,
    color: "text-blue-600",
    backgroundColor: "bg-blue-50",
  },
  website: {
    icon: Globe,
    color: "text-gray-500",
    backgroundColor: "bg-gray-50",
  },
  email: {
    icon: Mail,
    color: "text-gray-600",
    backgroundColor: "bg-gray-50",
  },
  music: {
    icon: Music,
    color: "text-purple-500",
    backgroundColor: "bg-purple-50",
  },
  video: {
    icon: Video,
    color: "text-blue-500",
    backgroundColor: "bg-blue-50",
  },
  blog: {
    icon: BookOpen,
    color: "text-emerald-600",
    backgroundColor: "bg-emerald-50",
  },
  twitch: {
    icon: Twitch,
    color: "text-purple-600",
    backgroundColor: "bg-purple-50",
  },
  discord: {
    icon: MessageCircle,
    color: "text-indigo-500",
    backgroundColor: "bg-indigo-50",
  },
  contact: {
    icon: AtSign,
    color: "text-blue-500",
    backgroundColor: "bg-blue-50",
  },
  phone: {
    icon: Phone,
    color: "text-green-500",
    backgroundColor: "bg-green-50",
  },
  location: {
    icon: MapPin,
    color: "text-red-500",
    backgroundColor: "bg-red-50",
  },
  calendar: {
    icon: Calendar,
    color: "text-orange-500",
    backgroundColor: "bg-orange-50",
  },
  rss: {
    icon: Rss,
    color: "text-orange-500",
    backgroundColor: "bg-orange-50",
  },
  share: {
    icon: Share2,
    color: "text-blue-500",
    backgroundColor: "bg-blue-50",
  },
  store: {
    icon: ShoppingBag,
    color: "text-purple-500",
    backgroundColor: "bg-purple-50",
  },
  donate: {
    icon: Gift,
    color: "text-red-500",
    backgroundColor: "bg-red-50",
  },
  payment: {
    icon: DollarSign,
    color: "text-green-500",
    backgroundColor: "bg-green-50",
  },
  support: {
    icon: HeartHandshake,
    color: "text-pink-500",
    backgroundColor: "bg-pink-50",
  },
  custom: {
    icon: Link2,
    color: "text-gray-500",
    backgroundColor: "bg-gray-50",
  },
};

// Helper function to get icon component
export const getIconByName = (name) => {
  const iconConfig = socialIcons[name.toLowerCase()] || socialIcons.custom;
  return iconConfig.icon;
};

// Helper function to get icon colors
export const getIconColors = (name) => {
  const iconConfig = socialIcons[name.toLowerCase()] || socialIcons.custom;
  return {
    textColor: iconConfig.color,
    bgColor: iconConfig.backgroundColor,
  };
};

// Helper function to get all available icon names
export const getAvailableIcons = () => {
  return Object.keys(socialIcons);
};

// Helper function to render icon with default styling
export const renderIcon = (name, className = "w-5 h-5") => {
  const IconComponent = getIconByName(name);
  const { textColor, bgColor } = getIconColors(name);

  return (
    <div className={`p-2 rounded-lg ${bgColor}`}>
      <IconComponent className={`${className} ${textColor}`} />
    </div>
  );
};

// Categories for grouping icons
export const iconCategories = {
  social: [
    "twitter",
    "instagram",
    "facebook",
    "linkedin",
    "github",
    "youtube",
    "twitch",
    "discord",
  ],
  content: ["blog", "music", "video", "rss"],
  contact: ["email", "phone", "location", "contact"],
  business: ["website", "store", "payment", "donate", "support"],
  other: ["calendar", "share", "custom"],
};

// Helper function to get icons by category
export const getIconsByCategory = (category) => {
  return iconCategories[category] || [];
};

// Helper function to identify icon category
export const getIconCategory = (iconName) => {
  return (
    Object.entries(iconCategories).find(([_, icons]) =>
      icons.includes(iconName.toLowerCase())
    )?.[0] || "other"
  );
};
