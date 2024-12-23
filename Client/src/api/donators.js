import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

export const fetchDonators = async ({ page, limit, search }) => {
  const response = await axios.get(`${API_URL}/api/v1/donators`, {
    params: {
      page,
      limit,
      search,
    },
  });
  return response.data; // Ensure your API returns { donators, totalPages }
};

export const fetchDonatorById = async (donatorId) => {
  const response = await axios.get(`${API_URL}/api/v1/donators/${donatorId}`);
  return response.data;
};
