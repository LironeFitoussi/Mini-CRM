// queryhooks/useNotifications.js
import { useQuery } from '@tanstack/react-query';
import { fetchNotifications } from '../api/notifications';

const useNotifications = () => {
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['notifications'],
        queryFn: fetchNotifications,
        keepPreviousData: true, // To keep previous data while fetching new page
    });
    
    const notifications = data || [];

    return {
        notifications,
        isLoading,
        isError,
        refetch,
    };
};

export default useNotifications;
