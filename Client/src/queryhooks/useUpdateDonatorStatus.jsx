// hooks/useUpdateDonatorStatus.js

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export const useUpdateDonatorStatus = ({ page, pageSize, search }) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ donorId, newStatus }) => {
      // The actual API call
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/v1/donators/${donorId}/status`,
        { status: newStatus }
      );
    },
    // Optimistic Update
    onMutate: async ({ donorId, newStatus }) => {
      // 1) Cancel any outgoing refetches (so they don’t overwrite our optimistic update)
      await queryClient.cancelQueries({
        queryKey: ["donators", page, pageSize, search],
      });

      // 2) Snapshot the current data
      const previousData = queryClient.getQueryData([
        "donators",
        page,
        pageSize,
        search,
      ]);

      // 3) Optimistically update the cache
      queryClient.setQueryData(
        ["donators", page, pageSize, search],
        (oldData) => {
          if (!oldData) return oldData; // safety check
          return {
            ...oldData,
            donators: oldData.donators.map((donor) =>
              donor._id === donorId
                ? { ...donor, status: newStatus }
                : donor
            ),
          };
        }
      );

      // Return the snapshot so we can rollback if there’s an error
      return { previousData };
    },
    onError: (_error, _variables, context) => {
      // Roll back if the mutation fails
      if (context?.previousData) {
        queryClient.setQueryData(
          ["donators", page, pageSize, search],
          context.previousData
        );
      }
    },
    onSettled: () => {
      // Finally, refetch to ensure data is in sync with server
      queryClient.invalidateQueries(["donators"]);
    },
  });
};
