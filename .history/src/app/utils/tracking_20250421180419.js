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
      // Suppress user-visible errors
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
      // Suppress user-visible errors
      console.warn("Error detecting device type:", error);
      return "unknown";
    }
  }
  return "unknown"; // Fallback for server-side rendering
};

// Safe error logging helper - only for console, not user-visible
const safeLogError = (error) => {
  // Create a safe error object with only string properties
  const safeError = {
    message: String(error.message || "Unknown error"),
    name: String(error.name || "Error"),
  };

  // Add any additional properties if they exist and are strings
  if (error.code) safeError.code = String(error.code);
  if (error.details) safeError.details = String(error.details);
  if (error.hint) safeError.hint = String(error.hint);

  return safeError;
};

// Track page view - silently handle errors
export const trackPageView = async (userId) => {
  // Only run in browser environment
  if (typeof window === "undefined") return;

  try {
    // Create the Supabase client inside the function
    const supabase = createClientComponentClient();

    if (!userId) {
      // Silent failure - just log to console
      console.warn("No userId provided for tracking page view");
      return;
    }

    // Debug log - only visible in console
    if (process.env.NODE_ENV === "development") {
      console.log("Tracking page view for user:", userId);
    }

    const payload = {
      user_id: userId,
      visitor_id: getVisitorId(),
      device_type: getDeviceType(),
      country: "Unknown",
      browser: navigator?.userAgent || "Unknown",
      timestamp: new Date().toISOString(),
    };

    // Only log in development
    if (process.env.NODE_ENV === "development") {
      console.log("Page view payload:", payload);
    }

    // Try the insert but don't show errors to users
    await supabase.from("page_views").insert({
      user_id: payload.user_id,
      visitor_id: payload.visitor_id,
      device_type: payload.device_type,
      country: payload.country,
      browser: payload.browser,
      timestamp: payload.timestamp,
    });

    // Success logging only in development
    if (process.env.NODE_ENV === "development") {
      console.log("Page view tracking attempted");
    }
  } catch (error) {
    // Only log errors to console, not to the user
    if (process.env.NODE_ENV === "development") {
      console.error(
        "Error tracking page view:",
        error?.message || "Unknown error"
      );
      if (error) {
        console.error("Error details:", JSON.stringify(safeLogError(error)));
      }
    }
  }
};

// Track link click - silently handle errors
export const trackLinkClick = async (userId, linkId) => {
  // Only run in browser environment
  if (typeof window === "undefined") return;

  try {
    // Create the Supabase client inside the function
    const supabase = createClientComponentClient();

    if (!userId || !linkId) {
      // Silent failure - just log to console
      console.warn("Missing userId or linkId for tracking link click");
      return;
    }

    // Debug log - only visible in console
    if (process.env.NODE_ENV === "development") {
      console.log("Tracking link click:", { userId, linkId });
    }

    const payload = {
      user_id: userId,
      link_id: linkId,
      visitor_id: getVisitorId(),
      device_type: getDeviceType(),
      country: "Unknown",
      timestamp: new Date().toISOString(),
    };

    // Only log in development
    if (process.env.NODE_ENV === "development") {
      console.log("Link click payload:", payload);
    }

    // Try the insert but don't show errors to users
    await supabase.from("link_clicks").insert({
      user_id: payload.user_id,
      link_id: payload.link_id,
      visitor_id: payload.visitor_id,
      device_type: payload.device_type,
      country: payload.country,
      timestamp: payload.timestamp,
    });

    // Success logging only in development
    if (process.env.NODE_ENV === "development") {
      console.log("Link click tracking attempted");
    }
  } catch (error) {
    // Only log errors to console, not to the user
    if (process.env.NODE_ENV === "development") {
      console.error(
        "Error tracking link click:",
        error?.message || "Unknown error"
      );
      if (error) {
        console.error("Error details:", JSON.stringify(safeLogError(error)));
      }
    }
  }
};
