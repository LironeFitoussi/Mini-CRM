import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Link } from "react-router-dom";

const Home = () => {
  const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-lg w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Welcome to the CRM
        </h1>
        <p className="text-gray-600 mb-6">
          {isAuthenticated
            ? `Hello, ${user?.name}! Explore your dashboard and profile below.`
            : "Please log in to access your account."}
        </p>

        <div className="flex justify-center gap-4">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow hover:bg-blue-600"
              >
                Dashboard
              </Link>
              <Link
                to="/profile"
                className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg shadow hover:bg-green-600"
              >
                Profile
              </Link>
              <button
                onClick={() =>
                  logout({
                    returnTo: window.location.origin,
                  })
                }
                className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow hover:bg-red-600"
              >
                Log Out
              </button>
            </>
          ) : (
            <button
              onClick={() => loginWithRedirect()}
              className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow hover:bg-blue-600"
            >
              Log In
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
