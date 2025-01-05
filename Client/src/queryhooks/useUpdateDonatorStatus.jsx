// hooks/useUpdateDonatorStatus.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export const useUpdateDonatorStatus = ({ page, pageSize, search }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ donorId, newStatus }) => {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/v1/donators/${donorId}/status`,
        { status: newStatus }
      );
    },
    onMutate: async ({ donorId, newStatus }) => {
      // (Same as before) Optimistic update for the list query
      await queryClient.cancelQueries(["donators", page, pageSize, search]);
      const previousData = queryClient.getQueryData(["donators", page, pageSize, search]);

      // Update the list
      queryClient.setQueryData(["donators", page, pageSize, search], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          donators: oldData.donators.map((donor) =>
            donor._id === donorId ? { ...donor, status: newStatus } : donor
          ),
        };
      });

      // (Optional) Also update the single donator's cached data optimistically
      // if you know the single query key is ["donator", donorId].
      const previousSingle = queryClient.getQueryData(["donator", donorId]);
      queryClient.setQueryData(["donator", donorId], (oldDonator) => {
        if (!oldDonator) return oldDonator;
        return {
          ...oldDonator,
          status: newStatus,
        };
      });

      return { previousData, previousSingle };
    },
    onError: (_error, { donorId }, context) => {
      // Roll back the list if needed
      if (context?.previousData) {
        queryClient.setQueryData(["donators", page, pageSize, search], context.previousData);
      }
      // Roll back the single if needed
      if (context?.previousSingle) {
        queryClient.setQueryData(["donator", donorId], context.previousSingle);
      }
    },
    onSettled: (_, __, { donorId }) => {
      // Invalidate both queries so they refetch fresh data
      queryClient.invalidateQueries(["donators"]);
      queryClient.invalidateQueries(["donator", donorId]);
    },
  });
};
