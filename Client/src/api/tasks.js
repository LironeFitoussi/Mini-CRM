// src/api/tasks.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Fetch tasks from the API
export const fetchTasks = async () => {
    const response = await axios.get(`${API_URL}/api/v1/tasks`);
    return response.data.data;
};

// Update task status API call
export const updateTaskStatus = async ({ taskId, newStatus }) => {
    console.log(newStatus);
    
    const response = await axios.patch(`${API_URL}/api/v1/tasks/${taskId}/status`, {
        status: newStatus,
    });
    return response.data;
};
