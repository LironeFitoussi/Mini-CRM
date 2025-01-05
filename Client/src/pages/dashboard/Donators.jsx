// src/pages/DonatorsPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  TextField,
  CircularProgress,
  Alert,
  Typography,
} from "@mui/material";
import { useNavigate, Outlet, useParams } from "react-router-dom";
import debounce from "lodash.debounce";
import { useTranslation } from "react-i18next";

// React Query hooks
import useDonators from "../../queryhooks/useDonators";
import { useUpdateDonatorStatus } from "../../queryhooks/useUpdateDonatorStatus";

// Components
import AddDonatorButton from "../../components/Buttons/AddDonatorButton";
import SmartTable from "../../components/Molecules/SmartTable";

const DonatorsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();

  // Debounced search
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debouncedChangeHandler = useCallback(
    debounce((value) => {
      const trimmed = value.replace(/^0+/, "").trim();
      setDebouncedSearch(trimmed);
      // Reset to first page whenever search changes
      setPaginationModel((prev) => ({ ...prev, page: 0 }));
    }, 500),
    []
  );

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    debouncedChangeHandler(e.target.value);
  };

  // MUI DataGrid v7 approach for server pagination
  const [paginationModel, setPaginationModel] = useState({
    page: 0, // zero-based
    pageSize: 25,
  });

  // React Query: fetch donators
  const {
    data,
    isLoading,
    isError,
    error,
  } = useDonators({
    page: paginationModel.page,
    pageSize: paginationModel.pageSize,
    search: debouncedSearch,
  });

  const totalClients = data?.totalDocuments ?? 0;
  const clients = data?.donators ?? [];

  // console.log(clients);
  
  // For status updates with optimistic UI
  const updateStatusMutation = useUpdateDonatorStatus({
    page: paginationModel.page,
    pageSize: paginationModel.pageSize,
    search: debouncedSearch,
  });

  // If an ID param is present, show nested route
  if (id) {
    return <Outlet />;
  }

  // Called by the DataGrid
  const handlePageChange = (newPage) => {
    setPaginationModel((prev) => ({ ...prev, page: newPage }));
  };
  const handlePageSizeChange = (newPageSize) => {
    setPaginationModel({ page: 0, pageSize: newPageSize });
  };

  // Our status toggle now goes through the mutation
  const handleStatusToggle = async (donorId, newStatus) => {
    // The mutation is automatically optimistic (as defined in useUpdateDonatorStatus)
    updateStatusMutation.mutate({ donorId, newStatus });
  };

  // For row clicks or checkbox selection
  const handleDonatorSelect = (donorId) => {
    navigate(`/dashboard/donators/${donorId}`);
  };

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
          {t("general.donors")}
        </Typography>

        <Box sx={{ display: "flex", gap: 2 }}>
          <AddDonatorButton />
        </Box>
      </Box>

      {/* Search Input */}
      <TextField
        label={t("general.searchDonors")}
        variant="outlined"
        fullWidth
        margin="normal"
        value={searchQuery}
        onChange={handleSearchChange}
        placeholder="Search by name, email, etc."
      />

      {/* Loading Indicator */}
      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error Message */}
      {isError && (
        <Alert severity="error" sx={{ my: 2 }}>
          {error.message} — Please try again later.
        </Alert>
      )}

      {/* Table */}
      {(!isError || isLoading)&& (
        <SmartTable
          data={clients} // from React Query
          loading={isLoading}
          onStatusToggle={handleStatusToggle}
          onDonatorSelect={handleDonatorSelect}
          size="100%" // or "90%", as you like

          // MUI DataGrid (server-side) pagination
          page={paginationModel.page}
          rowsPerPage={paginationModel.pageSize}
          totalCount={totalClients}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </Box>
  );
};

export default DonatorsPage;
