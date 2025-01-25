import React from "react";
import {
  Box,
  TextField,
  Chip,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";

/**
 * Component that handles the "To Recipients" section, allowing
 * either manual entry of recipients or automatic population
 * from a donors list.
 */
const RecipientsSection = ({
  toMode,
  setToMode,
  to,
  setTo,
  toRecipients,
  setToRecipients,
}) => {
  // Helper to add a single recipient to the toRecipients array
  const handleAddRecipient = (email) => {
    const trimmed = email.trim();
    if (trimmed && !toRecipients.includes(trimmed)) {
      setToRecipients([...toRecipients, trimmed]);
    }
  };

  // Helper to remove a single recipient
  const handleRemoveRecipient = (email) => {
    setToRecipients(toRecipients.filter((r) => r !== email));
  };

  return (
    <Box>
      <FormControl fullWidth margin="normal">
        <InputLabel id="toMode-label">To Recipients Mode</InputLabel>
        <Select
          labelId="toMode-label"
          value={toMode}
          label="To Recipients Mode"
          onChange={(e) => setToMode(e.target.value)}
        >
          <MenuItem value="manual">Manual Entry</MenuItem>
          <MenuItem value="donors">Donators List</MenuItem>
        </Select>
      </FormControl>

      {toMode === "manual" && (
        <>
          <TextField
            label="To"
            placeholder="Enter recipient email"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            fullWidth
            margin="normal"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddRecipient(to);
                setTo("");
              }
            }}
            helperText="Press Enter to add multiple recipients."
          />
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
            {toRecipients.map((email) => (
              <Chip
                key={email}
                label={email}
                onDelete={() => handleRemoveRecipient(email)}
              />
            ))}
          </Box>
        </>
      )}

      {toMode === "donors" && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1">Donators selected:</Typography>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              mt: 1,
              maxHeight: "15vh",
              overflowY: "auto",
            }}
          >
            {toRecipients.map((email) => (
              <Chip key={email} label={email} />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default RecipientsSection;
