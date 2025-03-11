import React from "react";

// Import components
import App from "./App.jsx";
import Home from "./pages/Home.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Profile from "./pages/Profile.jsx";
import NotFound from "./pages/NotFound.jsx";
import ProtectedRoute from "./components/Atoms/Protected.jsx";
const LeadsPage = React.lazy(() => import("./pages/dashboard/Leads.jsx"));

// Dashboard subpages
const Overview = React.lazy(() => import("./pages/dashboard/Overview.jsx"));
const DontaorsPage = React.lazy(() => import("./pages/dashboard/Donors.jsx"));
const ClientDetailsPage = React.lazy(() =>
  import("./pages/dashboard/Donators/DonatorDetails.jsx")
);
// Using the correct component names
const NedarimClients = React.lazy(() => import("./pages/dashboard/NedarimClients.jsx"));
const AllodonClients = React.lazy(() => import("./pages/dashboard/AllodonClients.jsx"));
const DonationsPage = React.lazy(() =>
  import("./pages/dashboard/Donations.jsx")
);
// const EmailPage = React.lazy(() => import("./pages/dashboard/Email.jsx"));
const WhatsAppPage = React.lazy(() =>
  import("./pages/dashboard/WhatsAppPage.jsx")
); // Added import


const UsersPage = React.lazy(() => import("./pages/dashboard/Users.jsx"));
// Import the usersLoader function for prefetching data
import { usersLoader } from "./pages/dashboard/Users.jsx";
const SmsPage = React.lazy(() => import("./pages/dashboard/Sms.jsx")); // Added import

const router = [
  {
    path: "/",
    element: <App />, // Base layout component
    children: [
      { path: "/", element: <Home /> }, // Home route (unprotected)
      {
        path: "dashboard",
        element: (
          <ProtectedRoute level="user">
            <Dashboard />
          </ProtectedRoute>
        ),
        // Protected route for dashboard
        children: [
          {
            // Default route for dashboard
            index: true,
            element: (
              <ProtectedRoute level="user">
                <Overview />
              </ProtectedRoute>
            ), // Overview route
          },
          {
            path: "donors",
            element: (
              <ProtectedRoute level="user">
                <DontaorsPage />
              </ProtectedRoute>
            )
          },
          {
            path: "nedarim",
            element: (
              <ProtectedRoute level="user">
                <NedarimClients />
              </ProtectedRoute>
            )
          },
          {
            path: "allodon",
            element: (
              <ProtectedRoute level="user">
                <AllodonClients />
              </ProtectedRoute>
            )
          },
          {
            path: "donors/:id",
            element: (
              <ProtectedRoute level="user">
                <ClientDetailsPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "allodon-clients/:id",
            element: (
              <ProtectedRoute level="user">
                <ClientDetailsPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "leads",
            element: (
              <ProtectedRoute level="user">
                <LeadsPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "donations",
            element: (
              <ProtectedRoute level="user">
                <DonationsPage />
              </ProtectedRoute>
            ), // Donations route
          },
          {
            path: "whatsapp",
            element: (
              <ProtectedRoute level="user">
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
            loader: usersLoader, // Add the loader for prefetching data
          },
          {
            path: "sms",
            element: (
              <ProtectedRoute level="user">
                <SmsPage />
              </ProtectedRoute>
            ), // SMS route
          },
        ],
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute level="guest">
            <Profile />
          </ProtectedRoute>
        ), // Protected route for profile
      },
      { path: "*", element: <NotFound /> }, // Catch-all route for 404s
    ],
  },
];

export default router;
