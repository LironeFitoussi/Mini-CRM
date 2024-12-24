import React, { useEffect, useState, useCallback } from "react";
import { Box, TextField, MenuItem, Typography } from "@mui/material";
import debounce from "lodash.debounce";

// Child components
import DonationsSummary from "../../components/Atoms/DonationsSummary";
import DonationsOverTimeChart from "../../components/Atoms/DonationsOverTimeChart";
import DonationsTable from "../../components/Molecules/DonationsTable";

/**
 * The main Donations Page that fetches data and composes child components.
 */
const DonationsPage = () => {
  // =====================
  // State Variables
  // =====================
  const [donations, setDonations] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(0); // Zero-based indexing for MUI pagination
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [loadingDonations, setLoadingDonations] = useState(false);
  const [errorDonations, setErrorDonations] = useState(null);

  // Sorting state
  const [order, setOrder] = useState("asc"); // 'asc' or 'desc'
  const [orderBy, setOrderBy] = useState("date"); // Default sort field

  // State variables for summary data (total amount and donation types)
  const [donationTypesData, setDonationTypesData] = useState([]);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [errorSummary, setErrorSummary] = useState(null);
  const [totalDonations, setTotalDonations] = useState(0);

  // Year state
  const [year, setYear] = useState(new Date().getFullYear());

  // =====================
  // Debounce for Search
  // =====================
  const debouncedChangeHandler = useCallback(
    debounce((value) => {
      setDebouncedSearch(value.trim());
      setPage(0); // Reset to the first page on new search
    }, 500),
    []
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedChangeHandler(value);
  };

  // Handle year change
  const handleYearChange = (e) => {
    setYear(e.target.value);
    setPage(0);
  };

  // =====================
  // Fetch Donations
  // =====================
  useEffect(() => {
    const fetchDonations = async () => {
      setLoadingDonations(true);
      setErrorDonations(null);

      try {
        // Construct query parameters
        const params = new URLSearchParams({
          page: page + 1, // API uses 1-based indexing
          limit: rowsPerPage,
          sortField: orderBy,
          sortOrder: order,
        });

        if (debouncedSearch) {
          params.append("search", debouncedSearch);
        }
        // Append year if your API supports it
        params.append("year", year);

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/v1/donations?${params.toString()}`
        );

        if (!response.ok) {
          throw new Error(
            `Server responded with: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();

        // Validate data shape
        if (!data || !Array.isArray(data.donations)) {
          throw new Error("Invalid data format received from server.");
        }

        setDonations(data.donations);
        setTotalPages(data.totalPages || 0);
        setCurrentPage(data.currentPage || 1);
      } catch (err) {
        setErrorDonations(err.message);
      } finally {
        setLoadingDonations(false);
      }
    };

    fetchDonations();
  }, [page, rowsPerPage, debouncedSearch, order, orderBy, year]);

  // =====================
  // Fetch Summary
  // =====================
  useEffect(() => {
    const fetchSummary = async () => {
      setLoadingSummary(true);
      setErrorSummary(null);

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/v1/donations/all-types?year=${year}`
        );

        if (!response.ok) {
          throw new Error(
            `Server responded with: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();

        // Validate data shape
        if (!Array.isArray(data)) {
          throw new Error("Invalid data format received from server.");
        }

        setDonationTypesData(data);

        // Calculate total donations by summing all totalAmount
        const total = data.reduce(
          (sum, type) => sum + (type.totalAmount || 0),
          0
        );
        setTotalDonations(total);
      } catch (err) {
        setErrorSummary(err.message);
      } finally {
        setLoadingSummary(false);
      }
    };

    fetchSummary();
  }, [year]);

  // =====================
  // Table Handlers
  // =====================
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
    setPage(0);
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Donations Tracker
      </Typography>

      {/* Year Dropdown */}
      <TextField
        select
        label="Year"
        value={year}
        onChange={handleYearChange}
        variant="outlined"
        margin="normal"
        fullWidth
      >
        {[2020, 2021, 2022, 2023, 2024, "All Time"].map((yr) => (
          <MenuItem key={yr} value={yr}>
            {yr}
          </MenuItem>
        ))}
      </TextField>

      {/* Search Input */}
      <TextField
        label="Search donations"
        variant="outlined"
        fullWidth
        margin="normal"
        value={searchQuery}
        onChange={handleSearchChange}
        placeholder="Search by donor, date, type, etc."
      />

      {/* Summary Section */}
      <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap", mt: 4 }}>
        <DonationsSummary
          loadingSummary={loadingSummary}
          errorSummary={errorSummary}
          donationTypesData={donationTypesData}
          totalDonations={totalDonations}
        />
      </Box>

      {/* Donations Over Time Chart */}
      {!loadingDonations && !errorDonations && donations.length > 0 && (
        <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap", mt: 4 }}>
          <DonationsOverTimeChart donations={donations} />
        </Box>
      )}

      {/* Donations Table */}
      <DonationsTable
        donations={donations}
        loadingDonations={loadingDonations}
        errorDonations={errorDonations}
        order={order}
        orderBy={orderBy}
        handleRequestSort={handleRequestSort}
        page={page}
        rowsPerPage={rowsPerPage}
        handleChangePage={handleChangePage}
        handleChangeRowsPerPage={handleChangeRowsPerPage}
        totalPages={totalPages}
      />
    </Box>
  );
};

export default DonationsPage;
