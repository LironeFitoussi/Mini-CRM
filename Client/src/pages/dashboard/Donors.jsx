// src/pages/DonatorsPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  TextField,
  Alert,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import debounce from "lodash.debounce";

// Components
import AddDonatorButton from "../../components/Buttons/AddDonatorButton";
import SmartTable from "../../components/Molecules/SmartTable";

const DonatorsPage = () => {
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

  const fetchDonators = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: paginationModel.page + 1, // 1-based
        limit: paginationModel.pageSize,
      });
      if (debouncedSearch) {
        params.append("search", debouncedSearch);
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/donors?${params.toString()}`
      );
      if (!response.ok) {
        throw new Error(`Error fetching donors: ${response.statusText}`);
      }

      const result = await response.json();
      // console.log(result);
      
      setData({
        donors: result.donors,
        totalDocuments: result.totalDocuments,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonators();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginationModel.page, paginationModel.pageSize, debouncedSearch]);

  const handlePageChange = useCallback((newPage) => {
    setPaginationModel((prev) => ({ ...prev, page: newPage }));
  }, []);

  const handlePageSizeChange = useCallback((newPageSize) => {
    setPaginationModel({ page: 0, pageSize: newPageSize });
  }, []);

  const handleStatusToggle = async (donorId, newStatus) => {
    try {
      await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/donors/${donorId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      fetchDonators();
    } catch (err) {
      setError(`Failed to update status: ${err.message}`);
    }
  };

  const handleDonatorSelect = (donorId) => {
    navigate(`/dashboard/donors/${donorId}`);
  };

  useEffect(() => {
    return () => {
      debouncedChangeHandler.cancel();
    };
  }, [debouncedChangeHandler]);

  return (
    <Box sx={{ padding: 4 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Donors
        </Typography>

        <Box sx={{ display: "flex", gap: 2 }}>
          <AddDonatorButton />
        </Box>
      </Box>

      {/* Search Input */}
      <TextField
        label="Search Donors"
        variant="outlined"
        fullWidth
        margin="normal"
        value={searchQuery}
        onChange={handleSearchChange}
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

export default DonatorsPage;
