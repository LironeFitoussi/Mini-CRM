// src/index.js

import React from "react";
import { createRoot } from "react-dom/client";
import {
  Auth0Provider,
  useAuth0,
} from "@auth0/auth0-react";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import App from "./App";
import "./index.css";

// Import i18n configuration
import './i18n.js';

// Page components
import Profile from "./pages/Profile";
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import NotAuthorized from "./pages/NotAuthorized";

// Dashboard Subpages
import Overview from "./pages/dashboard/Overview.jsx";
import ClientPage from "./pages/dashboard/Clients.jsx";
import DonationsPage from "./pages/dashboard/Donations.jsx";
import EmailPage from "./pages/dashboard/Email.jsx";
import ClientDetailsPage from "./pages/dashboard/clients/ClientDetails.jsx";
import WhatsAppPage from "./pages/dashboard/Whatsapp.jsx";

const root = createRoot(document.getElementById("root"));

const NotFound = () => <h1>404 - Page Not Found</h1>;

// Define allowed emails
const allowedEmails = [
  'lironefit@gmail.com',
  'user2@example.com',
  // Add more authorized emails here
];

// Protected Route Wrapper with Email-Based Authorization
const ProtectedRoute = ({ element }) => {
  const { isAuthenticated, isLoading, loginWithRedirect, user } = useAuth0();

  if (isLoading) {
    return <div>Loading...</div>; // Or a spinner
  }

  if (!isAuthenticated) {
    loginWithRedirect({
      appState: { returnTo: window.location.pathname },
    });
    return null; // Prevent rendering anything during redirect
  }

  if (!allowedEmails.includes(user.email)) {
    return <NotAuthorized />;
  }

  return element;
};

// Router configuration
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // Base layout component
    children: [
      { path: "/", element: <Home /> }, // Home route (unprotected)
      {
        path: "/dashboard",
        element: <ProtectedRoute element={<Dashboard />} />, // Protected route for dashboard
        children: [
          {
            // Default route for dashboard
            index: true,
            element: <ProtectedRoute element={<Overview />} />, // Overview route
          },
          {
            path: "clients",
            element: <ProtectedRoute element={<ClientPage />} />, // Clients route
            children: [
              {
                path: ":id",
                element: <ProtectedRoute element={<ClientDetailsPage />} />, // Client Details subpage
              },
            ],
          },
          {
            path: "donations",
            element: <ProtectedRoute element={<DonationsPage />} />, // Donations route
          },
          {
            path: "email",
            element: <ProtectedRoute element={<EmailPage />} />, // Email route
          },
          {
            path: "whatsapp",
            element: <ProtectedRoute element={<WhatsAppPage />} />, // WhatsApp route
          }
        ],
      },
      {
        path: "/profile",
        element: <ProtectedRoute element={<Profile />} />, // Protected route for profile
      },
      { path: "/login", element: <LoginPage /> }, // Login page (unprotected)
      { path: "*", element: <NotFound /> }, // Catch-all route for 404s
    ],
  },
]);

const onRedirectCallback = (appState) => {
  window.location.href = appState?.returnTo || window.location.pathname;
};

// Root rendering
root.render(
  <Auth0Provider
    domain={import.meta.env.VITE_AUTH0_DOMAIN}
    clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
    authorizationParams={{
      redirect_uri: window.location.origin,
      audience: import.meta.env.VITE_AUTH0_AUDIENCE, // Add if using API access
      scope: 'openid profile email', // Ensure 'email' scope is included
    }}
    cacheLocation="localstorage"
    onRedirectCallback={onRedirectCallback} // Preserve route
  >
    <RouterProvider router={router} />
  </Auth0Provider>
);
