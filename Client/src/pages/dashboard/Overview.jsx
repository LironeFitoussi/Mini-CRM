import React from "react";

const DashboardOverview = () => {
  const metrics = [
    { title: "Total Users", value: 1542, color: "bg-blue-500" },
    { title: "New Signups", value: 84, color: "bg-green-500" },
    { title: "Active Sessions", value: 241, color: "bg-yellow-500" },
    { title: "Pending Tasks", value: 12, color: "bg-red-500" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard Overview</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg shadow-md text-white ${metric.color}`}
          >
            <h2 className="text-xl font-semibold">{metric.title}</h2>
            <p className="text-3xl font-bold mt-2">{metric.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Activities */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Activities</h2>
        <ul className="space-y-4">
          <li className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-500 font-bold">U</span>
            </div>
            <p className="text-gray-700">
              <span className="font-semibold">John Doe</span> signed up for an
              account.
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
              <span className="font-semibold">Reminder</span>: Quarterly report due in 2
              days.
            </p>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default DashboardOverview;
