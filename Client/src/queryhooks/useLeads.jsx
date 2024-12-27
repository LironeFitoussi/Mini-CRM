import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const fetchLeads = async () => {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/leads`);
    return response.data;
};

const createLead = async (newLead) => {
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/leads`, newLead);
    return response.data;
};

const useLeads = () => {
    const queryClient = useQueryClient();

    const leadsQuery = useQuery({
        queryKey: ['leads'],
        queryFn: fetchLeads,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 1,
    });

    const createLeadMutation = useMutation({
        mutationFn: createLead,
        onSuccess: (data) => {
            queryClient.invalidateQueries(['leads']); // Refresh leads on successful creation
        },
    });

    return { ...leadsQuery, createLead: createLeadMutation };
};

export default useLeads;
