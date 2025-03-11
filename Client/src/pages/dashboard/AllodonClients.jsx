import { Box, Alert } from "@mui/material";

// Custom hooks
import useAllodonClients from "../../hooks/useAllodonClients";

// Components
import PageHeader from "../../components/Molecules/PageHeader";
import SearchBar from "../../components/Atoms/SearchBar";
import AllodonTable from "../../components/Molecules/AllodonTable";
import AddAllodonClientButton from "../../components/Buttons/AddAllodonClientButton";

/**
 * AllodonClients page component
 * Displays and manages Allodon clients
 * 
 * @returns {JSX.Element} AllodonClients page
 */
const AllodonClients = () => {
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

  return (
    <Box sx={{ padding: 4 }}>
      {/* Page Header with Add Client Button */}
      <PageHeader 
        title="Allodon Clients" 
        actions={<AddAllodonClientButton />} 
      />

      {/* Search Input */}
      <SearchBar
        value={searchQuery}
        onChange={handleSearchChange}
        label="Search Allodon Clients"
        placeholder="Search by name, email, phone..."
      />

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ my: 2 }}>
          {error} — Please try again later.
        </Alert>
      )}

      {/* Clients Table */}
      <AllodonTable
        data={data.clients}
        loading={loading}
        onStatusToggle={handleStatusToggle}
        page={paginationModel.page}
        rowsPerPage={paginationModel.pageSize}
        totalCount={data.totalDocuments}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </Box>
  );
};

export default AllodonClients; 