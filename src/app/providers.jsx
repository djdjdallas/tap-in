"use client";

import { useEffect } from "react";
import { initMobileDebugger } from "@/utils/mobileDebug";

export function Providers({ children }) {
  useEffect(() => {
    // Initialize mobile debugging in development or for testing
    if (
      process.env.NODE_ENV === "development" ||
      window.location.search.includes("debug=true")
    ) {
      initMobileDebugger();
    }
  }, []);

  return <>{children}</>;
}
