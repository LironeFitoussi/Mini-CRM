// ./components/Atoms/Protected.jsx
import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Navigate, useLocation } from "react-router-dom";

const allowedEmails = [
  'lironefit@gmail.com',
  'user2@example.com',
  // Add more authorized emails here
];

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuth0();
  const location = useLocation();

  if (isLoading) return <div>Loading...</div>;

  if (isAuthenticated && allowedEmails.includes(user.email)) {
    return children;
  } else {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
};

export default ProtectedRoute;
