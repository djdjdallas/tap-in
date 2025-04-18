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
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    fetchAnalyticsData();
  }, [user?.id, timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);

      // Simulate fetching data - in production, these would be real database calls
      const mockData = generateMockData();
      setAnalyticsData(mockData);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mock data generator - replace with real data in production
  const generateMockData = () => {
    return {
      deviceStats: [
        { name: "Mobile", value: 65, icon: Smartphone },
        { name: "Desktop", value: 30, icon: Monitor },
        { name: "Tablet", value: 5, icon: Tablet },
      ],
      topLinks: [
        { name: "Portfolio", clicks: 145, views: 280, clickRate: "51.8%" },
        { name: "Twitter", clicks: 98, views: 190, clickRate: "51.6%" },
        { name: "GitHub", clicks: 76, views: 150, clickRate: "50.7%" },
        { name: "LinkedIn", clicks: 65, views: 120, clickRate: "54.2%" },
      ],
      locationData: [
        { country: "United States", visits: 450 },
        { country: "United Kingdom", visits: 270 },
        { country: "Canada", visits: 180 },
        { country: "Germany", visits: 150 },
      ],
      totalViews: 1250,
      totalClicks: 584,
      avgTimeOnPage: 125,
      bounceRate: 32.5,
    };
  };

  const StatsCard = ({ title, value, icon: Icon, trend, trendValue }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-bold">{value}</h3>
              {trend && (
                <span
                  className={`text-sm flex items-center ${
                    trendValue >= 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {trendValue >= 0 ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDown className="w-4 h-4" />
                  )}
                  {Math.abs(trendValue)}%
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
          trend
          trendValue={12.5}
        />
        <StatsCard
          title="Total Clicks"
          value={analyticsData.totalClicks.toLocaleString()}
          icon={MousePointer}
          trend
          trendValue={8.2}
        />
        <StatsCard
          title="Avg. Time on Page"
          value={`${Math.floor(analyticsData.avgTimeOnPage)}s`}
          icon={Clock}
          trend
          trendValue={5.3}
        />
        <StatsCard
          title="Bounce Rate"
          value={`${analyticsData.bounceRate}%`}
          icon={Users}
          trend
          trendValue={-2.1}
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
