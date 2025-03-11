import { TextField } from "@mui/material";
import PropTypes from "prop-types";

/**
 * SearchBar component for searching data
 * 
 * @param {Object} props - Component props
 * @param {string} props.value - Current search query value
 * @param {Function} props.onChange - Function to handle search input changes
 * @param {string} props.label - Label for the search input
 * @param {string} props.placeholder - Placeholder text
 * @returns {JSX.Element} Search bar component
 */
const SearchBar = ({ 
  value, 
  onChange, 
  label = "Search", 
  placeholder = "Search...",
}) => {
  return (
    <TextField
      label={label}
      variant="outlined"
      fullWidth
      margin="normal"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      InputProps={{
        sx: { borderRadius: 2 }
      }}
    />
  );
};

SearchBar.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  placeholder: PropTypes.string,
};

export default SearchBar; 