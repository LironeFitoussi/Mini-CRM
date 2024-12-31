import axios from "axios";

export const fetchUsersDayliNotifications = async (userId) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/v1/notifications/user/${userId}/day`
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

export const fetchAllNotifications = async () => {  
  // console.log("Fetching notifications");
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/v1/notifications`
    );
    
    // console.log(response.data);
    
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
