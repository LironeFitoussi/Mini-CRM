import MainInfoCard from "./Atoms/MainInfoCard";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
const MainInfoContainer = () => {
  const fetchDashboardData = async () => {
    try {
      const res = await axios.get(
        import.meta.env.VITE_API_URL + "/api/v1/dashboard"
      );
      // console.log(res.data);
      
      return res.data;
    } catch (error) {
      throw error;
    }
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["dashboarddata"],
    queryFn: fetchDashboardData,
    retry: false,
  });
  
  if (isLoading) return <div>Loading...</div>;
  if (isError) {
    return (
      <div>
        <h1>Error</h1>
        <p>
          {error.message || "An error occurred while fetching dashboard data."}
        </p>
      </div>
    );
  }
  return (
    <>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Dashboard Overview
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MainInfoCard title="general.totalDonators" type="info" content={data.totalDonators} />
        <MainInfoCard title="general.totalDonationsMonth" type="success" content={data.totalDonations} />
        <MainInfoCard title="general.totalTasks" type="warning" content={data.totalTasks} />
        <MainInfoCard title="general.totalCriticalTasks" type="error" content={data.totalCriticalTasks} />
      </div>
    </>
  );
};

export default MainInfoContainer;
