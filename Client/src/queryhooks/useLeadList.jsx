import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

const fetchLeadList = async (leadListId) => {
  const response = await axios.get(
    `${import.meta.env.VITE_API_URL}/api/v1/leads/${leadListId}`
  );
  return response.data;
};

const useLeadList = (leadListId) => {
  const queryClient = useQueryClient();

  const leadListQuery = useQuery({
    queryKey: ["leadList", leadListId],
    queryFn: () => fetchLeadList(leadListId),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const { data, isLoading, isError, error } = leadListQuery;

  const invalidateLeadList = () => queryClient.invalidateQueries(["leadList"]);

  return { data, isLoading, isError, error, invalidateLeadList };
};

export default useLeadList;