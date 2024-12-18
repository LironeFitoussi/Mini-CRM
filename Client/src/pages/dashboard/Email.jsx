import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  MenuItem,
  Button,
  Chip,
  Typography,
  Divider,
  Modal,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";

import axios from "axios";

import ImageUploader from "../../components/ImageUploader";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const EmailPage = () => {
  // Mock data for "From" emails (approved registered emails from the backend)
  const fromEmails = [
    "lironefit@gmail.com",
    "contact.lesenfantsderachi@gmail.com",
    "info@company.com",
  ];

  // State variables
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  // const [cc, setCc] = useState("");
  // const [bcc, setBcc] = useState("");
  const [imagePosition, setImagePosition] = useState("top");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState(""); // Will hold HTML from ReactQuill
  const [toRecipients, setToRecipients] = useState([]);
  // const [ccRecipients, setCcRecipients] = useState([]);
  // const [bccRecipients, setBccRecipients] = useState([]);
  const [openPreview, setOpenPreview] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);

  // New state for choosing how to populate the 'To' field
  const [toMode, setToMode] = useState("manual"); // "manual" or "donators"

  // State for fetched donators
  const [donators, setDonators] = useState([]);

  console.log(body);

  // Fetch donators on component mount
  useEffect(() => {
    const fetchDonators = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/v1/donators?page=1&limit=1200`
        );
        const result = await response.json();

        // Adjust based on actual API response structure:
        const fetchedDonators = result.donators || [];
        setDonators(fetchedDonators);
      } catch (error) {
        console.error("Error fetching donators:", error);
      }
    };

    fetchDonators();
  }, []);

  // Fixed header and footer templates
//   const emailHeader = `
// <!-- Email Header -->
// <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5; padding: 20px;">
//   <tr>
//     <td align="center">
//       <h1 style="margin: 0; color: #333;">Les Enfant de Rachi</h1>
//     </td>
//   </tr>
// </table>
// `;

  // Footer is image from public folder
  const emailFooter = `
<!-- Email Footer -->
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding: 10px; margin-top: 20px;">
  <tr>
    <td align="center">
      <img src="https://image-uploader-lirone-v1.s3.eu-central-1.amazonaws.com/logo%20table%20mail.jpeg" alt="Email Footer" style="max-width: 100%; height: auto;" />
    </td>
  </tr>
</table>
`;

  // Handle adding multiple recipients for manual mode
  const handleAddRecipient = (email, setRecipients, recipients) => {
    if (email.trim() && !recipients.includes(email)) {
      setRecipients([...recipients, email]);
    }
  };

  // Handle removing a recipient
  const handleRemoveRecipient = (email, setRecipients, recipients) => {
    setRecipients(recipients.filter((recipient) => recipient !== email));
  };

  // Populate toRecipients when toMode changes to "donators"
  useEffect(() => {
    if (toMode === "donators") {
      // Extract all emails from donators
      const donorEmails = donators.reduce((acc, donor) => {
        // Gather all email fields from the donor object that start with "email_"
        const donorEmailsArray = Object.keys(donor)
          .filter((key) => key.startsWith("email_"))
          .map((emailKey) => donor[emailKey])
          .filter(Boolean); // filter out any falsy values
        return [...acc, ...donorEmailsArray];
      }, []);

      // Remove duplicates if any
      const uniqueDonorEmails = [...new Set(donorEmails)];
      setToRecipients(uniqueDonorEmails);
    } else {
      // If switching back to manual, clear current toRecipients
      setToRecipients([]);
    }
  }, [toMode, donators]);

  // Combine header, body, image (if present), and footer
  const fullEmailBody = `
  // ${emailHeader}
  ${imagePosition === "top" && imageUrl ? `<img src="${imageUrl}" alt="Email Image" /><br/>` : ""}
  ${body}
  ${imagePosition === "bottom" && imageUrl ? `<img src="${imageUrl}" alt="Email Image" /><br/>` : ""}
  ${emailFooter}
`;

  // Handle sending the email (mock action)
  const handleSendEmail = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/email/`, {
        from,
        to: toRecipients,
        subject,
        body: fullEmailBody,
      });

      alert("Email sent successfully!");
    } catch (error) {
      console.error("Error sending email:", error);
      alert("Failed to send email. Please try again.");
    }
  };

  // Handle opening and closing the preview modal
  const handleOpenPreview = () => setOpenPreview(true);
  const handleClosePreview = () => setOpenPreview(false);

  // Quill modules and formats for basic formatting including hyperlinks
  const quillModules = {
    toolbar: [
      ["bold", "italic", "underline"], // Basic inline formatting controls
      ["link"], // Add the link button
      [{ list: "ordered" }, { list: "bullet" }],
      ["clean"],
    ],
    // Optional: Custom handlers can be added here
    // handlers: {
    //   link: function (value) {
    //     if (value) {
    //       const href = prompt("Enter the URL");
    //       if (href) {
    //         const range = this.quill.getSelection();
    //         this.quill.format("link", href);
    //         // Add target="_blank" and rel="noopener noreferrer" to the link
    //         setTimeout(() => {
    //           const editor = this.quill.root;
    //           const link = editor.querySelector(`a[href="${href}"]`);
    //           if (link) {
    //             link.setAttribute("target", "_blank");
    //             link.setAttribute("rel", "noopener noreferrer");
    //           }
    //         }, 100);
    //       }
    //     } else {
    //       this.quill.format("link", false);
    //     }
    //   },
    // },
  };

  const quillFormats = [
    "bold",
    "italic",
    "underline",
    "link", // Allow link formatting
    "list",
    "bullet",
  ];

  return (
    <Box sx={{ padding: 4, bgcolor: "gray.100", minHeight: "100vh" }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Compose Email
      </Typography>
      <Divider sx={{ mb: 4 }} />

      {/* From Email */}
      <TextField
        select
        label="From"
        value={from}
        onChange={(e) => setFrom(e.target.value)}
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

      {/* To Mode Selection */}
      <FormControl fullWidth margin="normal">
        <InputLabel id="toMode-label">To Recipients Mode</InputLabel>
        <Select
          labelId="toMode-label"
          value={toMode}
          label="To Recipients Mode"
          onChange={(e) => setToMode(e.target.value)}
        >
          <MenuItem value="manual">Manual Entry</MenuItem>
          <MenuItem value="donators">Donators List</MenuItem>
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
                handleAddRecipient(to, setToRecipients, toRecipients);
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
                onDelete={() =>
                  handleRemoveRecipient(email, setToRecipients, toRecipients)
                }
              />
            ))}
          </Box>
        </>
      )}

      {toMode === "donators" && (
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

      {/* Subject */}
      <TextField
        label="Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        fullWidth
        margin="normal"
      />

      {/* Email Body (Rich Text Editor) */}
      <Typography variant="body1" sx={{ mt: 2, mb: 1 }}>
        Body:
      </Typography>
      <ReactQuill
        theme="snow"
        value={body}
        onChange={setBody}
        modules={quillModules}
        formats={quillFormats}
        style={{ backgroundColor: "#fff", borderRadius: "4px" }}
      />

      {/* Image Position Toggle */}
      <FormControl fullWidth margin="normal">
        <InputLabel id="imagePosition-label">Image Position</InputLabel>
        <Select
          labelId="imagePosition-label"
          value={imagePosition}
          label="Image Position"
          onChange={(e) => setImagePosition(e.target.value)}
        >
          <MenuItem value="top">Top</MenuItem>
          <MenuItem value="bottom">Bottom</MenuItem>
        </Select>
      </FormControl>
      {/* Image Upload */}
      <ImageUploader setImageUrl={setImageUrl} />

      {/* Action Buttons */}
      <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSendEmail}
          disabled={!from || !toRecipients.length || !subject || !body}
        >
          Send Email
        </Button>
        <Button variant="outlined" onClick={handleOpenPreview}>
          Preview Email
        </Button>
      </Box>

      {/* Email Preview Modal */}
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
            Email Preview
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Box dangerouslySetInnerHTML={{ __html: fullEmailBody }}></Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default EmailPage;
