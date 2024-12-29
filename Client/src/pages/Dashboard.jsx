// src/pages/Dashboard.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Auth0
import { useAuth0 } from "@auth0/auth0-react";

// TanStack Query v5
import { useQuery } from "@tanstack/react-query";

// Axios
import axios from "axios";

// Components
import Sidebar from "../components/Molecules/Sidebar.jsx";
import GlobatSearch from "../components/Atoms/GlobalSearch.jsx";

const Dashboard = () => {
  const { t } = useTranslation();
  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
    error: authError,
  } = useAuth0();

  // console.log(user.sub);

  // Function to fetch user data from your backend
  const fetchUserData = async () => {
    if (!user) throw new Error("User is not authenticated");

    // Construct the API URL using environment variables and user.sub
    const apiUrl = `${import.meta.env.VITE_API_URL}/api/v1/users/me?email=${
      user.email
    }`;

    try {
      const response = await axios.get(apiUrl);
      return response.data;
    } catch (error) {
      // Optionally, handle specific error scenarios here
      throw error;
    }
  };

  // Use TanStack Query v5 to fetch and cache user data
  const {
    data: userData,
    isLoading: userLoading,
    error: userError,
  } = useQuery({
    queryKey: ["user", user?.sub], // Unique query key
    queryFn: fetchUserData, // Fetch function
    enabled: isAuthenticated && !!user, // Only run if authenticated and user is available
    staleTime: 1000 * 60 * 5, // Data considered fresh for 5 minutes
    cacheTime: 1000 * 60 * 30, // Cache data for 30 minutes
    onSuccess: (data) => {
      console.log("Fetched User Data:", data);
    },
    onError: (error) => {
      console.error("Error fetching user data:", error);
    },
  });

  // Handle loading and error states
  if (authLoading || userLoading) {
    return <div>Loading...</div>;
  }

  if (authError) {
    return <div>Error loading authentication: {authError.message}</div>;
  }

  if (userError) {
    return <div>Error loading user data: {userError.message}</div>;
  }

  return (
    <div className="flex bg-gray-100" style={{ height: "100vh" }}>
      {/* Sidebar */}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <Sidebar />

        {/* Main Content */}
        <main className="p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
