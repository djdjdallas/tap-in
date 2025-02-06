import Image from "next/image";

export default function Profile() {
  return (
    <div className="text-center space-y-4">
      {/* Profile Image with gradient border */}
      <div className="relative w-32 h-32 mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-full animate-spin-slow"></div>
        <div className="absolute inset-[3px] bg-white rounded-full overflow-hidden">
          <img
            src="/api/placeholder/128/128"
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Name and Title */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-800">Dominick</h1>
        <p className="text-gray-600">Digital Creator | App Developer</p>
      </div>

      {/* Status Pills */}
      <div className="flex items-center justify-center gap-3">
        <span className="px-4 py-1.5 bg-white shadow-sm rounded-full text-sm text-gray-700 flex items-center gap-2">
          <span className="text-red-500">📍</span> Bangkok, TH
        </span>
        <span className="px-4 py-1.5 bg-white shadow-sm rounded-full text-sm text-gray-700 flex items-center gap-2">
          <span>💼</span> Available for work
        </span>
      </div>
    </div>
  );
}
