import React, { useState } from "react";
import {
  Box,
  TextField,
  MenuItem,
  Button,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
} from "@mui/material";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

import ImageUploader from "../../components/ImageUploader";
import EmailPreviewModal from "../Modals/EmailPreviewModal";
import { useTranslation } from "react-i18next";
import UseTemplateButton from "../Atoms/UseTemplateButton";

const EmailForm = ({
  formValues: { from, subject, body, emailFooter, imagePosition, imageUrl },
  mailContent,
  handleChange,
  handleSubmit,
}) => {
  const { t } = useTranslation();

  const [emailPreviewOpen, setEmailPreviewOpen] = useState(false);
  const [isSending, setIsSending] = useState(false); // New state for loading spinner

  const fromEmails = [
    "lironefit@gmail.com",
    "contact.lesenfantsderachi@gmail.com",
  ];

  const quillModules = {
    toolbar: [
      ["bold", "italic", "underline"],
      ["link"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["clean"],
    ],
  };

  const quillFormats = [
    "bold",
    "italic",
    "underline",
    "link",
    "list",
    "bullet",
  ];

  const handleFormChange = (e) => {
    handleChange(e.target.name, e.target.value);
  };

  const handlePreview = () => {
    setEmailPreviewOpen(true);
  };
  
  const handleEmailSubmit = async () => {
    setIsSending(true); // Start loading state
    try {
      await handleSubmit(); // Wait for the email submission to complete
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Failed to send email.");
    }
    setIsSending(false); // Reset loading
  };

  return (
    <Box>
      <TextField
        select
        label={t("emailFrom") || "From"}
        value={from}
        name="from"
        onChange={handleFormChange}
        fullWidth
        margin="normal"
        helperText="Select an email address to send from."
      >
        {fromEmails.map((email) => (
          <MenuItem key={email} value={email}>
            {email}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        label={t("emailSubject") || "Subject"}
        value={subject}
        name="subject"
        onChange={handleFormChange}
        fullWidth
        margin="normal"
      />

      <ReactQuill
        theme="snow"
        value={body}
        onChange={(value) => handleChange("body", value)}
        modules={quillModules}
        formats={quillFormats}
        style={{
          backgroundColor: "#fff",
          borderRadius: "4px",
          marginTop: "16px",
        }}
      />

      <FormControl fullWidth margin="normal">
        <InputLabel id="imagePosition-label">
          {t("emailImagePosition") || "Image Position"}
        </InputLabel>
        <Select
          labelId="imagePosition-label"
          value={imagePosition}
          label={t("emailImagePosition") || "Image Position"}
          name="imagePosition"
          onChange={handleFormChange}
        >
          <MenuItem value="top">
            {t("emailImageTop") || "Top (default)"}
          </MenuItem>
          <MenuItem value="bottom">
            {t("emailImageBottom") || "Bottom"}
          </MenuItem>
        </Select>
      </FormControl>

      <ImageUploader handleChange={handleChange} imageUrl={imageUrl} />

      <Box
        sx={{ mt: 2, display: "flex", gap: 2, justifyContent: "space-between" }}
      >
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleEmailSubmit}
            disabled={isSending} // Disable the button while sending
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isSending ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              t("emailSend") || "Send Email"
            )}
          </Button>
          <Button variant="outlined" onClick={handlePreview}>
            {t("emailPreview") || "Preview Email"}
          </Button>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <UseTemplateButton handleChange={handleChange} />
        </Box>
      </Box>

      <EmailPreviewModal
        open={emailPreviewOpen}
        onClose={() => setEmailPreviewOpen(false)}
        fullEmailBody={mailContent}
      />
    </Box>
  );
};

export default EmailForm;
