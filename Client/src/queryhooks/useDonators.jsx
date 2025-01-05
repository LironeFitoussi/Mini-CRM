// hooks/useDonators.js

import { useQuery } from "@tanstack/react-query";

const fetchDonators = async ({ page, pageSize, search }) => {
  // Convert MUI's 0-based page to your API's 1-based if needed
  const params = new URLSearchParams({
    page: page + 1, // Because server expects page starting from 1
    limit: pageSize,
  });
  if (search) {
    params.append("search", search);
  }

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/v1/donators?${params.toString()}`
  );
  if (!response.ok) {
    throw new Error(`Error fetching donators: ${response.statusText}`);
  }

  const data = await response.json();
  return data; // { donators: [...], totalDocuments: number }
};

const useDonators = ({ page, pageSize, search }) => {
  return useQuery({
    // Use a stable key that includes your pagination/search state
    // so React Query can cache each combination of {page, pageSize, search}
    queryKey: ["donators", page, pageSize, search],
    queryFn: () => fetchDonators({ page, pageSize, search }),
    keepPreviousData: true, // Keep old data around while fetching new
  });
};

export default useDonators;