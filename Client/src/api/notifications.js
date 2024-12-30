import axios from 'axios';

export const fetchNotifications = async () => {
    try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/notifications`);

        console.log('Notifications:', response.data);
        
        return response.data;
    } catch (error) {
        console.error('Error fetching notifications:', error);
        throw error;
    }
};
