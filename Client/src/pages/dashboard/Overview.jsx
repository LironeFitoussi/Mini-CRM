// src/pages/dashboard/Overview.jsx
import React from "react";

// Components
import MainInfoContainer from "../../components/MainInfoContainer";

const DashboardOverview = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      < MainInfoContainer />

      {/* Recent Activities */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Activities</h2>
        <ul className="space-y-4">
          <li className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-500 font-bold">U</span>
            </div>
            <p className="text-gray-700">
              <span className="font-semibold">John Doe</span> signed up for an account.
            </p>
          </li>
          <li className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-green-500 font-bold">N</span>
            </div>
            <p className="text-gray-700">
              <span className="font-semibold">New Task</span> was created by Jane Smith.
            </p>
          </li>
          <li className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
              <span className="text-yellow-500 font-bold">R</span>
            </div>
            <p className="text-gray-700">
              <span className="font-semibold">Reminder</span>: Quarterly report due in 2 days.
            </p>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default DashboardOverview;
