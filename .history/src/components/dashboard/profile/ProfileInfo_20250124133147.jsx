"use client";

import { Briefcase, Map } from "lucide-react";

export const ProfileInfo = ({ isEditing, profileData, setProfileData }) => {
  return (
    <div className="space-y-4">
      {/* Name and Title Section */}
      <div>
        {isEditing ? (
          <input
            type="text"
            value={profileData.name}
            onChange={(e) =>
              setProfileData({ ...profileData, name: e.target.value })
            }
            className={`text-xl font-bold text-center bg-gray-50 border rounded px-2 py-1 w-full ${profileData.profile_text_color}`}
            placeholder="Your name"
          />
        ) : (
          <h2 className={`text-xl font-bold ${profileData.profile_text_color}`}>
            {profileData.name}
          </h2>
        )}
        {isEditing ? (
          <input
            type="text"
            value={profileData.title}
            onChange={(e) =>
              setProfileData({ ...profileData, title: e.target.value })
            }
            className={`text-sm text-center bg-gray-50 border rounded px-2 py-1 w-full mt-1 ${profileData.profile_text_color}`}
            placeholder="Your title"
          />
        ) : (
          <p className={`text-sm ${profileData.profile_text_color}`}>
            {profileData.title}
          </p>
        )}
      </div>

      {/* Location and Availability Section */}
      <div className="flex justify-center gap-2 text-sm">
        {/* Location */}
        <span className="flex items-center gap-1">
          <Map className={`w-4 h-4 ${profileData.profile_text_color}`} />
          {isEditing ? (
            <input
              type="text"
              value={profileData.location}
              onChange={(e) =>
                setProfileData({
                  ...profileData,
                  location: e.target.value,
                })
              }
              className={`bg-gray-50 border rounded px-2 py-1 ${profileData.profile_text_color}`}
              placeholder="Your location"
            />
          ) : (
            <span className={profileData.profile_text_color}>
              {profileData.location}
            </span>
          )}
        </span>

        {/* Availability */}
        {isEditing ? (
          <label
            className={`flex items-center gap-1 cursor-pointer ${profileData.profile_text_color}`}
          >
            <Briefcase className="w-4 h-4" />
            <input
              type="checkbox"
              checked={profileData.availability}
              onChange={(e) =>
                setProfileData({
                  ...profileData,
                  availability: e.target.checked,
                })
              }
              className="form-checkbox h-4 w-4"
            />
            <span>Available for work</span>
          </label>
        ) : (
          profileData.availability && (
            <span
              className={`flex items-center gap-1 ${profileData.profile_text_color}`}
            >
              <Briefcase
                className={`w-4 h-4 ${profileData.profile_text_color}`}
              />
              Available for work
            </span>
          )
        )}
      </div>

      {/* Background for Links Section */}
      <div className={`rounded-lg ${profileData.button_bg_color} p-4`}>
        <div className={`text-center ${profileData.button_text_color}`}>
          Your links will appear here
        </div>
      </div>
    </div>
  );
};

// Custom Card Component for Links
const LinkCard = ({ link, profileData }) => {
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
            {link.icon}
          </div>
          <span className={profileData.button_text_color}>
            {link.username || link.title}
          </span>
        </div>
        <span className={profileData.button_text_color}>→</span>
      </div>
    </a>
  );
};

export default ProfileInfo;
