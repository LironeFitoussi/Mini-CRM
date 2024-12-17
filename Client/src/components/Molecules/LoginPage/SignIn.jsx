import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useLocation } from 'react-router-dom';

const SignIn = () => {
  const { loginWithRedirect } = useAuth0();
  const location = useLocation();
  
  const handleLogin = () => {
    loginWithRedirect({
      appState: { returnTo: location.pathname },
    });
  };

  return (
    <form>
      <div className="mb-4">
        <label htmlFor="email" className="block text-gray-700 mb-2">
          Email
        </label>
        <input
          type="email"
          id="email"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Enter your email"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="password" className="block text-gray-700 mb-2">
          Password
        </label>
        <input
          type="password"
          id="password"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Enter your password"
        />
      </div>
      <button
        type="button"
        onClick={handleLogin}
        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        Sign In
      </button>
    </form>
  );
};

export default SignIn;
