import React from "react";

// Import components
import App from "./App.jsx";
import Home from "./pages/Home.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Profile from "./pages/Profile.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import NotFound from "./pages/NotFound.jsx";
import ProtectedRoute from "./components/Atoms/Protected.jsx";

// Dashboard subpages
import Overview from "./pages/dashboard/Overview.jsx";
import DontaorsPage from "./pages/dashboard/Donators.jsx"; // Added import
import ClientDetailsPage from "./pages/dashboard/clients/ClientDetails.jsx"; // Added import
import DonationsPage from "./pages/dashboard/Donations.jsx";
import EmailPage from "./pages/dashboard/Email.jsx";
import WhatsAppPage from "./pages/dashboard/WhatsApp.jsx"; // Added import
import UsersPage from "./pages/dashboard/Users.jsx";

const router = [
  {
    path: "/",
    element: <App />, // Base layout component
    children: [
      { path: "/", element: <Home /> }, // Home route (unprotected)
      {
        path: "dashboard",
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
         // Protected route for dashboard
        children: [
          {
            // Default route for dashboard
            index: true,
            element: (
              <ProtectedRoute>
                <Overview />
              </ProtectedRoute>
            ), // Overview route
          },
          {
            path: "donators",
            element: (
              <ProtectedRoute>
                <DontaorsPage />
              </ProtectedRoute>
            ), // Clients route
            children: [
              {
                path: ":id",
                element: (
                  <ProtectedRoute>
                    <ClientDetailsPage />
                  </ProtectedRoute>
                ), // Client Details subpage
              },
            ],
          },
          {
            path: "donations",
            element: (
              <ProtectedRoute>
                <DonationsPage />
              </ProtectedRoute>
            ), // Donations route
          },
          {
            path: "email",
            element: (
              <ProtectedRoute>
                <EmailPage />
              </ProtectedRoute>
            ), // Email route
          },
          {
            path: "whatsapp",
            element: (
              <ProtectedRoute>
                <WhatsAppPage />
              </ProtectedRoute>
            ), // WhatsApp route
          },
          {
            path: "users",
            element: (
              <ProtectedRoute level="admin">
                <UsersPage />
              </ProtectedRoute>
            ), // Users route (admin only)
          }
        ],
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ), // Protected route for profile
      },
      { path: "login", element: <LoginPage /> }, // Login page (unprotected)
      { path: "*", element: <NotFound /> }, // Catch-all route for 404s
    ],
  },
];

export default router;
