import { useEffect } from "react";
import { Box, Typography, Divider, Modal } from "@mui/material";
import PropTypes from "prop-types";

/**
 * A simple modal to display the composed email for preview purposes.
 */
const EmailPreviewModal = ({ open, onClose, fullEmailBody }) => {
  // Log the content when the modal opens or content changes
  useEffect(() => {
    if (open) {
      console.log('EmailPreviewModal received content:', fullEmailBody);
      
      // Check if the content contains image tags
      const imageRegex = /<img[^>]+src="([^">]+)"/g;
      const matches = [...fullEmailBody.matchAll(imageRegex)];
      
      if (matches.length > 0) {
        console.log('Found images in content:', matches.length);
        matches.forEach((match, index) => {
          console.log(`Image ${index + 1} src:`, match[1]);
        });
      } else {
        console.log('No images found in the content');
      }
    }
  }, [open, fullEmailBody]);

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

EmailPreviewModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  fullEmailBody: PropTypes.string.isRequired
};

export default EmailPreviewModal;
