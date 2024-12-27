// queryhooks/useDonators.js
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { fetchDonators } from '../api/donators';

const useDonators = ({ initialPage = 1, limit = 10, search = '' }) => {
    const [currentPage, setCurrentPage] = useState(initialPage);

    // console.log(initialPage, limit, search);
    
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['donators', currentPage, limit, search],
        queryFn: () => fetchDonators({ page: currentPage, limit, search }),
        keepPreviousData: true, // To prevent loading states during pagination
    });

    const donators = data?.donators || [];
    const totalPages = data?.totalPages || 1;

    // console.log(donators);
    
    return {
        donators,
        currentPage,
        totalPages,
        setPage: setCurrentPage,
        isLoading,
        isError,
        refetch,
    };
};

export default useDonators;
