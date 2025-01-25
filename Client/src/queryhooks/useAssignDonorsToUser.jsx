// src/queryhooks/useAssignDonorsToUser.js
import { useMutation } from 'react-query';
import axios from 'axios';

const assignDonorsToUser = async ({ userId, donorId }) => {
    if (!userId || !donorId || donorIds.length === 0) {
        throw new Error('Invalid data: userId and donorIds are required');
    }

    const response = await axios.post(import.meta.env.VITE_API_URL + `/api/v1/donors/${donorId}/owner`, {
        owner: userId,
    });

    return response.data;
};

const useAssignDonorsToUser = () => {
    return useMutation(assignDonorsToUser, {
        onError: (error) => {
            console.error('Error assigning donors to user:', error);
        },
        onSuccess: (data) => {
            console.log('Successfully assigned donors to user:', data);
        },
    });
};

export default useAssignDonorsToUser;
