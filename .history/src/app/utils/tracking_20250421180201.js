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

// Safe error logging helper
const safeLogError = (error) => {
  // Create a safe error object with only string properties
  const safeError = {
    message: String(error.message || "Unknown error"),
    name: String(error.name || "Error"),
    stack: String(error.stack || ""),
  };

  // Add any additional properties if they exist and are strings
  if (error.code) safeError.code = String(error.code);
  if (error.details) safeError.details = String(error.details);
  if (error.hint) safeError.hint = String(error.hint);

  return safeError;
};

// Track page view
// Track page view - fixed version
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

    const payload = {
      // Change column name to match schema diagram exactly
      user_id: userId,
      visitor_id: getVisitorId(),
      device_type: getDeviceType(),
      country: "Unknown",
      browser: navigator?.userAgent || "Unknown",
      timestamp: new Date().toISOString(),
    };

    console.log("Page view payload:", payload);

    // Explicitly name columns in the insert to avoid ambiguity
    const { data, error } = await supabase.from("page_views").insert({
      user_id: payload.user_id,
      visitor_id: payload.visitor_id,
      device_type: payload.device_type,
      country: payload.country,
      browser: payload.browser,
      timestamp: payload.timestamp,
    });

    if (error) {
      console.error("Supabase insert error:", error.message);
      console.error("Full error object:", JSON.stringify(safeLogError(error)));
      return;
    }

    console.log("Page view tracked successfully");
  } catch (error) {
    // More detailed error logging
    console.error(
      "Error tracking page view:",
      error?.message || "Unknown error"
    );
    if (error) {
      console.error("Error details:", JSON.stringify(safeLogError(error)));
    }
  }
};

// Track link click - fixed version
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

    const payload = {
      user_id: userId,
      link_id: linkId,
      visitor_id: getVisitorId(),
      device_type: getDeviceType(),
      country: "Unknown",
      timestamp: new Date().toISOString(),
    };

    console.log("Link click payload:", payload);

    // Explicitly name columns in the insert to avoid ambiguity
    const { data, error } = await supabase.from("link_clicks").insert({
      user_id: payload.user_id,
      link_id: payload.link_id,
      visitor_id: payload.visitor_id,
      device_type: payload.device_type,
      country: payload.country,
      timestamp: payload.timestamp,
    });

    if (error) {
      console.error("Supabase insert error:", error.message);
      console.error("Full error object:", JSON.stringify(safeLogError(error)));
      return;
    }

    console.log("Link click tracked successfully");
  } catch (error) {
    // More detailed error logging
    console.error(
      "Error tracking link click:",
      error?.message || "Unknown error"
    );
    if (error) {
      console.error("Error details:", JSON.stringify(safeLogError(error)));
    }
  }
};
