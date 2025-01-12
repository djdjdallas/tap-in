import { Edit2, Trash2 } from "lucide-react";
import { useState } from "react";

// components/dashboard/SubtitleEditor.jsx
export const SubtitleEditor = ({ subtitles, setSubtitles }) => {
  const [isEditing, setIsEditing] = useState(null);
  const [newSubtitle, setNewSubtitle] = useState("");
  const [isAddingNew, setIsAddingNew] = useState(false);

  const handleAddSubtitle = () => {
    if (newSubtitle.trim()) {
      setSubtitles([...subtitles, { id: Date.now(), text: newSubtitle }]);
      setNewSubtitle("");
      setIsAddingNew(false);
    }
  };

  const handleUpdateSubtitle = (id, newText) => {
    setSubtitles(
      subtitles.map((sub) => (sub.id === id ? { ...sub, text: newText } : sub))
    );
    setIsEditing(null);
  };

  const handleDeleteSubtitle = (id) => {
    setSubtitles(subtitles.filter((sub) => sub.id !== id));
  };

  return (
    <div className="space-y-4">
      {subtitles.map((subtitle) => (
        <div key={subtitle.id} className="flex items-center gap-2">
          {isEditing === subtitle.id ? (
            <>
              <input
                type="text"
                value={subtitle.text}
                onChange={(e) =>
                  handleUpdateSubtitle(subtitle.id, e.target.value)
                }
                className="p-2 border rounded flex-1"
              />
              <button
                onClick={() => setIsEditing(null)}
                className="p-2 bg-blue-500 text-white rounded"
              >
                Save
              </button>
            </>
          ) : (
            <>
              <h3 className="text-lg font-medium flex-1">{subtitle.text}</h3>
              <button
                onClick={() => setIsEditing(subtitle.id)}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteSubtitle(subtitle.id)}
                className="p-1 text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      ))}

      {isAddingNew ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newSubtitle}
            onChange={(e) => setNewSubtitle(e.target.value)}
            className="p-2 border rounded flex-1"
            placeholder="Enter new subtitle"
          />
          <button
            onClick={handleAddSubtitle}
            className="p-2 bg-blue-500 text-white rounded"
          >
            Add
          </button>
          <button
            onClick={() => setIsAddingNew(false)}
            className="p-2 bg-gray-300 rounded"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsAddingNew(true)}
          className="text-blue-500 hover:text-blue-700"
        >
          + Add New Subtitle
        </button>
      )}
    </div>
  );
};
