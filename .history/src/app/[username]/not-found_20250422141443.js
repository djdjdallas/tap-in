// src/app/[username]/not-found.js
import Link from "next/link";

export default function ProfileNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-gray-50 via-gray-100 to-gray-50 py-16 px-6">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg text-center">
        <h1 className="text-4xl font-bold mb-4">Profile Not Found</h1>
        <p className="text-gray-600 mb-8">
          The profile you're looking for doesn't exist or may have been moved.
        </p>
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Want to create your own tap-in profile?
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg transition-colors hover:bg-blue-700"
          >
            Sign Up
          </Link>
          <div className="mt-4">
            <Link href="/" className="text-blue-500 hover:underline">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
