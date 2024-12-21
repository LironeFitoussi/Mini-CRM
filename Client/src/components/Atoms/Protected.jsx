// ./components/Atoms/Protected.jsx
import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Navigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const getUser = async () => {
  const { data } = await axios.get(import.meta.env.VITE_API_URL + "/api/v1/users/me", {
    params: {
      email: user.email,
    },
  });
  return data;
}
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuth0();
  const location = useLocation();

  const { data: userdata, isLoadingUser } = useQuery({
    queryKey: ["user"],
    queryFn: () => getUser(user),
    enabled: isAuthenticated,
  });

  if (isLoading) return <div>Loading...</div>;

  if (isAuthenticated) {
    return children;
  } else {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
};

export default ProtectedRoute;
