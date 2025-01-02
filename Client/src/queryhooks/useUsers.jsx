// src/queryhooks/useUsers.js
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { fetchUsers } from '../api/users'; // Ensure this path is correct

const useUsers = ({ initialPage = 1, limit = 10, search = '' }) => {
    const [currentPage, setCurrentPage] = useState(initialPage);

    const { data, isLoading, isError } = useQuery({
        queryKey: ['users', currentPage, limit, search],
        queryFn: () => fetchUsers({ page: currentPage, limit, search }),
        keepPreviousData: true, // To prevent loading states during pagination
    });

    const users = data?.users || [];
    const totalPages = data?.totalPages || 1;

    // console.log('Fetched Users:', users);

    return {
        users,
        currentPage,
        totalPages,
        setPage: setCurrentPage,
        isLoading,
        isError,
    };
};

export default useUsers;
