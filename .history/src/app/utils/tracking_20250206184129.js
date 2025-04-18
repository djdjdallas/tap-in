// utils/tracking.js
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const supabase = createClientComponentClient();

// Generate a visitor ID
const getVisitorId = () => {
  let visitorId = localStorage.getItem("visitorId");
  if (!visitorId) {
    visitorId = Math.random().toString(36).substring(2, 15);
    localStorage.setItem("visitorId", visitorId);
  }
  return visitorId;
};

// Get device type
const getDeviceType = () => {
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
};

// Track page view
export const trackPageView = async (userId) => {
  try {
    const { error } = await supabase.from("page_views").insert({
      user_id: userId,
      visitor_id: getVisitorId(),
      device_type: getDeviceType(),
      country: "Unknown", // You can use a geolocation service here
      browser: navigator.userAgent,
    });

    if (error) throw error;
  } catch (error) {
    console.error("Error tracking page view:", error);
  }
};

// Track link click
export const trackLinkClick = async (userId, linkId) => {
  try {
    const { error } = await supabase.from("link_clicks").insert({
      user_id: userId,
      link_id: linkId,
      visitor_id: getVisitorId(),
      device_type: getDeviceType(),
      country: "Unknown", // You can use a geolocation service here
    });

    if (error) throw error;
  } catch (error) {
    console.error("Error tracking link click:", error);
  }
};
