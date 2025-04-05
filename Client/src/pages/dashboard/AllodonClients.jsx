import { Box, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Custom hooks
import useAllodonClients from "../../hooks/useAllodonClients";

// Components
import PageHeader from "../../components/Molecules/PageHeader";
import SearchBar from "../../components/Atoms/SearchBar";
import AllodonTable from "../../components/Molecules/AllodonTable";
import SyncButton from "../../components/Buttons/SyncButton";
import BroadcastEmailButton from "../../components/Buttons/BroadcastEmailButton";
// import AddAllodonClientButton from "../../components/Buttons/AddAllodonClientButton";

/**
 * AllodonClients page component
 * Displays and manages Allodon clients
 *
 * @returns {JSX.Element} AllodonClients page
 */
const AllodonClients = () => {
  const navigate = useNavigate();
  
  // Use the custom hook to manage clients data and state
  const {
    searchQuery,
    data,
    loading,
    error,
    paginationModel,
    handleSearchChange,
    handlePageChange,
    handlePageSizeChange,
    handleStatusToggle,
  } = useAllodonClients();

  // Handle row click to navigate to donor details
  const handleDonorSelect = (donorId) => {
    navigate(`/dashboard/donors/${donorId}`);
  };

  // Function to fetch only Allodon client emails
  const fetchAllodonEmails = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/v1/donors?source=allodon&limit=10000`
      );
      
      // Filter only valid, subscribed emails
      const emails = response.data.donors
        .filter(donor => 
          donor?.email_1?.email && 
          donor?.email_1?.email?.trim() !== "" && 
          donor?.email_1?.isSubscribed
        )
        .map(donor => donor?.email_1?.email);
      
      // Return unique emails
      return [...new Set(emails)];
    } catch (error) {
      console.error("Error fetching Allodon client emails:", error);
      throw error;
    }
  };

  return (
    <Box 
      sx={{ 
        padding: 4, 
        height: "calc(100vh - 64px)", // Adjust for app bar height
        display: "flex",
        flexDirection: "column"
      }}
    >
      {/* Page Header with Sync Button */}
      <PageHeader
        title="Allodon Clients"
        actions={
          <Box sx={{ display: "flex", gap: 2 }}>
            <SyncButton />
            <BroadcastEmailButton fetchEmails={fetchAllodonEmails} />
          </Box>
        }
      />

      {/* Search Input */}
      <SearchBar
        value={searchQuery}
        onChange={handleSearchChange}
        label="Search Allodon Clients"
        placeholder="Search by name, email, phone..."
        sx={{ mb: 2 }}
      />

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error} — Please try again later.
        </Alert>
      )}

      {/* Clients Table - Flex grow to fill available space */}
      <Box sx={{ flexGrow: 1, display: 'flex', overflow: 'hidden' }}>
        {data.donors && data.donors.length > 0 ? (
          <AllodonTable
            data={data.donors}
            loading={loading}
            onStatusToggle={handleStatusToggle}
            onRowClick={handleDonorSelect}
            page={paginationModel.page}
            pageSize={paginationModel.pageSize}
            totalDocuments={data.totalDocuments}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        ) : null}
      </Box>
    </Box>
  );
};

export default AllodonClients;
