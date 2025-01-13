// components/StatsCard.jsx
import { Card, CardContent } from "@/components/ui/card";
import { useAnalytics } from "@/contexts/AnalyticsContext";
import { Loader2 } from "lucide-react";

export const StatsCard = ({ title, metric, Icon, iconColor }) => {
  const { isLoading, error, getMetricValue } = useAnalytics();
  const value = getMetricValue(metric);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <div className="flex items-center gap-2">
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-gray-500">Loading...</span>
                </div>
              ) : error ? (
                <div className="text-sm text-red-500">Error loading data</div>
              ) : (
                <h3 className="text-2xl font-bold">{value}</h3>
              )}
            </div>
          </div>
          <Icon className={`w-8 h-8 ${iconColor}`} />
        </div>
      </CardContent>
    </Card>
  );
};
