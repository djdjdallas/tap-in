import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
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

const socialIcons = {
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

const LinkCard = ({ link, getLinkIcon, profileData }) => {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`block p-3 ${profileData.button_bg_color} rounded-lg transition-shadow hover:shadow-md`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/50 rounded-lg flex items-center justify-center">
            {getLinkIcon(link.icon)}
          </div>
          <div className="flex flex-col">
            <span className={`font-medium ${profileData.button_text_color}`}>
              {link.title}
            </span>
            {link.username && (
              <span
                className={`text-sm opacity-75 ${profileData.button_text_color}`}
              >
                {link.username}
              </span>
            )}
          </div>
        </div>
        <span className={`${profileData.button_text_color}`}>→</span>
      </div>
    </a>
  );
};

export function ProfilePreview({ user, subtitles, links, getLinkIcon }) {
  const [avatarUrl, setAvatarUrl] = useState("/api/placeholder/128/128");

  // Get custom appearance settings with fallbacks
  const profileData = {
    background_gradient_start:
      user?.background_gradient_start || "from-gray-50",
    background_gradient_end: user?.background_gradient_end || "to-gray-50",
    button_bg_color: user?.button_bg_color || "bg-gray-100",
    button_text_color: user?.button_text_color || "text-gray-800",
    profile_text_color: user?.profile_text_color || "text-gray-600",
  };

  return (
    <Card className="sticky top-6">
      <CardContent className="p-6">
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Preview</h3>

          <div
            className={`rounded-lg p-6 space-y-6 bg-gradient-to-tr ${profileData.background_gradient_start} ${profileData.background_gradient_end}`}
          >
            {/* Profile Image */}
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-full" />
              <div className="absolute inset-[3px] bg-white rounded-full overflow-hidden">
                <img
                  src={avatarUrl}
                  alt={`${user?.name || "User"}'s profile`}
                  className="w-full h-full object-cover"
                  onError={() => setAvatarUrl("/api/placeholder/128/128")}
                />
              </div>
            </div>

            {/* Profile Info */}
            <div className="text-center space-y-4">
              <div>
                <h4
                  className={`text-xl font-bold ${profileData.profile_text_color}`}
                >
                  {user?.name || "New User"}
                </h4>
                <p className={`text-sm ${profileData.profile_text_color}`}>
                  {user?.title || "Digital Creator"}
                </p>
              </div>

              {/* Location and Availability */}
              {(user?.location || user?.availability) && (
                <div className="flex justify-center gap-3">
                  {user?.location && (
                    <span
                      className={`px-3 py-1 ${profileData.button_bg_color} shadow-sm rounded-full text-xs ${profileData.button_text_color}`}
                    >
                      📍 {user.location}
                    </span>
                  )}
                  {user?.availability && (
                    <span
                      className={`px-3 py-1 ${profileData.button_bg_color} shadow-sm rounded-full text-xs ${profileData.button_text_color}`}
                    >
                      💼 Available for work
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Links Preview */}
            <div className="space-y-4">
              {subtitles?.map((subtitle) => (
                <div key={subtitle.id} className="space-y-3">
                  <h5
                    className={`text-sm font-medium text-center ${profileData.profile_text_color}`}
                  >
                    {subtitle.text}
                  </h5>
                  <div className="space-y-2">
                    {links
                      ?.filter((link) => link.subtitle_id === subtitle.id)
                      .map((link) => (
                        <LinkCard
                          key={link.id}
                          link={link}
                          getLinkIcon={getLinkIcon}
                          profileData={profileData}
                        />
                      ))}
                  </div>
                </div>
              ))}
              {(!subtitles?.length || !links?.length) && (
                <p
                  className={`text-sm text-center ${profileData.profile_text_color}`}
                >
                  No links added yet
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ProfilePreview;
