import React from "react";
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
// Components
import Sidebar from "../components/Molecules/Sidebar.jsx";
const Dashboard = () => {
  const { t } = useTranslation();
  return (
    <div className="flex bg-gray-100" style={{ height: "95vh" }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="flex items-center justify-between px-6 py-4 bg-white shadow">
          <div className="text-lg font-semibold">
            <h1>{t("dashboardWelcome")}</h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
