// components/dashboard/StatsCard.jsx

import { Card, CardContent } from "./ui/card";

export const StatsCard = ({ title, value, Icon, iconColor }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
        </div>
        <Icon className={`w-8 h-8 ${iconColor}`} />
      </div>
    </CardContent>
  </Card>
);
