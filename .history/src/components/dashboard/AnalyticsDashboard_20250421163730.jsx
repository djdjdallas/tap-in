"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  BarChart3,
  RefreshCw,
  Calendar,
  MapPin,
  TrendingUp,
  ChevronRight,
  FileBarChart,
  AlertTriangle,
} from "lucide-react";

// Define social icons object at the top to avoid reference errors
const socialIcons = {
  website: Globe,
  twitter: Twitter,
  github: Globe,
  linkedin: Globe,
  instagram: Globe,
  youtube: Globe,
  facebook: Globe,
  email: Globe,
  link: Link,
};

// Utility function to get date range
const getDateRangeFilter = (timeRange) => {
  const now = new Date();
  const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
  const startDate = new Date(now.setDate(now.getDate() - days));
  return startDate.toISOString();
};

// Utility function to get date range label
const getDateRangeLabel = (timeRange) => {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  });

  const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
  const startDate = new Date();
  startDate.setDate(now.getDate() - days);

  return `${formatter.format(startDate)} - ${formatter.format(now)}`;
};

// Utility function to get device icon
const getDeviceIcon = (deviceType) => {
  // Add null/undefined check
  if (!deviceType) return Monitor;

  try {
    switch (deviceType.toLowerCase()) {
      case "mobile":
        return Smartphone;
      case "tablet":
        return Tablet;
      case "desktop":
      default:
        return Monitor;
    }
  } catch (error) {
    // If deviceType is not a string or has no toLowerCase method
    return Monitor;
  }
};

// Empty state component
const EmptyState = ({ message, icon: Icon }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
      <Icon className="w-8 h-8 text-gray-400" />
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-1">
      No data available
    </h3>
    <p className="text-sm text-gray-500 max-w-md">{message}</p>
  </div>
);

