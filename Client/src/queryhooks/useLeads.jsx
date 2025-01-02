// src/queryhooks/useLeads.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const fetchLeads = async (searchTerm = '') => {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/leads`, {
        params: { search: searchTerm },
    });
    return response.data.data;
};

const createLead = async (newLead) => {
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/leads`, newLead);
    return response.data;
};

const useLeads = (searchTerm) => {
    const queryClient = useQueryClient();

    const leadsQuery = useQuery({
        queryKey: ['leads', searchTerm],
        queryFn: () => fetchLeads(searchTerm),
        staleTime: 5 * 60 * 1000,
        retry: 1,
    });

    const createLeadMutation = useMutation({
        mutationFn: createLead,
        onSuccess: () => {
            queryClient.invalidateQueries(['leads']);
        },
    });

    const { data, isLoading, isError, error } = leadsQuery;

    const invalidateLeads = () => queryClient.invalidateQueries(['leads']);

    return { 
        data, 
        isLoading, 
        isError, 
        error, 
        invalidateLeads,
        createLead: createLeadMutation 
    };
};

export default useLeads;
