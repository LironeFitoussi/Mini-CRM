import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-6xl font-bold text-blue-500">404</h1>
      <h2 className="text-2xl font-semibold text-gray-800 mt-4">
        Page Not Found
      </h2>
      <p className="text-gray-600 mt-2 text-center">
        The page you’re looking for doesn’t exist or has been moved.
      </p>
      <div className="mt-6 flex space-x-4">
        <Link
          to="/"
          className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Go to Home
        </Link>
        <Link
          to="/dashboard/overview"
          className="px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg shadow hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
