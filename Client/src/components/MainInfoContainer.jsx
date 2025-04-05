import { useState, useEffect } from "react";
import MainInfoCard from "./Atoms/MainInfoCard";
import axios from "axios";

const MainInfoContainer = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  // const [totalDonors, setTotalDonors] = useState([]);
  // const getDonatorsFromApi = async () => {
  //   const res = await axios.get(
  //     `${import.meta.env.VITE_API_URL}/api/v1/donors/unlimited`
  //   );

  //   setTotalDonors(res.data.length);
  // }

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/dashboard`
      );

      console.log(res.data);
      setData(res.data);
      setIsLoading(false);
    } catch (error) {
      setIsError(true);
      setErrorMessage(
        error.response?.data?.message ||
          "An error occurred while fetching dashboard data."
      );
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // getDonatorsFromApi();
  }, []); // Empty dependency array ensures this runs once on mount

  if (isLoading) return <div>Loading...</div>;

  if (isError) {
    return (
      <div>
        <h1>Error</h1>
        <p>{errorMessage}</p>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Dashboard Overview
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MainInfoCard
          title="general.totalDonators"
          type="info"
          content={data.totalDonors}
        />
        <MainInfoCard
          title="general.totalDonationsMonth"
          type="success"
          content={data.totalDonations}
        />
        <MainInfoCard
          title="general.totalCallback"
          type="warning"
          content={data.donatorsWithCallback}
        />
        <MainInfoCard
          title="general.totalLateCallback"
          type="error"
          content={data.totalDonatorsWithPassedCallback}
        />
      </div>
    </>
  );
};

export default MainInfoContainer;
