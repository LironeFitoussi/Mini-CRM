// EmailForm.jsx
import React, { useState } from "react";
import { Box, TextField, MenuItem, Button, Select, FormControl, InputLabel } from "@mui/material";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

import ImageUploader from "../../components/ImageUploader";
import EmailPreviewModal from "../Modals/EmailPreviewModal"; // Adjust the import path as needed

/**
 * Component for the primary email form: 
 * "From" selection, "Subject", "Body", "Image Position", and "Image Uploader".
 */
const EmailForm = ({
  formValues: { from, subject, body, emailFooter, imagePosition, imageUrl },
  mailContent,
  handleChange,
  handleSubmit,
}) => {
  // Quill modules and formats for basic formatting including hyperlinks
  const quillModules = {
    toolbar: [
      ["bold", "italic", "underline"],
      ["link"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["clean"],
    ],
  };
  const [emailPreviewOpen, setEmailPreviewOpen] = useState(false);

  const fromEmails = [
    "lironefit@gmail.com",
    "contact.lesenfantsderachi@gmail.com",
  ];

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
    // Compose the full email body with the image 
    setEmailPreviewOpen(true);
  }

  return (
    <Box>
      {/* From Email */}
      <TextField
        select
        label="From"
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

      {/* Subject */}
      <TextField
        label="Subject"
        value={subject}
        name="subject"
        onChange={handleFormChange}
        fullWidth
        margin="normal"
      />

      {/* Email Body (Rich Text Editor) */}
      <ReactQuill
        theme="snow"
        value={body}
        onChange={(value) => handleChange("body", value)}
        modules={quillModules}
        formats={quillFormats}
        style={{ backgroundColor: "#fff", borderRadius: "4px", marginTop: "16px" }}
      />

      {/* Image Position Toggle */}
      <FormControl fullWidth margin="normal">
        <InputLabel id="imagePosition-label">Image Position</InputLabel>
        <Select
          labelId="imagePosition-label"
          value={imagePosition}
          label="Image Position"
          name="imagePosition"
          onChange={handleFormChange}
        >
          <MenuItem value="top">Top</MenuItem>
          <MenuItem value="bottom">Bottom</MenuItem>
        </Select>
      </FormControl>

      {/* Image Upload */}
      <ImageUploader handleChange={handleChange} imageUrl={imageUrl} />

      {/* Action Buttons */}
      <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
        >
          Send Email
        </Button>
        <Button
          variant="outlined"
          // You can implement preview functionality here if needed
          onClick={handlePreview}
        >
          Preview Email
        </Button>
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
