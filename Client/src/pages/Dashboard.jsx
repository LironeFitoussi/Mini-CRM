import React from "react";
import { Outlet } from "react-router-dom";
// Components
import Sidebar from "../components/Molecules/Sidebar.jsx";
const Dashboard = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="flex items-center justify-between px-6 py-4 bg-white shadow">
          <div className="text-lg font-semibold">Welcome to the Dashboard</div>
          <div>
            <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Add New
            </button>
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
{/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white p-4 shadow rounded">
              <h2 className="text-lg font-bold">Total Users</h2>
              <p className="text-2xl mt-2">1,234</p>
            </div>
            <div className="bg-white p-4 shadow rounded">
              <h2 className="text-lg font-bold">Total Sales</h2>
              <p className="text-2xl mt-2">$56,789</p>
            </div>
            <div className="bg-white p-4 shadow rounded">
              <h2 className="text-lg font-bold">Active Projects</h2>
              <p className="text-2xl mt-2">12</p>
            </div>
          </div>

          <div className="mt-6 bg-white p-4 shadow rounded">
            <h2 className="text-lg font-bold mb-4">Monthly Analytics</h2>
            <div className="h-64 bg-gray-200 rounded flex items-center justify-center">
              Chart Placeholder
            </div>
          </div> */}
