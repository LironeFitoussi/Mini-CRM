import { useState, useEffect, useCallback, useMemo } from 'react';
import debounce from 'lodash.debounce';

/**
 * Custom hook for fetching and managing Allodon clients data
 * Uses client-side pagination for better performance
 * 
 * @param {Object} initialPagination - Initial pagination settings
 * @param {number} initialPagination.page - Initial page number (0-based)
 * @param {number} initialPagination.pageSize - Initial page size
 * @returns {Object} Hook state and handlers
 */
const useAllodonClients = (initialPagination = { page: 0, pageSize: 25 }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [paginationModel, setPaginationModel] = useState(initialPagination);
  const [allClients, setAllClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Memoized function to filter and paginate data client-side
  const paginatedData = useMemo(() => {
    let filteredData = allClients;
    
    // Apply search filter if exists
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      filteredData = allClients.filter(client => {
        // Adjust these fields based on your actual client object structure
        return (
          (client.name && client.name.toLowerCase().includes(searchLower)) ||
          (client.email && client.email.toLowerCase().includes(searchLower)) ||
          (client.phone && client.phone.includes(debouncedSearch)) ||
          (client.clientId && client.clientId.includes(debouncedSearch))
        );
      });
    }
    
    // Apply pagination
    const startIndex = paginationModel.page * paginationModel.pageSize;
    const endIndex = startIndex + paginationModel.pageSize;
    
    return {
      clients: filteredData.slice(startIndex, endIndex),
      totalDocuments: filteredData.length
    };
  }, [allClients, debouncedSearch, paginationModel.page, paginationModel.pageSize]);

  // Set up debounced search handler
  const debouncedChangeHandler = useCallback(
    debounce((value) => {
      const trimmed = value.replace(/^0+/, '').trim();
      setDebouncedSearch(trimmed);
      setPaginationModel((prev) => ({ ...prev, page: 0 }));
    }, 500),
    []
  );

  // Handle search input changes
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    debouncedChangeHandler(e.target.value);
  };

  // Fetch all Allodon clients data
  const fetchAllClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      
      if (debouncedSearch) {
        params.append('search', debouncedSearch);
      }

      // Use a large limit to fetch all clients at once
      params.append('limit', '10000');

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/allodon/clients?${params.toString()}`
      );
      
      if (!response.ok) {
        throw new Error(`Error fetching Allodon clients: ${response.statusText}`);
      }

      const result = await response.json();
      setAllClients(result.clients);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  // Handle pagination changes
  const handlePageChange = useCallback((newPage) => {
    setPaginationModel((prev) => ({ ...prev, page: newPage }));
  }, []);

  const handlePageSizeChange = useCallback((newPageSize) => {
    setPaginationModel({ page: 0, pageSize: newPageSize });
  }, []);

  // Handle client status toggle
  const handleStatusToggle = useCallback(async (clientId, newStatus) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/allodon/clients/${clientId}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      
      if (!response.ok) {
        throw new Error(`Error updating status: ${response.statusText}`);
      }
      
      // Update the client's status locally in the cached data
      setAllClients(prevClients => 
        prevClients.map(client => 
          client._id === clientId 
            ? { ...client, status: newStatus } 
            : client
        )
      );
    } catch (err) {
      setError(`Failed to update status: ${err.message}`);
    }
  }, []);

  // Fetch clients when dependencies change
  useEffect(() => {
    fetchAllClients();
  }, [fetchAllClients]);

  // Cleanup debounce handler on unmount
  useEffect(() => {
    return () => {
      debouncedChangeHandler.cancel();
    };
  }, [debouncedChangeHandler]);

  return {
    searchQuery,
    data: paginatedData,
    loading,
    error,
    paginationModel,
    handleSearchChange,
    handlePageChange,
    handlePageSizeChange,
    handleStatusToggle,
    refetch: fetchAllClients,
  };
};

export default useAllodonClients; 