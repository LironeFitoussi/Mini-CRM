import React, { Suspense, startTransition } from "react";
import LoadingSpinner from "./components/Atoms/LoadingSpinner";

// Import components
import App from "./App.jsx";
import Home from "./pages/Home.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Profile from "./pages/Profile.jsx";
import NotFound from "./pages/NotFound.jsx";
import ProtectedRoute from "./components/Atoms/Protected.jsx";

// Lazy load components
const LeadsPage = React.lazy(() => import("./pages/dashboard/Leads.jsx"));
const Overview = React.lazy(() => import("./pages/dashboard/Overview.jsx"));
const DontaorsPage = React.lazy(() => import("./pages/dashboard/Donors.jsx"));
const ClientDetailsPage = React.lazy(() => import("./pages/dashboard/Donators/DonatorDetails.jsx"));
const NedarimClients = React.lazy(() => import("./pages/dashboard/NedarimClients.jsx"));
const AllodonClients = React.lazy(() => import("./pages/dashboard/AllodonClients.jsx"));
const DonationsPage = React.lazy(() => import("./pages/dashboard/Donations.jsx"));
const WhatsAppPage = React.lazy(() => import("./pages/dashboard/WhatsAppPage.jsx"));
const UsersPage = React.lazy(() => import("./pages/dashboard/Users.jsx"));
const SmsPage = React.lazy(() => import("./pages/dashboard/Sms.jsx"));

// Import the usersLoader function for prefetching data
import { usersLoader } from "./pages/dashboard/Users.jsx";

// Wrap component with Suspense and ProtectedRoute
const wrapRoute = (Component, level = "user") => (
  <ProtectedRoute level={level}>
    <Suspense fallback={<LoadingSpinner />}>
      <Component />
    </Suspense>
  </ProtectedRoute>
);

const router = [
  {
    path: "/",
    element: <App />,
    children: [
      { path: "/", element: <Home /> },
      {
        path: "dashboard",
        element: wrapRoute(Dashboard),
        children: [
          {
            index: true,
            element: wrapRoute(Overview)
          },
          {
            path: "donors",
            element: wrapRoute(DontaorsPage)
          },
          {
            path: "nedarim",
            element: wrapRoute(NedarimClients)
          },
          {
            path: "allodon",
            element: wrapRoute(AllodonClients)
          },
          {
            path: "donors/:id",
            element: wrapRoute(ClientDetailsPage)
          },
          {
            path: "allodon-clients/:id",
            element: wrapRoute(ClientDetailsPage)
          },
          {
            path: "leads",
            element: wrapRoute(LeadsPage)
          },
          {
            path: "donations",
            element: wrapRoute(DonationsPage)
          },
          {
            path: "whatsapp",
            element: wrapRoute(WhatsAppPage)
          },
          {
            path: "users",
            element: wrapRoute(UsersPage, "admin"),
            loader: usersLoader
          },
          {
            path: "sms",
            element: wrapRoute(SmsPage)
          }
        ]
      },
      {
        path: "profile",
        element: wrapRoute(Profile, "guest")
      },
      { path: "*", element: <NotFound /> }
    ]
  }
];

export default router;
