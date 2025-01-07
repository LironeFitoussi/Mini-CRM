import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Navigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const getUser = async (email) => {
  try {
    const res = await axios.get(
      import.meta.env.VITE_API_URL + "/api/v1/users/me?email=" + email
    );
    return res.data;
  } catch (error) {
    // console.error("Error fetching user data:", error);
    throw error;
  }
};

const ProtectedRoute = ({ level, children }) => {
  const { isAuthenticated, user, isLoading: isAuthLoading } = useAuth0();
  const location = useLocation();

  const {
    data: userdata,
    isLoading: isLoadingUser,
    isError,
    error,
  } = useQuery({
    queryKey: ["userdata"],
    queryFn: () => getUser(user?.email),
    enabled: isAuthenticated && !!user?.email, // Ensure user and email are defined
    retry: false, // Disable retries
  });

  if (isAuthLoading || isLoadingUser) return <div>Loading...</div>;

  if (isError) {
    return (
      <div>
        <h1>Error</h1>
        <p>{error.message || "An error occurred while fetching user data."}</p>
      </div>
    );
  }

  if (isAuthenticated && userdata?.role !== "guest") {
    if (level === "admin" && (userdata?.role !== "admin" && userdata?.role !== "developer")) {
      return <Navigate to="/unauthorized" state={{ from: location }} replace />;
    }
    return children;
  } else if (isAuthenticated && userdata?.role === "guest") {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  } else {
    return <Navigate to="/" state={{ from: location }} replace />;
  }
};

export default ProtectedRoute;
