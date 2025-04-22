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
  Facebook,
  Link as LinkIcon,
} from "lucide-react";
import LinkCard from "./LinkCard";

// Map icon names to components
const iconMap = {
  github: Github,
  twitter: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
  email: Mail,
  website: Globe,
  youtube: Youtube,
  facebook: Facebook,
  link: LinkIcon,
};

export default function LinkContainer({ subtitles = [], links = [] }) {
  // Function to get icon component by name
  const getIconComponent = (iconName) => {
    const Icon = iconMap[iconName?.toLowerCase()] || Globe;
    return <Icon className="w-5 h-5" />;
  };

  // Handle case where there's no data
  if (!subtitles.length && !links.length) {
    return (
      <div className="text-center py-10 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No links available</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {subtitles.map((subtitle) => {
        // Get links for this subtitle
        const sectionLinks = links.filter(
          (link) => link.subtitle_id === subtitle.id
        );

        if (sectionLinks.length === 0) return null;

        return (
          <div key={subtitle.id} className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              {subtitle.text}
            </h2>
            <div className="space-y-3">
              {sectionLinks.map((link) => (
                <LinkCard
                  key={link.id}
                  title={link.title}
                  url={link.url}
                  icon={getIconComponent(link.icon)}
                  color={`hover:text-blue-${
                    link.icon === "twitter" ? "400" : "500"
                  }`}
                  username={link.username}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
