import { Plus } from "lucide-react";

export const AddLinkButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
    >
      <Plus className="w-5 h-5" />
      Add New Link
    </button>
  );
};

export default AddLinkButton;
