import React, { useState } from "react";
import { Box, TextField, Button, CircularProgress } from "@mui/material";

const NewNoteInput = ({ onAddNote, isLoading, placeholder }) => {
  // The child manages its own input state
  const [noteText, setNoteText] = useState("");

  // Handler to call parent mutation
  const handleSubmit = () => {
    if (noteText.trim()) {
      <p></p>;
      onAddNote(noteText.trim());
      setNoteText(""); // Clear local state after submit
    }
  };

  return (
    <Box display="flex" alignItems="center" mb={2}>
      <TextField
        label={placeholder} // e.g. t("donatorNotes.addNotePlaceholder")
        variant="outlined"
        fullWidth
        multiline
        minRows={3} // Adjust as needed for default height
        value={noteText}
        onChange={(e) => setNoteText(e.target.value)}
        disabled={isLoading}
        sx={{ mr: 2 }}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? <CircularProgress size={24} color="inherit" /> : "Submit"}
      </Button>
    </Box>
  );
};

export default NewNoteInput;
