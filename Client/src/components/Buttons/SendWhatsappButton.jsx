// SendWhatsappButton.jsx
import { useState } from "react";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { Button, Modal, Box, TextField, Typography } from "@mui/material";
import PropTypes from 'prop-types';

const SendWhatsappButton = ({ recipientPhone }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [formValues, setFormValues] = useState({
    message: "",
  });

SendWhatsappButton.propTypes = {
  recipientPhone: PropTypes.string
};

  const handleClick = () => {
    setModalOpen(true);
  };

  const handleSend = () => {
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${
      recipientPhone.replace(/^\+/, '')
    }&text=${encodeURIComponent(formValues.message)}`;
    window.open(whatsappUrl, "_blank");
    setModalOpen(false);
  };

  const handleChange = (name, value) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  if (!recipientPhone) {
    return (
      <Button
        sx={{
          backgroundColor: "#6a6a6a",
          color: "white",
          "&:hover": {
            backgroundColor: "#1DA851",
          },
        }}
        onClick={handleClick}
        disabled
      >
        <WhatsAppIcon />
      </Button>
    );
  }

  return (
    <>
      <Button
        sx={{
          backgroundColor: "#25D366",
          color: "white",
          "&:hover": {
            backgroundColor: "#1DA851",
          },
        }}
        onClick={handleClick}
      >
        <WhatsAppIcon />
      </Button>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Send WhatsApp Message
          </Typography>
          <TextField
            fullWidth
            label="Phone Number"
            margin="normal"
            value={recipientPhone}
            disabled
            onChange={(e) => handleChange("phone", e.target.value)}
          />
          <TextField
            fullWidth
            label="Message"
            multiline
            rows={4}
            margin="normal"
            value={formValues.message}
            onChange={(e) => handleChange("message", e.target.value)}
          />
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={handleSend}
          >
            Send
          </Button>
        </Box>
      </Modal>
    </>
  );
};

export default SendWhatsappButton;
