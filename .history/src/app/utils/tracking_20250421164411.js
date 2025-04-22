import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// Generate a visitor ID
const getVisitorId = () => {
  // Only try to access localStorage in the browser environment
  if (typeof window !== "undefined") {
    let visitorId = localStorage.getItem("visitorId");
    if (!visitorId) {
      visitorId = Math.random().toString(36).substring(2, 15);
      localStorage.setItem("visitorId", visitorId);
    }
    return visitorId;
  }
  return "server-render"; // Fallback for server-side rendering
};

// Get device type
const getDeviceType = () => {
  // Only access navigator in browser environment
  if (typeof window !== "undefined" && navigator) {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return "tablet";
    }
    if (
      /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
        ua
      )
    ) {
      return "mobile";
    }
    return "desktop";
  }
  return "unknown"; // Fallback for server-side rendering
};

// Track page view
export const trackPageView = async (userId) => {
  // Only run in browser environment
  if (typeof window === "undefined") return;

  try {
    // Create the Supabase client inside the function
    const supabase = createClientComponentClient();

    if (!userId) {
      console.warn("No userId provided for tracking page view");
      return;
    }

    const { error } = await supabase.from("page_views").insert({
      user_id: userId,
      visitor_id: getVisitorId(),
      device_type: getDeviceType(),
      country: "Unknown", // You can use a geolocation service here
      browser: navigator.userAgent,
      timestamp: new Date().toISOString(),
    });

    if (error) throw error;
  } catch (error) {
    console.error("Error tracking page view:", error);
  }
};

// Track link click
export const trackLinkClick = async (userId, linkId) => {
  // Only run in browser environment
  if (typeof window === "undefined") return;

  try {
    // Create the Supabase client inside the function
    const supabase = createClientComponentClient();

    if (!userId || !linkId) {
      console.warn("Missing userId or linkId for tracking link click");
      return;
    }

    const { error } = await supabase.from("link_clicks").insert({
      user_id: userId,
      link_id: linkId,
      visitor_id: getVisitorId(),
      device_type: getDeviceType(),
      country: "Unknown",
      timestamp: new Date().toISOString(),
    });

    if (error) throw error;
  } catch (error) {
    console.error("Error tracking link click:", error);
  }
};
