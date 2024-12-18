import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  TextField,
  CircularProgress,
  Alert,
  Typography,
  TableSortLabel, // Import TableSortLabel for sortable headers
} from "@mui/material";
import debounce from "lodash.debounce";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const DonationsPage = () => {
  // State variables for paginated donations
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

  // Debounce the search input to avoid excessive API calls
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

  // Function to handle sorting
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
    setPage(0); // Reset to first page on sort change
  };

  // Fetch paginated donations from the API with search and sorting
  useEffect(() => {
    const fetchDonations = async () => {
      setLoadingDonations(true);
      setErrorDonations(null);

      try {
        // Construct query parameters
        const params = new URLSearchParams({
          page: page + 1, // API uses 1-based indexing
          limit: rowsPerPage,
          sortField: orderBy, // Add sortField parameter
          sortOrder: order, // Add sortOrder parameter
        });
        if (debouncedSearch) {
          params.append("search", debouncedSearch);
        }

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
  }, [page, rowsPerPage, debouncedSearch, order, orderBy]); // Include order and orderBy in dependencies

  // Fetch summary data (total amount and donation types) from the API
  useEffect(() => {
    const fetchSummary = async () => {
      setLoadingSummary(true);
      setErrorSummary(null);

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/v1/donations/all-types`
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
  }, []); // Empty dependency array to fetch once on mount

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page whenever rows per page changes
  };

  // Prepare data for Donation Types chart
  const donationTypesChartData = donationTypesData.map((type) => ({
    name: type.type,
    value: type.totalAmount,
  }));

  const COLORS = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff7300",
    "#d3d3d3",
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#A28CFE",
    "#FF69B4",
  ];

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Donations Tracker
      </Typography>

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
        {/* Loading Indicator for Summary */}
        {loadingSummary && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              my: 2,
              width: "100%",
            }}
          >
            <CircularProgress />
          </Box>
        )}

        {/* Error Message for Summary */}
        {errorSummary && (
          <Alert severity="error" sx={{ my: 2, width: "100%" }}>
            {errorSummary} — Please try again later.
          </Alert>
        )}

        {/* Display Summary Only When Not Loading and No Error */}
        {!loadingSummary && !errorSummary && (
          <>
            {/* Total Donations */}
            <Box
              sx={{
                flex: 1,
                minWidth: 250,
                p: 2,
                bgcolor: "white",
                borderRadius: 2,
                boxShadow: 1,
              }}
            >
              <Typography variant="h6">Total Donations</Typography>
              <Typography variant="h4" color="primary">
                €{totalDonations.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
            </Box>

            {/* Donation Types Chart */}
            <Box
              sx={{
                flex: 1,
                minWidth: 300,
                p: 2,
                bgcolor: "white",
                borderRadius: 2,
                boxShadow: 1,
              }}
            >
              <Typography variant="h6">Donation Types</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={donationTypesChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    label
                  >
                    {donationTypesChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) =>
                      `€${value.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </>
        )}
      </Box>

      {/* Loading Indicator for Donations */}
      {loadingDonations && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error Message for Donations */}
      {errorDonations && (
        <Alert severity="error" sx={{ my: 2 }}>
          {errorDonations} — Please try again later.
        </Alert>
      )}

      {/* Donations Over Time Chart */}
      {!loadingDonations && !errorDonations && donations.length > 0 && (
        <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap", mt: 4 }}>
          <Box
            sx={{
              flex: 1,
              minWidth: 300,
              p: 2,
              bgcolor: "white",
              borderRadius: 2,
              boxShadow: 1,
            }}
          >
            <Typography variant="h6">Donations Over Time</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={donations}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <XAxis
                  dataKey="date"
                  tickFormatter={(tick) =>
                    new Date(tick).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(label) =>
                    new Date(label).toLocaleDateString()
                  }
                  formatter={(value) =>
                    `€${value.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`
                  }
                />
                <Bar dataKey="amount" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Box>
      )}

      {/* Donations Table */}
      {!loadingDonations && !errorDonations && (
        <Box sx={{ mt: 4 }}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  {/* Donor ID Column with Sorting */}
                  <TableCell sortDirection={orderBy === "donator_id" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "donator_id"}
                      direction={orderBy === "donator_id" ? order : "asc"}
                      onClick={() => handleRequestSort("donator_id")}
                    >
                      Donor ID
                    </TableSortLabel>
                  </TableCell>

                  {/* Amount Column with Sorting */}
                  <TableCell sortDirection={orderBy === "amount" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "amount"}
                      direction={orderBy === "amount" ? order : "asc"}
                      onClick={() => handleRequestSort("amount")}
                    >
                      Amount (€)
                    </TableSortLabel>
                  </TableCell>

                  {/* Date Column with Sorting */}
                  <TableCell sortDirection={orderBy === "date" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "date"}
                      direction={orderBy === "date" ? order : "asc"}
                      onClick={() => handleRequestSort("date")}
                    >
                      Date
                    </TableSortLabel>
                  </TableCell>

                  {/* Type Column with Sorting */}
                  <TableCell sortDirection={orderBy === "type" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "type"}
                      direction={orderBy === "type" ? order : "asc"}
                      onClick={() => handleRequestSort("type")}
                    >
                      Type
                    </TableSortLabel>
                  </TableCell>

                  {/* Method Column with Sorting */}
                  <TableCell sortDirection={orderBy === "method" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "method"}
                      direction={orderBy === "method" ? order : "asc"}
                      onClick={() => handleRequestSort("method")}
                    >
                      Method
                    </TableSortLabel>
                  </TableCell>

                  {/* Notes Column (Optional Sorting) */}
                  <TableCell sortDirection={orderBy === "notes" ? order : false}>
                    <TableSortLabel
                      active={orderBy === "notes"}
                      direction={orderBy === "notes" ? order : "asc"}
                      onClick={() => handleRequestSort("notes")}
                    >
                      Notes
                    </TableSortLabel>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {donations.length > 0 ? (
                  donations.map((donation) => (
                    <TableRow key={donation._id}>
                      <TableCell>{donation.donator_id}</TableCell>
                      <TableCell>
                        {donation.amount.toLocaleString(undefined, {
                          style: "currency",
                          currency: donation.currency,
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell>
                        {new Date(donation.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{donation.type}</TableCell>
                      <TableCell>{donation.method}</TableCell>
                      <TableCell>{donation.notes}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No donations found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <TablePagination
            component="div"
            count={totalPages * rowsPerPage} // Adjust if API provides total count
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="Rows per page:"
            sx={{ mt: 2 }}
          />
        </Box>
      )}
    </Box>
  );
};

export default DonationsPage;
