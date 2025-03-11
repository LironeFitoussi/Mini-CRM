// src/pages/dashboard/NedarimClients.jsx
import { useState, useEffect, useCallback } from "react";
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
  const [data, setData] = useState({
    donors: [],
    totalDocuments: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const fetchDonors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: paginationModel.page + 1, // 1-based for API
        limit: paginationModel.pageSize,
      });
      
      if (debouncedSearch) {
        params.append("search", debouncedSearch);
      }

      // Updated API endpoint for Nedarim donors
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/nedarim/donors?${params.toString()}`
      );
      
      if (!response.ok) {
        throw new Error(`Error fetching donors: ${response.statusText}`);
      }

      const result = await response.json();
      
      setData({
        donors: result.donors,
        totalDocuments: result.totalDocuments,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [paginationModel.page, paginationModel.pageSize, debouncedSearch]);

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
      
      fetchDonors();
    } catch (err) {
      setError(`Failed to update status: ${err.message}`);
    }
  }, [fetchDonors]);

  useEffect(() => {
    fetchDonors();
  }, [fetchDonors]);

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
        data={data.donors}
        loading={loading}
        onStatusToggle={handleStatusToggle}
        onDonatorSelect={handleDonatorSelect}
        size="100%"
        page={paginationModel.page}
        rowsPerPage={paginationModel.pageSize}
        totalCount={data.totalDocuments}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </Box>
  );
};

export default NedarimClients;
