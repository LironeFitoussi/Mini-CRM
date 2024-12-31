import axios from "axios";

export const fetchNotifications = async () => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/v1/notifications`
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

export const setNotificationAsRead = async (notificationId) => {
  try {
    await axios.patch(
      `${import.meta.env.VITE_API_URL}/api/v1/notifications/${notificationId}`
    );
  } catch (error) {
    console.error("Error setting notification as read:", error);
    throw error;
  }
};
