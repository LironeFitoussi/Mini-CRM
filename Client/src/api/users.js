// src/api/users.js
import axios from 'axios';

// Fetch users from the API
export const fetchUsers = async () => {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/users`);
    return response.data;
};

// Fetch a single user by Email
export const fetchUserByEmail = async (email) => {
    // console.log(email);
    
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/users/me?email=${email}`);    
    return response.data;
};
