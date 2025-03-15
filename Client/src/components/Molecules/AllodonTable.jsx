import PropTypes from "prop-types";
import SmartTable from "./SmartTable";
import { Box } from "@mui/material";

/**
 * AllodonTable component - specialized table for Allodon clients
 * Wraps SmartTable with specific configuration for Allodon data
 * 
 * @param {Object} props - Component props
 * @param {Array} props.data - Allodon clients data
 * @param {boolean} props.loading - Loading state
 * @param {Function} props.onStatusToggle - Function to toggle client status
 * @param {Function} props.onRowClick - Function to handle row click
 * @param {number} props.page - Current page number
 * @param {number} props.pageSize - Number of rows per page
 * @param {number} props.totalDocuments - Total count of records
 * @param {Function} props.onPageChange - Function to handle page change
 * @param {Function} props.onPageSizeChange - Function to handle page size change
 * @returns {JSX.Element} AllodonTable component
 */
const AllodonTable = ({
  data,
  loading,
  onStatusToggle,
  onRowClick,
  page,
  pageSize,
  totalDocuments,
  onPageChange,
  onPageSizeChange
}) => {
  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <SmartTable
        data={data}
        loading={loading}
        onStatusToggle={onStatusToggle}
        onRowClick={onRowClick}
        page={page}
        pageSize={pageSize}
        totalDocuments={totalDocuments}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </Box>
  );
};

AllodonTable.propTypes = {
  data: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  onStatusToggle: PropTypes.func.isRequired,
  onRowClick: PropTypes.func,
  page: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  totalDocuments: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onPageSizeChange: PropTypes.func.isRequired
};

export default AllodonTable; 