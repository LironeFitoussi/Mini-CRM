// src/hooks/useAllNotifications.js
import { useQuery } from '@tanstack/react-query';
import { fetchAllNotifications } from '../api/notifications';

const useAllNotifications = () => {
    console.log("useAllNotifications Hook Called");

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['notifications'],
        queryFn: () => {
            console.log("useQuery: Calling fetchAllNotifications");
            return fetchAllNotifications();
        },
    });

    const notifications = data || [];

    return {
        notifications,
        isLoading,
        isError,
        refetch,
    };
};

export default useAllNotifications;
