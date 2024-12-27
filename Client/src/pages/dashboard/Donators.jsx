// src/pages/DonatorsPage.jsx
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
    Button,
} from "@mui/material";
import Checkbox from '@mui/material/Checkbox';

import { useNavigate, Outlet, useParams } from "react-router-dom";
import debounce from "lodash.debounce";
import { useTranslation } from 'react-i18next';

// Components
import AddDonatorButton from "../../components/Atoms/AddDonatorButton";
import AddToLeadButton from "../../components/Atoms/AddToLeadButton";

// 1. Create a new page component named DonatorsPage.
const DonatorsPage = () => { // Corrected component name
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
    
    // New state for selected donor IDs
    const [selectedDonorIds, setSelectedDonorIds] = useState([]);

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

    // Handle individual donor selection
    const handleDonorSelect = (id) => {
        setSelectedDonorIds((prevSelected) => {
            if (prevSelected.includes(id)) {
                return prevSelected.filter((donorId) => donorId !== id);
            } else {
                return [...prevSelected, id];
            }
        });
    };

    // Handle "Select All" functionality
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allIds = clients.map((client) => client._id);
            setSelectedDonorIds((prevSelected) => {
                // Avoid duplicates
                const newSelected = [...prevSelected];
                allIds.forEach(id => {
                    if (!newSelected.includes(id)) newSelected.push(id);
                });
                return newSelected;
            });
        } else {
            // Remove current page IDs from selectedDonorIds
            const pageIds = clients.map((client) => client._id);
            setSelectedDonorIds((prevSelected) => prevSelected.filter(id => !pageIds.includes(id)));
        }
    };

    // Log selected donor IDs whenever they change
    // useEffect(() => {
        // console.log("Selected Donor IDs:", selectedDonorIds);
        // Future logic implementation can be placed here
    // }, [selectedDonorIds]);

    // If an ID param is present, render the Outlet for nested routes/details.
    if (id) {
        return <Outlet />;
    }

    // Determine if all donors on the current page are selected
    const isAllSelected = clients.length > 0 && clients.every(client => selectedDonorIds.includes(client._id));

    return (
        <Box sx={{ padding: 4 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>

                <Typography variant="h4" component="h1" gutterBottom>
                    {t("donators")}
                </Typography>

                <Box sx={{ display: "flex", gap: 2 }}>
                    {/* Add Donator Button */}
                    <AddDonatorButton />

                    {/* Add To Lead Button */}
                    <AddToLeadButton selectedDonorIds={selectedDonorIds} />
                </Box>
            </Box>
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
                                    {/* "Select All" Checkbox */}
                                    <Checkbox
                                        color="primary"
                                        indeterminate={selectedDonorIds.length > 0 && selectedDonorIds.length < clients.length}
                                        checked={isAllSelected}
                                        onChange={handleSelectAll}
                                        inputProps={{ 'aria-label': 'select all clients' }}
                                    />
                                </TableCell>
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
                                clients.map((client) => {
                                    const isSelected = selectedDonorIds.includes(client._id);
                                    return (
                                        <TableRow
                                            key={client._id}
                                            hover
                                            sx={{ cursor: "pointer" }}
                                            onClick={() => navigate(`/dashboard/donators/${client._id}`)}
                                            selected={isSelected}
                                        >
                                            <TableCell onClick={(e) => e.stopPropagation()}>
                                                <Checkbox
                                                    color="primary"
                                                    checked={isSelected}
                                                    onChange={() => handleDonorSelect(client._id)}
                                                    inputProps={{ 'aria-label': `select client ${client.fName} ${client.lName}` }}
                                                />
                                            </TableCell>
                                            <TableCell>{client.fName || "N/A"}</TableCell>
                                            <TableCell>{client.lName || "N/A"}</TableCell>
                                            <TableCell>{client.email_1?.email || "N/A"}</TableCell>
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
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
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

export default DonatorsPage;
