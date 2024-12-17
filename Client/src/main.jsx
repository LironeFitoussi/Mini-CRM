import React from "react";
import { createRoot } from "react-dom/client";
import {
  Auth0Provider,
  useAuth0,
  withAuthenticationRequired,
} from "@auth0/auth0-react";
import {
  createBrowserRouter,
  RouterProvider,
  Route,
  Outlet,
  Navigate,
} from "react-router-dom";

import axios from "axios";
import App from "./App";
import "./index.css";

// Page components
import Profile from "./pages/Profile";
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";

// Dahsboard Subpages
import Overview from "./pages/dashboard/Overview.jsx";
import ClientPage from "./pages/dashboard/Clients.jsx";
import DonationsPage from "./pages/dashboard/Donations.jsx";
import EmailPage from "./pages/dashboard/Email.jsx";
import ClientDetailsPage from "./pages/dashboard/clients/ClientDetails.jsx";
import WhatsAppPage from "./pages/dashboard/Whatsapp.jsx";

const root = createRoot(document.getElementById("root"));

const NotFound = () => <h1>404 - Page Not Found</h1>;

// Protected Route Wrapper
const ProtectedRoute = ({ element }) => {
  const { isAuthenticated, loginWithRedirect } = useAuth0();

  // console.log(isAuthenticated);

  if (!isAuthenticated) {
    loginWithRedirect();
    return null; // Render nothing until redirect
  }

  return element;
};

// Router configuration
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // Base layout component
    children: [
      { path: "/", element: <Home /> }, // Home route
      {
        path: "/dashboard",
        element: <ProtectedRoute element={<Dashboard />} />, // Protected route for dashboard
        children: [
          {
            path: "overview",
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
      { path: "/login", element: <LoginPage /> }, // Login page
      { path: "*", element: <NotFound /> }, // Catch-all route for 404s
    ],
  },
]);

// Root rendering
root.render(
  <Auth0Provider
    domain={import.meta.env.VITE_AUTH0_DOMAIN}
    clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
    authorizationParams={{
      redirect_uri: window.location.origin,
      audience: import.meta.env.VITE_AUTH0_AUDIENCE, // Add if using API access
    }}
  >
    <RouterProvider router={router} />
  </Auth0Provider>
);
