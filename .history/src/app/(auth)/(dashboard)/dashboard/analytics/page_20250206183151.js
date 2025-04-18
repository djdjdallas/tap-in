"use client";
import React, { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Users,
  Globe,
  Clock,
  MousePointer,
  ArrowUpRight,
} from "lucide-react";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const AnalyticsDashboard = ({ user }) => {
  const supabase = createClientComponentClient();
  const [timeRange, setTimeRange] = useState("7d");
  const [analyticsData, setAnalyticsData] = useState({
    viewsOverTime: [],
    clicksOverTime: [],
    deviceStats: [],
    topLinks: [],
    locationData: [],
    timeOfDayData: [],
    totalViews: 0,
    totalClicks: 0,
    avgTimeOnPage: 0,
    bounceRate: 0,
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
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    const viewsOverTime = Array.from({ length: days }, (_, i) => ({
      date: new Date(
        Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000
      ).toLocaleDateString(),
      views: Math.floor(Math.random() * 100) + 20,
      clicks: Math.floor(Math.random() * 50) + 10,
    }));

    return {
      viewsOverTime,
      deviceStats: [
        { name: "Mobile", value: 65 },
        { name: "Desktop", value: 30 },
        { name: "Tablet", value: 5 },
      ],
      topLinks: [
        { name: "Portfolio", clicks: 145, views: 280 },
        { name: "Twitter", clicks: 98, views: 190 },
        { name: "GitHub", clicks: 76, views: 150 },
        { name: "LinkedIn", clicks: 65, views: 120 },
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

  const StatsCard = ({ title, value, icon: Icon, trend }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-bold">{value}</h3>
              {trend && (
                <span className="text-sm text-green-500 flex items-center">
                  <ArrowUpRight className="w-4 h-4" />
                  {trend}%
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
          trend={12.5}
        />
        <StatsCard
          title="Total Clicks"
          value={analyticsData.totalClicks.toLocaleString()}
          icon={MousePointer}
          trend={8.2}
        />
        <StatsCard
          title="Avg. Time on Page"
          value={`${Math.floor(analyticsData.avgTimeOnPage)}s`}
          icon={Clock}
          trend={5.3}
        />
        <StatsCard
          title="Bounce Rate"
          value={`${analyticsData.bounceRate}%`}
          icon={Users}
          trend={-2.1}
        />
      </div>

      {/* Views & Clicks Over Time */}
      <Card>
        <CardHeader>
          <CardTitle>Views & Clicks Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData.viewsOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="views"
                  stroke="#8884d8"
                  name="Views"
                />
                <Line
                  type="monotone"
                  dataKey="clicks"
                  stroke="#82ca9d"
                  name="Clicks"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Device Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Device Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData.deviceStats}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {analyticsData.deviceStats.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Links Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Top Links Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.topLinks}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="clicks" fill="#8884d8" name="Clicks" />
                  <Bar dataKey="views" fill="#82ca9d" name="Views" />
                </BarChart>
              </ResponsiveContainer>
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
              {analyticsData.locationData.map((location, index) => (
                <div
                  key={location.country}
                  className="flex items-center justify-between"
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

        {/* Time of Day Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Engagement by Hour</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={Array.from({ length: 24 }, (_, hour) => ({
                    hour: `${hour}:00`,
                    visits: Math.floor(Math.random() * 50) + 10,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="visits" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
