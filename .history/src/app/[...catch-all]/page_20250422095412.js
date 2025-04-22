"use client";

import { useEffect } from "react";
import { notFound } from "next/navigation";

// This catch-all route will handle any paths that aren't explicitly defined
// and redirect to the not-found page
export default function CatchAllRoute() {
  useEffect(() => {
    // We use useEffect to ensure this runs client-side only
    notFound();
  }, []);

  // Provide a fallback for server-side rendering
  return null;
}
