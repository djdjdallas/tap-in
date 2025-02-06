// components/DashboardHeader.js
const DashboardHeader = ({ user, onSignOut, onShare }) => {
  return (
    <div className="p-8 bg-white border-b">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-600">Welcome, {user?.email}</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={onShare}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
            >
              Share Profile
            </button>
            <button
              onClick={onSignOut}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
