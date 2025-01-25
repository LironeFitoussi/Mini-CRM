import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

export const fetchDonators = async ({ page, limit, search }) => {

  // console.log('fetchDonators', page, limit, search);
  
  const response = await axios.get(`${API_URL}/api/v1/donors`, {
    params: {
      page,
      limit,
      search,
    },
  });
  return response.data; // Ensure your API returns { do, totalPages }
};

export const fetchDonatorById = async (donatorId) => {
  const response = await axios.get(`${API_URL}/api/v1/donors/${donatorId}`);
  return response.data;
};
