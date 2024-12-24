import React from "react";
import { Box, Typography, Divider, Modal } from "@mui/material";

/**
 * A simple modal to display the composed email for preview purposes.
 */
const EmailPreviewModal = ({ open, onClose, fullEmailBody }) => {
  return (
    <Modal open={open} onClose={onClose}>
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
          Email Preview
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Box dangerouslySetInnerHTML={{ __html: fullEmailBody }} />
      </Box>
    </Modal>
  );
};

export default EmailPreviewModal;
