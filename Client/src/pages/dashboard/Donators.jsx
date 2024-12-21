import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  CircularProgress,
  Alert,
  Typography,
} from "@mui/material";

import { useNavigate, Outlet, useParams } from "react-router-dom";
import debounce from "lodash.debounce";
import { useTranslation } from 'react-i18next';

const DontaorsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();

  // State variables
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(0); // Zero-based indexing for MUI pagination
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [clients, setClients] = useState([]);
  const [totalClients, setTotalClients] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Debounce the search input to avoid excessive API calls
  const debouncedChangeHandler = useCallback(
    debounce((value) => {
      setDebouncedSearch(value.trim()); // Trim whitespace for cleaner search
      setPage(0); // Reset to the first page on new search
    }, 500),
    []
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedChangeHandler(value);
  };

  // Fetch clients from the API
  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      setError(null);

      try {
        // Construct query parameters
        const params = new URLSearchParams({
          page: page + 1, // API uses 1-based indexing
          limit: rowsPerPage,
        });
        if (debouncedSearch) {
          params.append("search", debouncedSearch);
        }

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/v1/donators?${params.toString()}`
        );
        
        if (!response.ok) {
          throw new Error(`Server responded with: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        // Validate data shape
        if (!data || !Array.isArray(data.donators)) {
          throw new Error("Invalid data format received from server.");
        }

        setClients(data.donators);
        setTotalClients(data.totalDocuments || 0);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [page, rowsPerPage, debouncedSearch]);

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page whenever rows per page changes
  };

  // If an ID param is present, render the Outlet for nested routes/details.
  if (id) {
    return <Outlet />;
  }

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t("donators")}
      </Typography>

      {/* Search Input */}
      <TextField
        label="Search clients"
        variant="outlined"
        fullWidth
        margin="normal"
        value={searchQuery}
        onChange={handleSearchChange}
        placeholder="Search by name, email, etc."
      />

      {/* Loading Indicator */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ my: 2 }}>
          {error} — Please try again later.
        </Alert>
      )}

      {/* Client Table */}
      {!loading && !error && (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  {t("fName")}
                </TableCell>
                <TableCell>
                  {t("lName")}
                </TableCell>
                <TableCell>
                  {t("email")}
                </TableCell>
                <TableCell>
                  {t("phone")}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clients.length > 0 ? (
                clients.map((client) => (
                  <TableRow
                    key={client._id}
                    hover
                    sx={{ cursor: "pointer" }}
                    onClick={() => navigate(`/dashboard/donators/${client._id}`)}
                  >
                    <TableCell>{client.fName || "N/A"}</TableCell>
                    <TableCell>{client.lName || "N/A"}</TableCell>
                    <TableCell>{client.email_1 || "N/A"}</TableCell>
                    <TableCell>
                      {client.phone_number_1 && client.phone_number_1.number
                        ? `${client.phone_number_1.number}${
                            client.phone_number_1.country
                              ? ` (${client.phone_number_1.country})`
                              : ""
                          }`
                        : "N/A"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No clients found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Pagination */}
      {!loading && !error && totalClients > 0 && (
        <TablePagination
          component="div"
          count={totalClients}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Rows per page:"
          sx={{ mt: 2 }}
        />
      )}
    </Box>
  );
};

export default DontaorsPage;
