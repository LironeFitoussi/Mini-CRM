import { useState } from 'react';
import { Button, CircularProgress, Tooltip } from '@mui/material';
import SyncIcon from '@mui/icons-material/Sync';
import PropTypes from 'prop-types';

/**
 * SyncButton component
 * A reusable button that triggers data synchronization with backend sources
 * 
 * @param {Object} props - Component props
 * @param {string} props.endpoint - API endpoint to call (defaults to daily sync)
 * @param {function} props.onSuccess - Optional callback function to execute after successful sync
 * @param {Object} props.buttonProps - Additional props to pass to the Button component
 * @returns {JSX.Element} SyncButton component
 */
const SyncButton = ({ 
  endpoint = '/api/v1/daily-sync/trigger', 
  onSuccess,
  buttonProps = {}
}) => {
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);

  // Function to trigger the sync
  const handleSync = async () => {
    setSyncing(true);
    setError(null);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`Sync failed: ${response.statusText}`);
      }
      
      // Wait for the sync to complete
      await response.json();
      
      // Execute success callback if provided
      if (typeof onSuccess === 'function') {
        onSuccess();
      } else {
        // Default behavior: refresh the page
        window.location.reload();
      }
    } catch (err) {
      setError(err.message);
      console.error('Sync error:', err);
    } finally {
      setSyncing(false);
    }
  };

  // Use Tooltip to show error if present
  const buttonElement = (
    <Button
      variant="outlined"
      color={error ? "error" : "primary"}
      onClick={handleSync}
      disabled={syncing}
      startIcon={syncing ? <CircularProgress size={20} /> : <SyncIcon />}
      {...buttonProps}
    >
      {syncing ? "Syncing..." : "Sync Data"}
    </Button>
  );

  return error ? (
    <Tooltip title={`Error: ${error}`}>
      {buttonElement}
    </Tooltip>
  ) : buttonElement;
};

// PropTypes validation
SyncButton.propTypes = {
  endpoint: PropTypes.string,
  onSuccess: PropTypes.func,
  buttonProps: PropTypes.object
};

export default SyncButton; 