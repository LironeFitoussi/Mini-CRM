// src/pages/Dashboard.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/userSlice";

// Auth0
import { useAuth0 } from "@auth0/auth0-react";
import useUserByEmail from "../queryhooks/useUserByEmail";

// Components
import Sidebar from "../components/Molecules/Sidebar.jsx";

const Dashboard = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
    error: authError,
  } = useAuth0();
  
  const { data: userData , isLoading: userLoading, isError:userError } = useUserByEmail(user?.email);

  // Set user data in Redux store
  React.useEffect(() => {
    if (userData) {
      dispatch(setUser(userData));
    }
  }, [userData, dispatch]);
  
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
