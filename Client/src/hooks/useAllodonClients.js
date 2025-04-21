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
        // Search across all relevant fields
        return (
          (client.fName && client.fName.toLowerCase().includes(searchLower)) ||
          (client.lName && client.lName.toLowerCase().includes(searchLower)) ||
          (client.email_1?.email && client.email_1.email.toLowerCase().includes(searchLower)) ||
          (client.email && client.email.toLowerCase().includes(searchLower)) ||
          (client.phone_number_1?.number && client.phone_number_1.number.includes(debouncedSearch)) ||
          (client.phone && client.phone.includes(debouncedSearch))
        );
      });
    }
    
    // Apply pagination
    const startIndex = paginationModel.page * paginationModel.pageSize;
    const endIndex = startIndex + paginationModel.pageSize;
    
    // Map donors to a consistent format
    const formattedDonors = filteredData.slice(startIndex, endIndex).map(client => ({
      _id: client._id,
      fName: client.fName || "",
      lName: client.lName || "",
      email: client.email || "",
      email_1: client.email_1 || null,
      phoneNumber: client.phone || "",
      phone_number_1: client.phone_number_1 || null,
      status: client.status || "active",
      nextContactDate: client.nextContactDate || null,
      owner: client.owner || null,
    }));
    
    return {
      donors: formattedDonors,
      totalDocuments: filteredData.length,
      currentPage: paginationModel.page + 1,
      totalPages: Math.ceil(filteredData.length / paginationModel.pageSize)
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
        `${import.meta.env.VITE_API_URL}/api/v1/allodon/donors?${params.toString()}`
      );
      
      if (!response.ok) {
        throw new Error(`Error fetching Allodon clients: ${response.statusText}`);
      }

      const result = await response.json();
      // console.log(result);
      
      setAllClients(result.donors);
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
        `${import.meta.env.VITE_API_URL}/api/v1/allodon/donors/${clientId}/status`,
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