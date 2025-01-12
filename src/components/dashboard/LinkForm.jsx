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

export const LinkForm = ({
  formData,
  setFormData,
  handleSubmit,
  handleCancel,
  editingLink,
}) => {
  const handleUrlChange = (e) => {
    let url = e.target.value;

    // Only add protocol if URL doesn't already have one
    if (url && !url.match(/^https?:\/\//i)) {
      // For email links, use mailto: protocol
      if (formData.icon === "email") {
        url = url.startsWith("mailto:") ? url : `mailto:${url}`;
      } else {
        url = `https://${url}`;
      }
    }

    setFormData({ ...formData, url });
  };

  const formatUrlForDisplay = (url) => {
    // Remove protocols for display
    return url.replace(/^(https?:\/\/|mailto:)/i, "");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 bg-gray-50 rounded-lg"
    >
      <div className="space-y-2">
        <label className="block text-sm font-medium">Platform</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full p-2 border rounded"
          placeholder="e.g. Twitter, GitHub"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Username</label>
        <input
          type="text"
          value={formData.username}
          onChange={(e) =>
            setFormData({ ...formData, username: e.target.value })
          }
          className="w-full p-2 border rounded"
          placeholder="@username"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">URL</label>
        <div className="relative">
          <input
            type="text"
            value={formatUrlForDisplay(formData.url)}
            onChange={handleUrlChange}
            className="w-full p-2 border rounded pl-8"
            placeholder={
              formData.icon === "email"
                ? "example@email.com"
                : "www.example.com"
            }
            required
          />
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
            {formData.icon === "email"
              ? "@"
              : formData.url.startsWith("https://")
              ? "https://"
              : ""}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Icon</label>
        <div className="grid grid-cols-3 gap-2 mb-2">
          {Object.entries(socialIcons).map(([name, Icon]) => (
            <button
              key={name}
              type="button"
              onClick={() => {
                setFormData({
                  ...formData,
                  icon: name,
                  // Clear URL when switching between email and web links
                  url: "",
                });
              }}
              className={`p-3 border rounded flex items-center justify-center gap-2 transition-colors ${
                formData.icon === name
                  ? "bg-blue-50 border-blue-500 text-blue-500"
                  : "hover:bg-gray-50"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm capitalize">{name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {editingLink ? "Save Changes" : "Add Link"}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default LinkForm;
