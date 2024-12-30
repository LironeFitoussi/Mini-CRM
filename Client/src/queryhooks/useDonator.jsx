import { useQuery, useQueryClient } from "@tanstack/react-query";

const fetchDonator = async (id) => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/donators/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch client data");
  }
  return response.json();
};

export const useDonator = (id) => {
  const queryClient = useQueryClient();

  const queryResult = useQuery({
    queryKey: ["donator", id],
    queryFn: () => fetchDonator(id),
    staleTime: 5 * 60 * 1000, // Cache the data for 5 minutes
    retry: 2, // Retry failed requests up to 2 times
  });

  const invalidate = () => {
    queryClient.invalidateQueries(["donator", id]);
  };

  return {
    ...queryResult,
    invalidate,
  };
};
