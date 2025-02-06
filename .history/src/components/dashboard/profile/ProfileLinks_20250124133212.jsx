"use client";

export const ProfileLinks = ({
  subtitles,
  links,
  getLinkIcon,
  profileData,
}) => {
  return (
    <div className="space-y-6">
      {subtitles?.map((subtitle) => (
        <div key={subtitle.id} className="space-y-4">
          <h3
            className={`text-lg font-medium text-center ${profileData.profile_text_color}`}
          >
            {subtitle.text}
          </h3>

          <div className="space-y-3">
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
    </div>
  );
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

// Empty State Component
const EmptyLinksState = ({ profileData }) => {
  return (
    <div className="text-center py-4">
      <p className={`text-sm ${profileData.profile_text_color}`}>
        No links added yet
      </p>
    </div>
  );
};

export default ProfileLinks;
