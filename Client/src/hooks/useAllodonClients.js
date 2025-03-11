import { useState, useEffect, useCallback } from 'react';
import debounce from 'lodash.debounce';

/**
 * Custom hook for fetching and managing Allodon clients data
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
  const [data, setData] = useState({
    clients: [],
    totalDocuments: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  // Fetch Allodon clients data
  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: paginationModel.page + 1, // Convert to 1-based for API
        limit: paginationModel.pageSize,
      });
      
      if (debouncedSearch) {
        params.append('search', debouncedSearch);
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/allodon/clients?${params.toString()}`
      );
      
      if (!response.ok) {
        throw new Error(`Error fetching Allodon clients: ${response.statusText}`);
      }

      const result = await response.json();
      setData({
        clients: result.clients,
        totalDocuments: result.totalDocuments,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [paginationModel.page, paginationModel.pageSize, debouncedSearch]);

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
      
      // Refetch clients after status update
      fetchClients();
    } catch (err) {
      setError(`Failed to update status: ${err.message}`);
    }
  }, [fetchClients]);

  // Fetch clients when dependencies change
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Cleanup debounce handler on unmount
  useEffect(() => {
    return () => {
      debouncedChangeHandler.cancel();
    };
  }, [debouncedChangeHandler]);

  return {
    searchQuery,
    data,
    loading,
    error,
    paginationModel,
    handleSearchChange,
    handlePageChange,
    handlePageSizeChange,
    handleStatusToggle,
    refetch: fetchClients,
  };
};

export default useAllodonClients; 