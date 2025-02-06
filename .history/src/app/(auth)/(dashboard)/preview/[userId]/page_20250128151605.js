// app/(auth)/(dashboard)/preview/[userId]/page.js
import PreviewPage from "@/components/PreviewPage";
export default function Page({ params }) {
  return <PreviewPage userId={params.userId} />;
}
