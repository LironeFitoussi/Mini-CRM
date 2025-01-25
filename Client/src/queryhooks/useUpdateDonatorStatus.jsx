// hooks/useUpdateDonatorStatus.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export const useUpdateDonatorStatus = ({ page, pageSize, search }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ donorId, newStatus }) => {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/v1/donors/${donorId}/status`,
        { status: newStatus }
      );
    },
    onMutate: async ({ donorId, newStatus }) => {
      // (Same as before) Optimistic update for the list query
      await queryClient.cancelQueries(["donors", page, pageSize, search]);
      const previousData = queryClient.getQueryData(["donors", page, pageSize, search]);

      // Update the list
      queryClient.setQueryData(["donors", page, pageSize, search], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          donors: oldData.donors.map((donor) =>
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
        queryClient.setQueryData(["donors", page, pageSize, search], context.previousData);
      }
      // Roll back the single if needed
      if (context?.previousSingle) {
        queryClient.setQueryData(["donator", donorId], context.previousSingle);
      }
    },
    onSettled: (_, __, { donorId }) => {
      // Invalidate both queries so they refetch fresh data
      queryClient.invalidateQueries(["donors"]);
      queryClient.invalidateQueries(["donator", donorId]);
    },
  });
};
