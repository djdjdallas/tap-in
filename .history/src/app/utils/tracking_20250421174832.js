import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// Generate a visitor ID
const getVisitorId = () => {
  // Only try to access localStorage in the browser environment
  if (typeof window !== "undefined") {
    try {
      let visitorId = localStorage.getItem("visitorId");
      if (!visitorId) {
        visitorId = Math.random().toString(36).substring(2, 15);
        localStorage.setItem("visitorId", visitorId);
      }
      return visitorId;
    } catch (error) {
      console.warn("Error accessing localStorage:", error);
      return `fallback-${Math.random().toString(36).substring(2, 15)}`;
    }
  }
  return "server-render"; // Fallback for server-side rendering
};

// Get device type
const getDeviceType = () => {
  // Only access navigator in browser environment
  if (typeof window !== "undefined" && navigator) {
    try {
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
    } catch (error) {
      console.warn("Error detecting device type:", error);
      return "unknown";
    }
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

    console.log("Tracking page view for user:", userId);

    const { data, error } = await supabase
      .from("page_views")
      .insert({
        user_id: userId,
        visitor_id: getVisitorId(),
        device_type: getDeviceType(),
        country: "Unknown",
        browser: navigator.userAgent,
        timestamp: new Date().toISOString(),
      })
      .select();

    if (error) {
      console.error("Supabase insert error details:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      throw error;
    }

    console.log("Page view tracked successfully:", data);
  } catch (error) {
    // More detailed error logging
    console.error("Error tracking page view:", {
      message: error.message,
      name: error.name,
      stack: error.stack,
      cause: error.cause,
    });
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

    console.log("Tracking link click:", { userId, linkId });

    const { data, error } = await supabase
      .from("link_clicks")
      .insert({
        user_id: userId,
        link_id: linkId,
        visitor_id: getVisitorId(),
        device_type: getDeviceType(),
        country: "Unknown",
        timestamp: new Date().toISOString(),
      })
      .select();

    if (error) {
      console.error("Supabase insert error details:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      throw error;
    }

    console.log("Link click tracked successfully:", data);
  } catch (error) {
    // More detailed error logging
    console.error("Error tracking link click:", {
      message: error.message,
      name: error.name,
      stack: error.stack,
      cause: error.cause,
    });
  }
};
