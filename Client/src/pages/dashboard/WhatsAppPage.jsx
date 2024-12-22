import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Chip,
  Typography,
  Divider,
  Modal,
} from "@mui/material";

// Comment 

const WhatsAppPage = () => {
  // State variables
  const [to, setTo] = useState("");
  const [recipients, setRecipients] = useState([]);
  const [message, setMessage] = useState("");
  const [openPreview, setOpenPreview] = useState(false);

  // Handle adding multiple recipients
  const handleAddRecipient = () => {
    if (to.trim() && !recipients.includes(to)) {
      setRecipients([...recipients, to]);
      setTo("");
    }
  };

  // Handle removing a recipient
  const handleRemoveRecipient = (recipient) => {
    setRecipients(recipients.filter((r) => r !== recipient));
  };

  // Handle sending WhatsApp message (mock action)
  const handleSendMessage = () => {
    // console.log({
    //   recipients,
    //   message,
    // });
    alert("WhatsApp message sent successfully (mock)!");
  };

  // Handle opening and closing the preview modal
  const handleOpenPreview = () => setOpenPreview(true);
  const handleClosePreview = () => setOpenPreview(false);

  return (
    <Box sx={{ padding: 4, bgcolor: "gray.100", minHeight: "100vh" }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Send WhatsApp Message
      </Typography>
      <Divider sx={{ mb: 4 }} />

      {/* To Field */}
      <TextField
        label="To"
        placeholder="Enter recipient phone number"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        fullWidth
        margin="normal"
        onKeyPress={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleAddRecipient();
          }
        }}
        helperText="Press Enter to add multiple recipients."
      />
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
        {recipients.map((recipient) => (
          <Chip
            key={recipient}
            label={recipient}
            onDelete={() => handleRemoveRecipient(recipient)}
          />
        ))}
      </Box>

      {/* Message Body */}
      <TextField
        label="Message"
        placeholder="Type your message here..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        fullWidth
        margin="normal"
        multiline
        rows={6}
      />

      {/* Action Buttons */}
      <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSendMessage}
          disabled={!recipients.length || !message}
        >
          Send Message
        </Button>
        <Button variant="outlined" onClick={handleOpenPreview}>
          Preview Message
        </Button>
      </Box>

      {/* Message Preview Modal */}
      <Modal open={openPreview} onClose={handleClosePreview}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            width: "80%",
            maxHeight: "80%",
            overflowY: "auto",
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            WhatsApp Message Preview
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            <strong>Recipients:</strong> {recipients.join(", ")}
          </Typography>
          <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
            <strong>Message:</strong>
            <br />
            {message}
          </Typography>
        </Box>
      </Modal>
    </Box>
  );
};

export default WhatsAppPage;
