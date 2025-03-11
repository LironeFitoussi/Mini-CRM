// src/pages/dashboard/NedarimClients.jsx
import { useState, useEffect, useCallback, useMemo } from "react";
import { Box, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import debounce from "lodash.debounce";

// Components
import AddDonatorButton from "../../components/Buttons/AddDonatorButton";
import SmartTable from "../../components/Molecules/SmartTable";
import PageHeader from "../../components/Molecules/PageHeader";
import SearchBar from "../../components/Atoms/SearchBar";

/**
 * NedarimClients page component
 * Displays and manages donors from the Nedarim system
 * 
 * @returns {JSX.Element} NedarimClients page
 */
const NedarimClients = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [paginationModel, setPaginationModel] = useState({
    page: 0, // zero-based
    pageSize: 25,
  });
  const [allDonors, setAllDonors] = useState([]);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Memoized function to filter and paginate data client-side
  const paginatedData = useMemo(() => {
    let filteredData = allDonors;
    
    // Apply search filter if exists
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      filteredData = allDonors.filter(donor => {
        // Adjust these fields based on your actual donor object structure
        return (
          (donor.name && donor.name.toLowerCase().includes(searchLower)) ||
          (donor.email && donor.email.toLowerCase().includes(searchLower)) ||
          (donor.phone && donor.phone.includes(debouncedSearch)) ||
          (donor.donorId && donor.donorId.includes(debouncedSearch))
        );
      });
    }
    
    // Calculate total documents for pagination
    setTotalDocuments(filteredData.length);
    
    // Apply pagination
    const startIndex = paginationModel.page * paginationModel.pageSize;
    const endIndex = startIndex + paginationModel.pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [allDonors, debouncedSearch, paginationModel.page, paginationModel.pageSize]);

  const debouncedChangeHandler = useCallback(
    debounce((value) => {
      const trimmed = value.replace(/^0+/, "").trim();
      setDebouncedSearch(trimmed);
      setPaginationModel((prev) => ({ ...prev, page: 0 }));
    }, 500),
    []
  );

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    debouncedChangeHandler(e.target.value);
  };

  const fetchAllDonors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all donors without pagination
      const params = new URLSearchParams();
      
      if (debouncedSearch) {
        params.append("search", debouncedSearch);
      }

      // Use a larger limit to essentially get all donors at once
      // You might need to adjust this based on your actual data size or API capabilities
      params.append("limit", "10000");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/nedarim/donors?${params.toString()}`
      );
      
      if (!response.ok) {
        throw new Error(`Error fetching donors: ${response.statusText}`);
      }

      const result = await response.json();
      
      setAllDonors(result.donors);
      setTotalDocuments(result.donors.length);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  const handlePageChange = useCallback((newPage) => {
    setPaginationModel((prev) => ({ ...prev, page: newPage }));
  }, []);

  const handlePageSizeChange = useCallback((newPageSize) => {
    setPaginationModel({ page: 0, pageSize: newPageSize });
  }, []);

  const handleStatusToggle = useCallback(async (donorId, newStatus) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/nedarim/donors/${donorId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      
      if (!response.ok) {
        throw new Error(`Error updating status: ${response.statusText}`);
      }
      
      // Update the donor's status locally in the cached data
      setAllDonors(prevDonors => 
        prevDonors.map(donor => 
          donor._id === donorId 
            ? { ...donor, status: newStatus } 
            : donor
        )
      );
    } catch (err) {
      setError(`Failed to update status: ${err.message}`);
    }
  }, []);

  useEffect(() => {
    fetchAllDonors();
  }, [fetchAllDonors]);

  useEffect(() => {
    return () => {
      debouncedChangeHandler.cancel();
    };
  }, [debouncedChangeHandler]);

  const handleDonatorSelect = (donorId) => {
    navigate(`/dashboard/donors/${donorId}`);
  };

  return (
    <Box sx={{ padding: 4 }}>
      {/* Page Header */}
      <PageHeader 
        title="Nedarim Donors" 
        actions={<AddDonatorButton />} 
      />

      {/* Search Input */}
      <SearchBar
        value={searchQuery}
        onChange={handleSearchChange}
        label="Search Nedarim Donors"
        placeholder="Search by name, email, etc."
      />

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ my: 2 }}>
          {error} — Please try again later.
        </Alert>
      )}

      {/* Table */}
      <SmartTable
        data={paginatedData}
        loading={loading}
        onStatusToggle={handleStatusToggle}
        onDonatorSelect={handleDonatorSelect}
        size="100%"
        page={paginationModel.page}
        rowsPerPage={paginationModel.pageSize}
        totalCount={totalDocuments}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </Box>
  );
};

export default NedarimClients;