const AnalyticsDashboard = ({ user }) => {
  const supabase = createClientComponentClient();
  const [timeRange, setTimeRange] = useState("7d");
  const [activeTab, setActiveTab] = useState("overview");
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
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    if (!user?.id) return;
    fetchAnalyticsData();
  }, [user?.id, timeRange]);

  const calculateTrend = (current, previous) => {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
  };

  const dateRangeLabel = useMemo(
    () => getDateRangeLabel(timeRange),
    [timeRange]
  );

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const startDate = getDateRangeFilter(timeRange);
      const previousStartDate = getDateRangeFilter(
        timeRange === "7d" ? "14d" : timeRange === "30d" ? "60d" : "180d"
      );

      // Fetch current period summary
      let currentSummary = [];
      try {
        const { data, error } = await supabase
          .from("page_views")
          .select("id, timestamp, session_duration")
          .eq("user_id", user.id)
          .gte("timestamp", startDate);

        if (error) {
          console.warn("Error fetching page views:", error);
        } else {
          currentSummary = data || [];
        }
      } catch (err) {
        console.warn("Exception fetching page views:", err);
        currentSummary = [];
      }

      // Fetch previous period summary
      let previousSummary = [];
      try {
        const { data, error } = await supabase
          .from("page_views")
          .select("id, timestamp, session_duration")
          .eq("user_id", user.id)
          .gte("timestamp", previousStartDate)
          .lt("timestamp", startDate);

        if (error) {
          console.warn("Error fetching previous page views:", error);
        } else {
          previousSummary = data || [];
        }
      } catch (err) {
        console.warn("Exception fetching previous page views:", err);
        previousSummary = [];
      }

      // Fetch clicks data
      let clicksData = [];
      try {
        const { data, error } = await supabase
          .from("link_clicks")
          .select("id, timestamp, link_id")
          .eq("user_id", user.id)
          .gte("timestamp", startDate);

        if (error) {
          console.warn("Error fetching link clicks:", error);
        } else {
          clicksData = data || [];
        }
      } catch (err) {
        console.warn("Exception fetching link clicks:", err);
        clicksData = [];
      }

      // Fetch device stats using the custom function
      let deviceData = [];
      try {
        const { data, error } = await supabase.rpc("get_device_stats", {
          user_id_param: user.id,
          start_date_param: startDate,
        });

        if (error) {
          console.warn("Error fetching device stats:", error);
        } else {
          deviceData = data || [];
        }
      } catch (err) {
        console.warn("RPC function get_device_stats may not exist:", err);
        deviceData = [];
      }

      // Fetch geographic distribution using the custom function
      let geoData = [];
      try {
        const { data, error } = await supabase.rpc("get_geo_stats", {
          user_id_param: user.id,
          start_date_param: startDate,
        });

        if (error) {
          console.warn("Error fetching geo stats:", error);
        } else {
          geoData = data || [];
        }
      } catch (err) {
        console.warn("RPC function get_geo_stats may not exist:", err);
        geoData = [];
      }

      // Calculate metrics with safeguards
      const currentMetrics = {
        views: currentSummary?.length || 0,
        clicks: clicksData?.length || 0,
        avgTime:
          currentSummary && currentSummary.length > 0
            ? currentSummary.reduce(
                (acc, curr) => acc + (curr.session_duration || 0),
                0
              ) / currentSummary.length
            : 0,
        bounceRate:
          currentSummary && currentSummary.length > 0
            ? ((currentSummary.filter(
                (view) => (view.session_duration || 0) < 10
              ).length || 0) /
                currentSummary.length) *
              100
            : 0,
      };

      const previousMetrics = {
        views: previousSummary?.length || 0,
        clicks: previousSummary?.length || 0,
        avgTime:
          previousSummary && previousSummary.length > 0
            ? previousSummary.reduce(
                (acc, curr) => acc + (curr.session_duration || 0),
                0
              ) / previousSummary.length
            : 0,
        bounceRate:
          previousSummary && previousSummary.length > 0
            ? ((previousSummary.filter(
                (view) => (view.session_duration || 0) < 10
              ).length || 0) /
                previousSummary.length) *
              100
            : 0,
      };

      // Calculate device distribution
      const totalDeviceViews =
        deviceData?.reduce((sum, item) => sum + Number(item.count || 0), 0) ||
        0;
      const deviceStats =
        deviceData?.map((item) => ({
          name: item.device_type || "Unknown",
          value: totalDeviceViews
            ? Math.round((Number(item.count || 0) / totalDeviceViews) * 100)
            : 0,
          icon: getDeviceIcon(item.device_type),
          count: Number(item.count || 0) || 0,
        })) || [];

      // Fetch and calculate link performance
      let topLinks = [];
      try {
        const { data: links, error: linksError } = await supabase
          .from("links")
          .select(
            `
            id,
            title,
            url,
            icon,
            link_clicks(count),
            page_views(count)
          `
          )
          .eq("user_id", user.id);

        if (linksError) {
          console.warn("Error fetching links:", linksError);
        } else if (links) {
          topLinks = links
            .map((link) => ({
              id: link.id,
              name: link.title || "",
              url: link.url || "",
              icon: link.icon || "link",
              clicks: link.link_clicks?.length || 0,
              views: link.page_views?.length || 0,
              clickRate: link.page_views?.length
                ? ((link.link_clicks?.length || 0) / link.page_views?.length) *
                  100
                : 0,
            }))
            .sort((a, b) => b.clicks - a.clicks);
        }
      } catch (err) {
        console.warn("Exception fetching links:", err);
      }

      setAnalyticsData({
        totalViews: currentMetrics.views,
        totalClicks: currentMetrics.clicks,
        avgTimeOnPage: currentMetrics.avgTime,
        bounceRate: currentMetrics.bounceRate,
        deviceStats,
        topLinks,
        locationData:
          geoData
            ?.map((item) => ({
              country: item.country || "Unknown",
              visits: Number(item.count || 0),
            }))
            .sort((a, b) => b.visits - a.visits) || [],
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
            ) * -1, // Inverted since lower bounce rate is better
        },
      });

      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching analytics:", error);

      // Improved error handling with proper fallbacks
      let errorMessage = "Failed to fetch analytics data";

      if (error && typeof error === "object") {
        errorMessage =
          error.message || error.error || error.details || errorMessage;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const StatsCard = ({ title, value, icon: Icon, metricKey, description }) => (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-500 mb-1">{title}</p>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-bold">{value}</h3>
              {analyticsData.trends &&
                analyticsData.trends[metricKey] !== 0 && (
                  <Badge
                    variant={
                      analyticsData.trends[metricKey] > 0
                        ? "success"
                        : "destructive"
                    }
                    className="h-6"
                  >
                    <span className="flex items-center text-xs">
                      {analyticsData.trends[metricKey] > 0 ? (
                        <ArrowUpRight className="w-3 h-3 mr-1" />
                      ) : (
                        <ArrowDown className="w-3 h-3 mr-1" />
                      )}
                      {Math.abs(analyticsData.trends[metricKey]).toFixed(1)}%
                    </span>
                  </Badge>
                )}
            </div>
            {description && (
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
          </div>
          <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
            <Icon className="w-6 h-6 text-gray-500" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const DeviceCard = ({ device }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <device.icon className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h4 className="font-medium">{device.name}</h4>
              <p className="text-sm text-gray-500">{device.count} visitors</p>
            </div>
          </div>
          <span className="text-lg font-bold">{device.value}%</span>
        </div>
        <Progress value={device.value} className="h-2" />
      </CardContent>
    </Card>
  );

  const LinkPerformanceCard = ({ link, index }) => {
    const IconComponent = useMemo(() => {
      return socialIcons[link.icon?.toLowerCase()] || socialIcons.link;
    }, [link.icon]);

    return (
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 flex-shrink-0 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">
                #{index + 1}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h4 className="font-medium text-gray-900 truncate">
                  {link.name}
                </h4>
                <Badge variant="outline" className="whitespace-nowrap h-5">
                  {link.clickRate.toFixed(1)}% CTR
                </Badge>
              </div>

              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-500 hover:text-blue-600 truncate block mb-3"
              >
                {link.url}
              </a>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-xs">{link.views} views</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MousePointer className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-xs">{link.clicks} clicks</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const LocationCard = ({ location, maxVisits }) => (
    <div className="flex items-center space-x-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-gray-400" />
            <span className="font-medium truncate">{location.country}</span>
          </div>
          <span className="text-sm font-semibold">{location.visits}</span>
        </div>
        <Progress
          value={(location.visits / maxVisits) * 100}
          className="h-1.5"
        />
      </div>
    </div>
  );

  if (isLoading && !analyticsData.totalViews) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4" />
          <p className="text-gray-500">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  // For empty state when there's no data
  const hasData = analyticsData.totalViews > 0 || analyticsData.totalClicks > 0;
  const maxLocationVisits =
    analyticsData.locationData.length > 0
      ? Math.max(...analyticsData.locationData.map((loc) => loc.visits))
      : 0;

  // Get top 5 links for overview tab
  const top5Links = analyticsData.topLinks.slice(0, 5);

  // Get top 3 locations for overview tab
  const top3Locations = analyticsData.locationData.slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            Analytics Dashboard
          </h2>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Data for {dateRangeLabel}</span>
            {lastUpdated && (
              <span className="text-xs text-gray-400 ml-2">
                (Updated {lastUpdated.toLocaleTimeString()})
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Time Range Selector */}
          <div className="bg-gray-100 rounded-lg p-1 flex items-center">
            <Button
              variant={timeRange === "7d" ? "default" : "ghost"}
              onClick={() => setTimeRange("7d")}
              size="sm"
              className="rounded-md h-8"
            >
              7 Days
            </Button>
            <Button
              variant={timeRange === "30d" ? "default" : "ghost"}
              onClick={() => setTimeRange("30d")}
              size="sm"
              className="rounded-md h-8"
            >
              30 Days
            </Button>
            <Button
              variant={timeRange === "90d" ? "default" : "ghost"}
              onClick={() => setTimeRange("90d")}
              size="sm"
              className="rounded-md h-8"
            >
              90 Days
            </Button>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={fetchAnalyticsData}
            disabled={isLoading}
            title="Refresh data"
            className="h-8 w-8 rounded-full"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-800 mb-1">
                Error loading analytics
              </h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {!hasData && !isLoading ? (
        <Card className="border-dashed">
          <CardContent className="p-6">
            <EmptyState
              message="You don't have any analytics data yet. As visitors view and interact with your profile, data will appear here."
              icon={FileBarChart}
            />
          </CardContent>
        </Card>
      ) : (
        <>
          <Tabs
            defaultValue="overview"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="links">Link Performance</TabsTrigger>
              <TabsTrigger value="audience">Audience</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                  title="Total Views"
                  value={analyticsData.totalViews.toLocaleString()}
                  icon={Activity}
                  metricKey="views"
                  description="Total profile page views"
                />
                <StatsCard
                  title="Total Clicks"
                  value={analyticsData.totalClicks.toLocaleString()}
                  icon={MousePointer}
                  metricKey="clicks"
                  description="Total link clicks"
                />
                <StatsCard
                  title="Avg. Time on Page"
                  value={`${Math.floor(analyticsData.avgTimeOnPage)}s`}
                  icon={Clock}
                  metricKey="timeOnPage"
                  description="Average session duration"
                />
                <StatsCard
                  title="Bounce Rate"
                  value={`${analyticsData.bounceRate.toFixed(1)}%`}
                  icon={Users}
                  metricKey="bounceRate"
                  description="Visitors who leave quickly"
                />
              </div>

              {/* Quick insights section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top performing links */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        Top Performing Links
                      </CardTitle>
                      {analyticsData.topLinks.length > 5 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-sm"
                          onClick={() => setActiveTab("links")}
                        >
                          View all
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {top5Links.length === 0 ? (
                      <div className="text-center py-6 text-gray-500 text-sm">
                        No link click data yet
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {top5Links.map((link, index) => (
                          <div
                            key={link.id}
                            className="p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-medium text-sm truncate flex-1">
                                {link.name}
                              </span>
                              <Badge
                                variant="outline"
                                className="whitespace-nowrap"
                              >
                                {link.clickRate.toFixed(1)}% CTR
                              </Badge>
                            </div>
                            <div className="flex gap-4">
                              <div className="flex items-center gap-1.5">
                                <Activity className="w-3.5 h-3.5 text-blue-500" />
                                <span className="text-xs">
                                  {link.views} views
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <MousePointer className="w-3.5 h-3.5 text-green-500" />
                                <span className="text-xs">
                                  {link.clicks} clicks
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Device & location cards */}
                <div className="space-y-6">
                  {/* Device distribution */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">
                        Device Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {analyticsData.deviceStats.length === 0 ? (
                        <div className="text-center py-6 text-gray-500 text-sm">
                          No device data available
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {analyticsData.deviceStats.map((device) => (
                            <div
                              key={device.name}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                  <device.icon className="w-4 h-4 text-gray-600" />
                                </div>
                                <span>{device.name}</span>
                              </div>
                              <span className="font-bold">{device.value}%</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Top locations */}
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Top Locations</CardTitle>
                        {analyticsData.locationData.length > 3 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-sm"
                            onClick={() => setActiveTab("audience")}
                          >
                            View all
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {analyticsData.locationData.length === 0 ? (
                        <div className="text-center py-6 text-gray-500 text-sm">
                          No location data available
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {top3Locations.map((location) => (
                            <div
                              key={location.country}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span>{location.country}</span>
                              </div>
                              <span className="font-medium">
                                {location.visits} visits
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="links">
              <Card>
                <CardHeader>
                  <CardTitle>Link Performance</CardTitle>
                  <CardDescription>
                    Track how your links are performing and which ones get the
                    most engagement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {analyticsData.topLinks.length === 0 ? (
                    <EmptyState
                      message="There is no link click data available for the selected time period."
                      icon={MousePointer}
                    />
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {analyticsData.topLinks.map((link, index) => (
                        <LinkPerformanceCard
                          key={link.id}
                          link={link}
                          index={index}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="audience">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Device Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Device Distribution</CardTitle>
                    <CardDescription>
                      What devices your visitors are using to view your profile
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {analyticsData.deviceStats.length === 0 ? (
                      <EmptyState
                        message="There is no device data available for the selected time period."
                        icon={Smartphone}
                      />
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {analyticsData.deviceStats.map((device) => (
                          <DeviceCard key={device.name} device={device} />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Geographic Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Geographic Distribution</CardTitle>
                    <CardDescription>
                      Where your visitors are located around the world
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {analyticsData.locationData.length === 0 ? (
                      <EmptyState
                        message="There is no location data available for the selected time period."
                        icon={Globe}
                      />
                    ) : (
                      <div className="space-y-5">
                        {analyticsData.locationData.map((location) => (
                          <LocationCard
                            key={location.country}
                            location={location}
                            maxVisits={maxLocationVisits}
                          />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};
