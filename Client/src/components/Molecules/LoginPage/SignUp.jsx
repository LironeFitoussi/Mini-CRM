import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

const SignUp = () => {
  const { loginWithRedirect } = useAuth0();

  return (
    <form>
      <div className="mb-4">
        <label htmlFor="name" className="block text-gray-700 mb-2">
          Name
        </label>
        <input
          type="text"
          id="name"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Enter your name"
        />
      </div>
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
          placeholder="Create a password"
        />
      </div>
      <button
        type="button"
        onClick={() => loginWithRedirect({ screen_hint: "signup" })}
        className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
      >
        Sign Up
      </button>
    </form>
  );
};

export default SignUp;
