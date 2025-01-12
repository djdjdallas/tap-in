// components/LinkContainer.js
import {
  Github,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Globe,
  Youtube,
  Coffee,
} from "lucide-react";
import LinkCard from "./LinkCard";

export default function LinkContainer() {
  const links = [
    {
      category: "Social",
      items: [
        {
          title: "Twitter",
          url: "https://twitter.com/yourusername",
          icon: <Twitter className="w-5 h-5" />,
          color: "hover:text-blue-400",
        },
        {
          title: "Instagram",
          url: "https://instagram.com/yourusername",
          icon: <Instagram className="w-5 h-5" />,
          color: "hover:text-pink-500",
        },
        {
          title: "LinkedIn",
          url: "https://linkedin.com/in/yourusername",
          icon: <Linkedin className="w-5 h-5" />,
          color: "hover:text-blue-600",
        },
      ],
    },
    {
      category: "Work",
      items: [
        {
          title: "GitHub",
          url: "https://github.com/yourusername",
          icon: <Github className="w-5 h-5" />,
          color: "hover:text-gray-800 dark:hover:text-white",
        },
        {
          title: "Portfolio",
          url: "https://yourportfolio.com",
          icon: <Globe className="w-5 h-5" />,
          color: "hover:text-green-500",
        },
      ],
    },
    {
      category: "Apps",
      items: [
        {
          title: "Taste with out Borders",
          url: "https://github.com/yourusername",
          icon: <Github className="w-5 h-5" />,
          color: "hover:text-gray-800 dark:hover:text-white",
        },
        {
          title: "Commons",
          url: "https://yourportfolio.com",
          icon: <Globe className="w-5 h-5" />,
          color: "hover:text-green-500",
        },
        {
          title: "Youtube Ad Blocker",
          url: "https://yourportfolio.com",
          icon: <Globe className="w-5 h-5" />,
          color: "hover:text-green-500",
        },
      ],
    },
    {
      category: "Content",
      items: [
        {
          title: "YouTube Channel",
          url: "https://youtube.com/@yourchannel",
          icon: <Youtube className="w-5 h-5" />,
          color: "hover:text-red-500",
        },
        {
          title: "Buy me a coffee",
          url: "https://buymeacoffee.com/yourusername",
          icon: <Coffee className="w-5 h-5" />,
          color: "hover:text-yellow-500",
        },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      {links.map((section, index) => (
        <div key={index} className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
            {section.category}
          </h2>
          <div className="space-y-3">
            {section.items.map((link, linkIndex) => (
              <LinkCard key={linkIndex} {...link} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
