// src/hooks/useDonatorNotifications.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

/**
 * Custom hook to manage donator notifications, including fetching, creating, and updating notifications.
 *
 * @param {string} donatorId - The ID of the donator.
 * @returns {Object} - Contains notifications data, loading and error states, and mutation functions.
 */
const useDonatorNotifications = (donatorId) => {
  const queryClient = useQueryClient();
  const apiUrl = import.meta.env.VITE_API_URL;

  // **1. Fetch Notifications**
  const fetchNotifications = async () => {
    const response = await axios.get(`${apiUrl}/api/v1/notifications/donor/${donatorId}`);
    return response.data;
  };

  const {
    data: notifications = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["notifications", donatorId],
    queryFn: fetchNotifications,
    enabled: !!donatorId, // Only run the query if donatorId is provided
    staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
    cacheTime: 10 * 60 * 1000, // Cache data for 10 minutes
    refetchOnWindowFocus: false, // Disable refetch on window focus
  });

  // **2. Create Notification Mutation**
  const createNotificationMutation = useMutation({
    mutationFn: async (newNotification) => {
      const response = await axios.post(`${apiUrl}/api/v1/notifications`, newNotification);
      return response.data;
    },
    onMutate: async (newNotification) => {
      await queryClient.cancelQueries({ queryKey: ["notifications", donatorId] });

      const previousNotifications = queryClient.getQueryData(["notifications", donatorId]);

      queryClient.setQueryData(["notifications", donatorId], (old) => [
        ...old,
        { ...newNotification, id: Date.now(), archived: false }, // Temporary ID
      ]);

      return { previousNotifications };
    },
    onError: (err, newNotification, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(["notifications", donatorId], context.previousNotifications);
      }
      // Optionally, you can handle the error further here
      console.error("Failed to create notification:", err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", donatorId] });
    },
    // You can add onSuccess if you need to perform actions after a successful mutation
  });

  // **3. Toggle Archived Status Mutation**
  const toggleArchivedMutation = useMutation({
    mutationFn: async ({ id, archived }) => {
      const response = await axios.patch(`${apiUrl}/api/v1/notifications/toggle-archived/${id}`, {
        archived: !archived,
      });
      return response.data;
    },
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ["notifications", donatorId] });

      const previousNotifications = queryClient.getQueryData(["notifications", donatorId]);

      queryClient.setQueryData(["notifications", donatorId], (old) =>
        old.map((notif) =>
          notif.id === id ? { ...notif, archived: !notif.archived } : notif
        )
      );

      return { previousNotifications };
    },
    onError: (err, variables, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(["notifications", donatorId], context.previousNotifications);
      }
      // Optionally, you can handle the error further here
      console.error("Failed to update notification:", err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", donatorId] });
    },
    // You can add onSuccess if you need to perform actions after a successful mutation
  });

  // **4. Invalidation Function**
  const invalidateNotifications = () => {
    queryClient.invalidateQueries({ queryKey: ["notifications", donatorId] });
  };

  return {
    notifications,
    isLoading,
    isError,
    error,
    createNotification: createNotificationMutation.mutateAsync,
    toggleArchived: toggleArchivedMutation.mutateAsync,
    invalidateNotifications,
  };
};

export default useDonatorNotifications;
