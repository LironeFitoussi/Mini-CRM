// src/queryClient.js
import { QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Customize default options here
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: 2, // Retry failed requests twice
      refetchOnWindowFocus: true, // Refetch on window focus
    },
  },
});

export default queryClient;
