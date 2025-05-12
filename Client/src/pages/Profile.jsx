import { useAuth0 } from "@auth0/auth0-react";

const Profile = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth0();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg font-semibold text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg font-semibold text-red-600">
          You are not authenticated. Please log in.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md text-center">
        {/* Profile Picture */}
        <img
          src={user.picture}
          alt={`${user.name}'s avatar`}
          className="w-24 h-24 rounded-full mx-auto mb-4 border-2 border-gray-300"
        />

        {/* User Info */}
        <h2 className="text-2xl font-semibold text-gray-800">{user.name}</h2>
        <p className="text-gray-600">{user.email}</p>

        {/* Logout Button */}
        <button
          className="mt-4 px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
          onClick={() =>
            logout({
              returnTo: window.location.origin, // Redirect to home after logout
            })
          }
        >
          Log Out
        </button>
      </div>

      {/* Raw JSON Data */}
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl mt-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          User Information
        </h3>
        <pre className="bg-gray-100 p-4 rounded-lg text-sm text-gray-700 overflow-x-auto">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default Profile;
