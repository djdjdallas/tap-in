// src/contexts/AnalyticsContext.js
import { createContext, useContext, useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "sonner";

const AnalyticsContext = createContext();

export function AnalyticsProvider({ children, user }) {
  const supabase = createClientComponentClient();
  const [analytics, setAnalytics] = useState({
    totalViews: 0,
    totalClicks: 0,
    clickRate: "0%",
    activeLinks: 0,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let mounted = true;

    if (!user?.id) {
      setAnalytics((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    async function fetchAnalytics() {
      try {
        console.log("Fetching analytics for user:", user.id);

        // First, let's just get the links count since we know that table exists
        const { data: links, error: linksError } = await supabase
          .from("links")
          .select("id")
          .eq("user_id", user.id);

        if (linksError) {
          console.error("Links fetch error:", linksError);
          throw new Error(linksError.message);
        }

        // Try to fetch analytics data, but don't throw if the table doesn't exist
        const { data: summary, error: summaryError } = await supabase
          .from("analytics_summary")
          .select("*")
          .eq("user_id", user.id)
          .single();

        // Even if we get a summary error, we'll still show the links count
        if (summaryError) {
          console.log("Analytics summary not available:", summaryError);

          if (mounted) {
            setAnalytics({
              totalViews: 0,
              totalClicks: 0,
              clickRate: "0%",
              activeLinks: links?.length || 0,
              isLoading: false,
              error: null, // Don't set error since we have partial data
            });
          }
          return;
        }

        // If we have both links and analytics data
        if (mounted) {
          const summaryData = summary || { total_views: 0, total_clicks: 0 };
          const clickRate = summaryData.total_views
            ? (
                (summaryData.total_clicks / summaryData.total_views) *
                100
              ).toFixed(1)
            : 0;

          setAnalytics({
            totalViews: summaryData.total_views,
            totalClicks: summaryData.total_clicks,
            clickRate: `${clickRate}%`,
            activeLinks: links?.length || 0,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error("Error in analytics:", error);

        if (mounted) {
          setAnalytics((prev) => ({
            ...prev,
            isLoading: false,
            error: error.message,
          }));
        }
      }
    }

    // Set up real-time subscription only for links since we know that table exists
    const linksChannel = supabase
      .channel("links_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "links",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("Received links update:", payload);
          fetchAnalytics();
        }
      )
      .subscribe((status) => {
        console.log("Links subscription status:", status);
      });

    // Initial fetch
    fetchAnalytics();

    // Cleanup function
    return () => {
      mounted = false;
      console.log("Cleaning up analytics subscriptions");
      supabase.removeChannel(linksChannel);
    };
  }, [user?.id]);

  const getMetricValue = (metric) => {
    if (analytics.isLoading) return "Loading...";
    if (analytics.error && metric !== "activeLinks") return "N/A";

    switch (metric) {
      case "views":
        return analytics.totalViews.toLocaleString();
      case "clickRate":
        return analytics.clickRate;
      case "activeLinks":
        return `${analytics.activeLinks}/10`;
      default:
        return "0";
    }
  };

  return (
    <AnalyticsContext.Provider value={{ ...analytics, getMetricValue }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error("useAnalytics must be used within an AnalyticsProvider");
  }
  return context;
};
