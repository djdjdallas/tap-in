import React, { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Users,
  Globe,
  Clock,
  MousePointer,
  ArrowUpRight,
  ArrowDown,
  Smartphone,
  Monitor,
  Tablet,
} from "lucide-react";

// Utility function to get date range
const getDateRangeFilter = (timeRange) => {
  const now = new Date();
  const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
  const startDate = new Date(now.setDate(now.getDate() - days));
  return startDate.toISOString();
};

// Utility function to get device icon
const getDeviceIcon = (deviceType) => {
  switch (deviceType.toLowerCase()) {
    case "mobile":
      return Smartphone;
    case "tablet":
      return Tablet;
    case "desktop":
    default:
      return Monitor;
  }
};

const AnalyticsDashboard = ({ user }) => {
  const supabase = createClientComponentClient();
  const [timeRange, setTimeRange] = useState("7d");
  const [analyticsData, setAnalyticsData] = useState({
    totalViews: 0,
    totalClicks: 0,
    avgTimeOnPage: 0,
    bounceRate: 0,
    deviceStats: [],
    topLinks: [],
    locationData: [],
    trends: {
      views: 0,
      clicks: 0,
      timeOnPage: 0,
      bounceRate: 0,
    },
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    fetchAnalyticsData();
  }, [user?.id, timeRange]);

  const calculateTrend = (current, previous) => {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
  };

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);
      const startDate = getDateRangeFilter(timeRange);
      const previousStartDate = getDateRangeFilter(
        timeRange === "7d" ? "14d" : timeRange === "30d" ? "60d" : "180d"
      );

      // Fetch current period summary
      const { data: currentSummary, error: currentError } = await supabase
        .from("page_views")
        .select("id, timestamp, session_duration")
        .eq("user_id", user.id)
        .gte("timestamp", startDate);

      if (currentError) throw currentError;

      // Fetch previous period summary
      const { data: previousSummary, error: previousError } = await supabase
        .from("page_views")
        .select("id, timestamp, session_duration")
        .eq("user_id", user.id)
        .gte("timestamp", previousStartDate)
        .lt("timestamp", startDate);

      if (previousError) throw previousError;

      // Fetch clicks data
      const { data: clicksData, error: clicksError } = await supabase
        .from("link_clicks")
        .select("id, timestamp, link_id")
        .eq("user_id", user.id)
        .gte("timestamp", startDate);

      if (clicksError) throw clicksError;

      // Fetch device stats using the custom function
      const { data: deviceData, error: deviceError } = await supabase.rpc(
        "get_device_stats",
        {
          user_id_param: user.id,
          start_date_param: startDate,
        }
      );

      if (deviceError) throw deviceError;

      // Fetch geographic distribution using the custom function
      const { data: geoData, error: geoError } = await supabase.rpc(
        "get_geo_stats",
        {
          user_id_param: user.id,
          start_date_param: startDate,
        }
      );

      if (geoError) throw geoError;

      // Calculate metrics
      const currentMetrics = {
        views: currentSummary?.length || 0,
        clicks: clicksData?.length || 0,
        avgTime:
          currentSummary?.reduce(
            (acc, curr) => acc + (curr.session_duration || 0),
            0
          ) / (currentSummary?.length || 1) || 0,
        bounceRate:
          ((currentSummary?.filter((view) => view.session_duration < 10)
            ?.length || 0) /
            (currentSummary?.length || 1)) *
          100,
      };

      const previousMetrics = {
        views: previousSummary?.length || 0,
        clicks: previousSummary?.length || 0,
        avgTime:
          previousSummary?.reduce(
            (acc, curr) => acc + (curr.session_duration || 0),
            0
          ) / (previousSummary?.length || 1) || 0,
        bounceRate:
          ((previousSummary?.filter((view) => view.session_duration < 10)
            ?.length || 0) /
            (previousSummary?.length || 1)) *
          100,
      };

      // Calculate device distribution
      const totalDeviceViews =
        deviceData?.reduce((sum, item) => sum + Number(item.count), 0) || 0;
      const deviceStats =
        deviceData?.map((item) => ({
          name: item.device_type || "Unknown",
          value: totalDeviceViews
            ? Math.round((Number(item.count) / totalDeviceViews) * 100)
            : 0,
          icon: getDeviceIcon(item.device_type || "desktop"),
        })) || [];

      // Fetch and calculate link performance
      const { data: links, error: linksError } = await supabase
        .from("links")
        .select(
          `
        id,
        title,
        link_clicks(count),
        page_views(count)
      `
        )
        .eq("user_id", user.id);

      if (linksError) throw linksError;

      const topLinks =
        links
          ?.map((link) => ({
            name: link.title,
            clicks: link.link_clicks?.length || 0,
            views: link.page_views?.length || 0,
            clickRate: link.page_views?.length
              ? `${Math.round(
                  ((link.link_clicks?.length || 0) / link.page_views?.length) *
                    100
                )}%`
              : "0%",
          }))
          .sort((a, b) => b.clicks - a.clicks)
          .slice(0, 5) || [];

      setAnalyticsData({
        totalViews: currentMetrics.views,
        totalClicks: currentMetrics.clicks,
        avgTimeOnPage: currentMetrics.avgTime,
        bounceRate: currentMetrics.bounceRate,
        deviceStats,
        topLinks,
        locationData:
          geoData?.map((item) => ({
            country: item.country || "Unknown",
            visits: Number(item.count),
          })) || [],
        trends: {
          views: calculateTrend(currentMetrics.views, previousMetrics.views),
          clicks: calculateTrend(currentMetrics.clicks, previousMetrics.clicks),
          timeOnPage: calculateTrend(
            currentMetrics.avgTime,
            previousMetrics.avgTime
          ),
          bounceRate:
            calculateTrend(
              currentMetrics.bounceRate,
              previousMetrics.bounceRate
            ) * -1,
        },
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const StatsCard = ({ title, value, icon: Icon, metricKey }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-bold">{value}</h3>
              {analyticsData.trends && (
                <span
                  className={`text-sm flex items-center ${
                    analyticsData.trends[metricKey] >= 0
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {analyticsData.trends[metricKey] >= 0 ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDown className="w-4 h-4" />
                  )}
                  {Math.abs(analyticsData.trends[metricKey]).toFixed(1)}%
                </span>
              )}
            </div>
          </div>
          <Icon className="w-8 h-8 text-gray-400" />
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Time Range Selector */}
      <div className="flex justify-end gap-2">
        <Button
          variant={timeRange === "7d" ? "default" : "outline"}
          onClick={() => setTimeRange("7d")}
        >
          7 Days
        </Button>
        <Button
          variant={timeRange === "30d" ? "default" : "outline"}
          onClick={() => setTimeRange("30d")}
        >
          30 Days
        </Button>
        <Button
          variant={timeRange === "90d" ? "default" : "outline"}
          onClick={() => setTimeRange("90d")}
        >
          90 Days
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Views"
          value={analyticsData.totalViews.toLocaleString()}
          icon={Activity}
          metricKey="views"
        />
        <StatsCard
          title="Total Clicks"
          value={analyticsData.totalClicks.toLocaleString()}
          icon={MousePointer}
          metricKey="clicks"
        />
        <StatsCard
          title="Avg. Time on Page"
          value={`${Math.floor(analyticsData.avgTimeOnPage)}s`}
          icon={Clock}
          metricKey="timeOnPage"
        />
        <StatsCard
          title="Bounce Rate"
          value={`${analyticsData.bounceRate.toFixed(1)}%`}
          icon={Users}
          metricKey="bounceRate"
        />
      </div>

      {/* Device Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Device Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {analyticsData.deviceStats.map((device) => (
              <Card key={device.name}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <device.icon className="w-5 h-5 text-gray-500" />
                      <span>{device.name}</span>
                    </div>
                    <span className="font-bold">{device.value}%</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Links Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Top Links Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.topLinks.map((link) => (
              <div key={link.name} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{link.name}</span>
                  <span className="text-sm text-gray-500">
                    Click Rate: {link.clickRate}
                  </span>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">{link.views} views</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MousePointer className="w-4 h-4 text-green-500" />
                    <span className="text-sm">{link.clicks} clicks</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Geographic Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Geographic Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.locationData.map((location) => (
              <div
                key={location.country}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <span>{location.country}</span>
                </div>
                <span className="font-medium">{location.visits} visits</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
