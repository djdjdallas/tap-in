// app/page.js
import Profile from "@/components/Profile";
import LinkContainer from "@/components/LinkContainer";
import { getData } from "@/lib/data";

// page.js
export function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-tr from-gray-100 via-gray-50 to-gray-100 py-16 px-6">
      <div className="max-w-2xl mx-auto space-y-12">
        <Profile />
        <LinkContainer />
      </div>
    </main>
  );
}

export default HomePage;
