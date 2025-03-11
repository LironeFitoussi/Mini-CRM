import { Box, Typography } from "@mui/material";
import PropTypes from "prop-types";

/**
 * PageHeader component provides a consistent page header layout
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Page title text
 * @param {React.ReactNode} props.actions - Action buttons/components to show in header
 * @returns {JSX.Element} Page header component
 */
const PageHeader = ({ title, actions }) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 2
      }}
    >
      <Typography variant="h4" component="h1" gutterBottom>
        {title}
      </Typography>

      {actions && (
        <Box sx={{ display: "flex", gap: 2 }}>
          {actions}
        </Box>
      )}
    </Box>
  );
};

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  actions: PropTypes.node
};

export default PageHeader; 