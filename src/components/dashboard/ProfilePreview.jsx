import { useState, useEffect } from "react";
import { Briefcase, Map, Edit2, X, Check, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export const ProfilePreview = ({ user, subtitles, links, getLinkIcon }) => {
  const supabase = createClientComponentClient();
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const [profileData, setProfileData] = useState({
    name: "",
    title: "Digital Creator | App Developer",
    location: "Los Angeles, CA",
    availability: true,
    bio: "",
    avatar_url: "/api/placeholder/96/96",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user?.id) {
      console.log("No user ID available");
      setLoading(false);
      return;
    }

    try {
      console.log("Fetching profile for user:", user.id);

      let { data: profile, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      console.log("Initial fetch result:", { profile, fetchError });

      if (fetchError && fetchError.code === "PGRST116") {
        console.log("Profile not found, creating new profile...");

        const defaultProfile = {
          id: user.id,
          name: user?.name || "Amare",
          title: "Digital Creator | App Developer",
          location: "Los Angeles, CA",
          availability: true,
          bio: "",
          avatar_url: "/api/placeholder/96/96",
        };

        const { data: newProfile, error: createError } = await supabase
          .from("profiles")
          .insert([defaultProfile])
          .select()
          .single();

        if (createError) {
          console.error("Profile creation error:", {
            code: createError.code,
            message: createError.message,
            details: createError.details,
            hint: createError.hint,
          });
          throw createError;
        }

        console.log("New profile created:", newProfile);
        profile = newProfile;
      } else if (fetchError) {
        throw fetchError;
      }

      if (profile) {
        setProfileData({
          name: profile.name || user?.name || "Amare",
          title: profile.title || "Digital Creator | App Developer",
          location: profile.location || "Los Angeles, CA",
          availability: profile.availability ?? true,
          bio: profile.bio || "",
          avatar_url: profile.avatar_url || "/api/placeholder/96/96",
        });
      }
    } catch (error) {
      console.error("Profile operation failed:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
      setError("Failed to load profile. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id) {
      setError("User ID is required");
      return;
    }

    try {
      setError(null);
      // First, check if profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        console.error("Error checking profile:", checkError);
        throw checkError;
      }

      const updates = {
        id: user.id,
        name: profileData.name || "",
        title: profileData.title || "",
        location: profileData.location || "",
        availability: profileData.availability || false,
        bio: profileData.bio || "",
        avatar_url: profileData.avatar_url || "",
      };

      console.log("Profile update attempt:", {
        exists: !!existingProfile,
        updates,
      });

      let result;
      if (!existingProfile) {
        // Insert new profile
        result = await supabase
          .from("profiles")
          .insert([{ ...updates, created_at: new Date().toISOString() }])
          .select()
          .single();
      } else {
        // Update existing profile
        result = await supabase
          .from("profiles")
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq("id", user.id)
          .select()
          .single();
      }

      if (result.error) {
        console.error("Database operation failed:", {
          error: result.error,
          status: result.status,
          statusText: result.statusText,
        });
        throw result.error;
      }

      console.log("Profile saved successfully:", result.data);
      setIsEditing(false);

      // Refresh profile data
      await fetchProfile();
    } catch (error) {
      console.error("Save operation failed:", {
        code: error?.code,
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
      });
      setError(
        error?.message || "Failed to save profile changes. Please try again."
      );
    }
  };

  const handleImageUpload = async (e) => {
    try {
      setError(null);
      const file = e.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) {
        console.error("Error uploading image:", uploadError);
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      setProfileData({ ...profileData, avatar_url: publicUrl });
      await handleSave(); // Save the profile with new avatar URL
    } catch (error) {
      console.error("Image upload failed:", error);
      setError("Failed to upload image. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">Loading...</div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Profile Preview</CardTitle>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="p-2 text-green-500 hover:text-green-700 rounded-full hover:bg-green-50"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setError(null);
              }}
              className="p-2 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="scale-90 transform origin-top">
          <div className="text-center space-y-4">
            <div className="relative w-24 h-24 mx-auto group">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-full"></div>
              <div className="absolute inset-[2px] bg-white rounded-full p-1">
                <img
                  src={profileData.avatar_url}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-full"
                />
                {isEditing && (
                  <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                    <Upload className="w-6 h-6 text-white" />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>
                )}
              </div>
            </div>

            <div>
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, name: e.target.value })
                  }
                  className="text-xl font-bold text-center bg-gray-50 border rounded px-2 py-1 w-full"
                  placeholder="Your name"
                />
              ) : (
                <h2 className="text-xl font-bold">{profileData.name}</h2>
              )}
              {isEditing ? (
                <input
                  type="text"
                  value={profileData.title}
                  onChange={(e) =>
                    setProfileData({ ...profileData, title: e.target.value })
                  }
                  className="text-sm text-gray-600 text-center bg-gray-50 border rounded px-2 py-1 w-full mt-1"
                  placeholder="Your title"
                />
              ) : (
                <p className="text-sm text-gray-600">{profileData.title}</p>
              )}
            </div>

            <div className="flex justify-center gap-2 text-sm">
              <span className="flex items-center gap-1">
                <Map className="w-4 h-4" />
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
                    className="bg-gray-50 border rounded px-2 py-1"
                    placeholder="Your location"
                  />
                ) : (
                  profileData.location
                )}
              </span>
              {isEditing ? (
                <label className="flex items-center gap-1 cursor-pointer">
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
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    Available for work
                  </span>
                )
              )}
            </div>

            {subtitles.map((subtitle) => (
              <div key={subtitle.id} className="mt-4">
                <h3 className="text-lg font-medium mb-2">{subtitle.text}</h3>
                <div className="space-y-2">
                  {links.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 justify-center text-gray-600 hover:text-gray-900"
                    >
                      {getLinkIcon(link.icon)}
                      <span>{link.username}</span>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfilePreview;
