// queryhooks/useNotifications.js
import { useQuery } from '@tanstack/react-query';
import { fetchUsersDayliNotifications, setNotificationAsRead } from '../api/notifications';
import { useSelector } from "react-redux";

const useUserNotifications = () => {
    const {user} = useSelector((state) => state.user);
    
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['notifications'],
        queryFn: () => fetchUsersDayliNotifications(user._id),
        keepPreviousData: true, // To keep previous data while fetching new page
    });
    
    const notifications = data || [];
        
    return {
        notifications,
        isLoading,
        isError,
        refetch,
        setNotificationAsRead
    };
};

export default useUserNotifications;