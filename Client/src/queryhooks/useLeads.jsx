// src/queryhooks/useLeads.js
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const fetchLeads = async () => {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/leads`);
    return response.data;
};

const useLeads = () => {
    return useQuery({
        queryKey: ['leads'],
        queryFn: fetchLeads,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 1,
    });
};

export default useLeads;
