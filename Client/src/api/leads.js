import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;

export const updateLead = async (leadId, leadData) => {
    const response = await axios.put(`${API_URL}/api/v1/leads/${leadId}`, leadData);
    return response.data;
};