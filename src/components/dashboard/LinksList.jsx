// components/dashboard/LinksList.jsx
export const LinksList = ({ links, onEdit, onDelete, getLinkIcon }) => (
  <div className="space-y-4">
    {links.map((link) => (
      <div
        key={link.id}
        className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              {getLinkIcon(link.icon)}
            </div>
            <div>
              <p className="font-medium">{link.title}</p>
              <p className="text-sm text-gray-500">{link.username}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(link)}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(link.id)}
              className="p-2 text-red-500 hover:text-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>
);
