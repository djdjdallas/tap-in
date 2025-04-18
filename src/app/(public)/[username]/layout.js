// app/(public)/[username]/layout.js
import { Toaster } from "sonner";

export const metadata = {
  title: "Profile | tap-in.io",
  description: "Connect with me on tap-in.io",
  openGraph: {
    title: "My tap-in.io Profile",
    description: "Connect with me on tap-in.io",
    type: "profile",
    images: ["/api/og"],
  },
};

export default function ProfileLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-tr from-gray-50 via-gray-100 to-gray-50">
      <main className="container mx-auto px-4 py-8">
        {children}
        <Toaster />
      </main>
      <footer className="py-4 text-center text-sm text-gray-500">
        <a href="/" className="hover:text-gray-700">
          ⚡️ Create your own tap-in.io profile
        </a>
      </footer>
    </div>
  );
}
