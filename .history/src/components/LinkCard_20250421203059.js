// components/LinkCard.js
import { Card, CardContent } from "@/components/ui/card";

export function LinkCard({ title, url, icon, color, username }) {
  return (
    <Card className="group transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="p-4 flex items-center justify-between"
      >
        <div className={`flex items-center gap-3 ${color}`}>
          {icon}
          <div>
            <span className="font-medium">{title}</span>
            {username && <p className="text-sm text-gray-500">@{username}</p>}
          </div>
        </div>
        <span className="text-gray-400 transform group-hover:translate-x-1 transition-transform duration-300">
          →
        </span>
      </a>
    </Card>
  );
}

export default LinkCard;
