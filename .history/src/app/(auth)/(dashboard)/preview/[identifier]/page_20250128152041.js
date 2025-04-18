// app/(auth)/(dashboard)/preview/[userId]/page.js
import { Suspense } from "react";
import { use } from "react";
import PreviewPage from "@/components/PreviewPage";

export default function Page({ params }) {
  const userId = use(params).userId;

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      }
    >
      <PreviewPage userId={userId} />
    </Suspense>
  );
}
