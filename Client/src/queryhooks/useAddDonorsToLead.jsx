// src/queryhooks/useAddDonorsToLead.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const addDonorsToLead = async ({ leadId, donorIds }) => {
    console.log(donorIds);
    
    const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/leads/${leadId}/donors`,
        { donorIds }
    );
    return response.data;
};

const useAddDonorsToLead = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: addDonorsToLead,
        onSuccess: () => {
            // Invalidate and refetch leads data
            queryClient.invalidateQueries(['leads']);
            // Optionally, invalidate other queries related to donors if needed
        },
        onError: (error) => {
            // Optional: Handle error globally or here
            console.error('Error adding donors to lead:', error);
        },
    });
};

export default useAddDonorsToLead;
