// src/api/users.js
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;

// Fetch users from the API
export const fetchUsers = async ({ page, limit, search }) => {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/users`, {
        params: { page, limit, search },
    });
    return response.data;
};

