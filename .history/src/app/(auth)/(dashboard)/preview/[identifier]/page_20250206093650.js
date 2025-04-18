// app/(auth)/(dashboard)/preview/[identifier]/page.js
import { Suspense } from "react";
import { use } from "react";
import PreviewPage from "@/components/PreviewPage";

export default function Page({ params }) {
  const identifier = use(params).identifier;

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      }
    >
      <PreviewPage identifier={identifier} />
    </Suspense>
  );
}
