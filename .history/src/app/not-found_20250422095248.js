// app/not-found.js
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-gray-50 via-gray-100 to-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-6">Profile Not Found</h2>
        <p className="text-gray-600 mb-8">
          We couldn't find the profile you're looking for. It may have been
          moved or doesn't exist.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg transition-colors hover:bg-blue-700"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
