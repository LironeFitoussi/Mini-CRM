// src/pages/DonatorsPage.jsx
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  TextField,
  Alert,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import debounce from "lodash.debounce";

// Components
// import AddDonatorButton from "../../components/Buttons/AddDonatorButton";
import BroadcastEmailButton from "../../components/Buttons/BroadcastEmailButton";
import SmartTable from "../../components/Molecules/SmartTable";

const DonatorsPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [paginationModel, setPaginationModel] = useState({
    page: 0, // zero-based
    pageSize: 25,
  });
  const [allDonors, setAllDonors] = useState([]);
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
          (donor.fName && donor.fName.toLowerCase().includes(searchLower)) ||
          (donor.lName && donor.lName.toLowerCase().includes(searchLower)) ||
          (donor.email && donor.email.toLowerCase().includes(searchLower)) ||
          (donor.phone_number_1?.number && donor.phone_number_1.number.includes(debouncedSearch)) ||
          (donor.donorId && donor.donorId.includes(debouncedSearch))
        );
      });
    }
    
    // Apply pagination
    const startIndex = paginationModel.page * paginationModel.pageSize;
    const endIndex = startIndex + paginationModel.pageSize;
    
    // Format data for SmartTable
    const formattedDonors = filteredData.map(donor => ({
      _id: donor._id,
      fName: donor.fName || "",
      lName: donor.lName || "",
      email: donor.email || "N/A",
      phoneNumber: donor.phone_number_1?.number || "N/A",
      status: donor.status || "active",
      nextContactDate: donor.nextContactDate || null,
      owner: donor.owner || null,
    }));
    
    return {
      donors: formattedDonors.slice(startIndex, endIndex),
      totalDocuments: filteredData.length
    };
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
      const params = new URLSearchParams();
      
      if (debouncedSearch) {
        params.append("search", debouncedSearch);
      }

      // Use a large limit to fetch all donors at once
      params.append("limit", "10000");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/donors?${params.toString()}`
      );
      if (!response.ok) {
        throw new Error(`Error fetching donors: ${response.statusText}`);
      }

      const result = await response.json();
      setAllDonors(result.donors);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchAllDonors();
  }, [fetchAllDonors]);

  const handlePageChange = useCallback((newPage) => {
    setPaginationModel((prev) => ({ ...prev, page: newPage }));
  }, []);

  const handlePageSizeChange = useCallback((newPageSize) => {
    setPaginationModel({ page: 0, pageSize: newPageSize });
  }, []);

  const handleStatusToggle = async (donorId, newStatus) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/donors/${donorId}/status`,
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
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4">Donors</Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <BroadcastEmailButton />
          {/* <AddDonatorButton /> */}
        </Box>
      </Box>

      <TextField
        label="Search"
        variant="outlined"
        fullWidth
        value={searchQuery}
        onChange={handleSearchChange}
        sx={{ mb: 3 }}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <SmartTable
        data={paginatedData.donors}
        totalDocuments={paginatedData.totalDocuments}
        loading={loading}
        page={paginationModel.page}
        pageSize={paginationModel.pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onRowClick={handleDonatorSelect}
        onStatusToggle={handleStatusToggle}
      />
    </Box>
  );
};

export default DonatorsPage;
