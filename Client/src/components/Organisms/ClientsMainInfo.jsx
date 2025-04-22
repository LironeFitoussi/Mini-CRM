import { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import MainInfoCard from "../Atoms/MainInfoCard";
import axios from "axios";

const ClientsMainInfo = ({clientsData, platformFrom}) => {
  // console.log(clientsData);
  const [data, setData] = useState({ totalAmounts: {} });

  // console.log(platformFrom);
  

  useEffect(() => {
    const fetchLastMonthDonations = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/${platformFrom}/last-month-donations`);
        setData(response.data);
      } catch (error) {
        console.error('Error fetching last month donations:', error);
      }
    };

    fetchLastMonthDonations();
  }, []);

  // console.log(clientsData);
  return  (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MainInfoCard
          title="general.totalDonators"
          type="info"
          content={clientsData.totalDocuments || clientsData.length}
        />
        <MainInfoCard
          title="general.totalDonationsMonth"
          type="success"
          content={data.totalAmounts}
        />
    </div>
  );
};

ClientsMainInfo.propTypes = {
  clientsData: PropTypes.shape({
    totalItems: PropTypes.number.isRequired,
    totalDocuments: PropTypes.number.isRequired,
    length: PropTypes.number
  }).isRequired,
  platformFrom: PropTypes.string.isRequired
};

export default ClientsMainInfo;