"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LinksList } from "./LinksList";

export const SubtitleSection = ({
  subtitle,
  links,
  onAddLink,
  onEditLink,
  onDeleteLink,
  getLinkIcon,
}) => {
  if (!subtitle || !subtitle.id) {
    return null;
  }

  // Filter links that belong to this subtitle
  const sectionLinks = links.filter(
    (link) => Number(link.subtitle_id) === Number(subtitle.id)
  );

  return (
    <Card className="w-full">
      <CardContent className="space-y-4 p-4">
        <div className="flex items-center justify-between pb-2 border-b">
          <h3 className="text-lg font-medium">{subtitle.text}</h3>
        </div>

        <div className="space-y-4">
          {/* Show links if they exist */}
          {sectionLinks.length > 0 && (
            <LinksList
              links={sectionLinks}
              onEdit={onEditLink}
              onDelete={onDeleteLink}
              getLinkIcon={getLinkIcon}
            />
          )}

          {/* Always show the Add Link button */}
          <Button
            onClick={() => onAddLink(subtitle.id)}
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Link to {subtitle.text}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubtitleSection;
