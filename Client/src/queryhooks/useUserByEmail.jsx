// src/queryhooks/useUserByEmail.js
import { useQuery } from '@tanstack/react-query';
import { fetchUserByEmail } from '../api/users'; // Ensure this path is correct

const useUserByEmail = (email) => { 
    const { data, isLoading, isError } = useQuery({
        queryKey: ['user', email],
        queryFn: () => fetchUserByEmail(email),
        enabled: !!email, // Only run query if email is provided
    });

    
    return { data, isLoading, isError };
};

export default useUserByEmail;
