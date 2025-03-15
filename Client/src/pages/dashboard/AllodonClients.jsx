import { Box, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";

// Custom hooks
import useAllodonClients from "../../hooks/useAllodonClients";

// Components
import PageHeader from "../../components/Molecules/PageHeader";
import SearchBar from "../../components/Atoms/SearchBar";
import AllodonTable from "../../components/Molecules/AllodonTable";
import SyncButton from "../../components/Buttons/SyncButton";
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
        actions={<SyncButton />}
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
