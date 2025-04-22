"use client";
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import AdminDashboard from "@/components/AdminDashboard";

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const checkUser = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Error checking auth:", error);
          router.push("/login");
          return;
        }

        if (!data.session) {
          // User is not logged in, redirect to login
          router.push("/login");
          return;
        }

        // User is authenticated
        setUser(data.session.user);
        setIsLoading(false);
      } catch (err) {
        console.error("Unexpected error:", err);
        setIsLoading(false);
      }
    };

    checkUser();
  }, [router, supabase]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  // If user is authenticated, show the dashboard
  if (user) {
    return (
      <div className="min-h-screen">
        <AdminDashboard user={user} />
      </div>
    );
  }

  // Fallback - should not normally be visible as router redirects should happen
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4">Please log in</h1>
      <button
        onClick={() => router.push("/login")}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
      >
        Go to Login
      </button>
    </div>
  );
}
