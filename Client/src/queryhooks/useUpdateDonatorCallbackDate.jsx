// hooks/useUpdateDonatorCallbackDate.js

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export function useUpdateDonatorCallbackDate({ page, pageSize, search }) {
  const queryClient = useQueryClient();

  return useMutation({
    // The actual API call:
    mutationFn: async ({ donorId, nextContactDate }) => {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/v1/donators/${donorId}/callback`,
        { nextContactDate }
      );
    },

    // Optimistic Update:
    onMutate: async ({ donorId, nextContactDate }) => {
      // 1) Cancel any outgoing refetches so we don’t overwrite our optimistic update
      await queryClient.cancelQueries({
        queryKey: ["donators", page, pageSize, search],
      });

      // 2) Snapshot the current data
      const prevData = queryClient.getQueryData([
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
                ? { ...donor, nextContactDate }
                : donor
            ),
          };
        }
      );

      // Return the snapshot in case we need to rollback onError
      return { prevData };
    },

    // Rollback if there's an error
    onError: (_error, _vars, context) => {
      if (context?.prevData) {
        queryClient.setQueryData(
          ["donators", page, pageSize, search],
          context.prevData
        );
      }
    },

    // Finally, refetch to ensure fresh data from the server
    onSettled: () => {
      queryClient.invalidateQueries(["donators"]);
    },
  });
}
