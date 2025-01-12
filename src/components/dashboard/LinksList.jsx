"use client";

import { Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const LinksList = ({ links, onEdit, onDelete, getLinkIcon }) => {
  console.log("LinksList received links:", links); // Debug log

  return (
    <div className="space-y-3">
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
                {link.username && (
                  <p className="text-sm text-gray-500">{link.username}</p>
                )}
                <p className="text-xs text-gray-400">{link.url}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => onEdit(link)}
                variant="ghost"
                size="icon"
                className="text-gray-500 hover:text-gray-700"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => onDelete(link.id)}
                variant="ghost"
                size="icon"
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LinksList;
