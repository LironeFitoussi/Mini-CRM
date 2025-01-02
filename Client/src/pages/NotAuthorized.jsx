// src/pages/NotAuthorized.jsx

import React from 'react';
import { Link } from 'react-router-dom';

const NotAuthorized = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md text-center">
        <h1 className="text-4xl font-bold text-red-500 mb-4">403</h1>
        <h2 className="text-2xl font-semibold mb-2">Not Authorized</h2>
        <p className="text-gray-700 mb-6">
          You do not have permission to access this page.
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors duration-300"
        >
          Go to Home
        </Link>
      </div>
    </div>
  );
};

export default NotAuthorized;
