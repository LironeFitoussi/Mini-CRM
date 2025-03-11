import PropTypes from "prop-types";
import SmartTable from "./SmartTable";

/**
 * AllodonTable component - specialized table for Allodon clients
 * Wraps SmartTable with specific configuration for Allodon data
 * 
 * @param {Object} props - Component props
 * @param {Array} props.data - Allodon clients data
 * @param {boolean} props.loading - Loading state
 * @param {Function} props.onStatusToggle - Function to toggle client status
 * @param {number} props.page - Current page number
 * @param {number} props.rowsPerPage - Number of rows per page
 * @param {number} props.totalCount - Total count of records
 * @param {Function} props.onPageChange - Function to handle page change
 * @param {Function} props.onPageSizeChange - Function to handle page size change
 * @returns {JSX.Element} AllodonTable component
 */
const AllodonTable = ({
  data,
  loading,
  onStatusToggle,
  page,
  rowsPerPage,
  totalCount,
  onPageChange,
  onPageSizeChange
}) => {
  // We're using the default row click handler built into SmartTable
  const handleClientSelect = () => {
    // Navigation is handled internally by SmartTable
  };

  return (
    <SmartTable
      data={data}
      loading={loading}
      onStatusToggle={onStatusToggle}
      onDonatorSelect={handleClientSelect}
      size="100%"
      page={page}
      rowsPerPage={rowsPerPage}
      totalCount={totalCount}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
    />
  );
};

AllodonTable.propTypes = {
  data: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  onStatusToggle: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  totalCount: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onPageSizeChange: PropTypes.func.isRequired
};

export default AllodonTable; 