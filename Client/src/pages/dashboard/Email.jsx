import React, { useState } from "react";
import {
  Box,
  TextField,
  MenuItem,
  Button,
  Chip,
  Typography,
  Divider,
  Modal,
} from "@mui/material";

const EmailPage = () => {
  // Mock data for "From" emails (approved registered emails from the backend)
  const fromEmails = ["admin@company.com", "support@company.com", "info@company.com"];

  // State variables
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [toRecipients, setToRecipients] = useState([]);
  const [ccRecipients, setCcRecipients] = useState([]);
  const [bccRecipients, setBccRecipients] = useState([]);
  const [openPreview, setOpenPreview] = useState(false);

  // Fixed header and footer templates
  const emailHeader = `
<!-- Email Header -->
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5; padding: 20px;">
  <tr>
    <td align="center">
      <h1 style="margin: 0; color: #333;">Company Name</h1>
    </td>
  </tr>
</table>
`;

  const emailFooter = `
<!-- Email Footer -->
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5; padding: 20px; margin-top: 20px;">
  <tr>
    <td align="center">
      <p style="margin: 0; color: #777;">&copy; 2024 Company Name. All rights reserved.</p>
    </td>
  </tr>
</table>
`;

  // Handle adding multiple recipients
  const handleAddRecipient = (email, setRecipients, recipients) => {
    if (email.trim() && !recipients.includes(email)) {
      setRecipients([...recipients, email]);
    }
  };

  // Handle removing a recipient
  const handleRemoveRecipient = (email, setRecipients, recipients) => {
    setRecipients(recipients.filter((recipient) => recipient !== email));
  };

  // Handle sending the email (mock action)
  const handleSendEmail = () => {
    const fullEmailBody = `${emailHeader}\n${body}\n${emailFooter}`;

    console.log({
      from,
      to: toRecipients,
      cc: ccRecipients,
      bcc: bccRecipients,
      subject,
      body: fullEmailBody,
    });
    alert("Email sent successfully (mock)!");
  };

  // Handle opening and closing the preview modal
  const handleOpenPreview = () => setOpenPreview(true);
  const handleClosePreview = () => setOpenPreview(false);

  // Combine header, body, and footer for preview
  const fullEmailBody = `${emailHeader}\n${body}\n${emailFooter}`;

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

      {/* To Email */}
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
            onDelete={() => handleRemoveRecipient(email, setToRecipients, toRecipients)}
          />
        ))}
      </Box>

      {/* CC Email */}
      <TextField
        label="CC"
        placeholder="Enter CC email"
        value={cc}
        onChange={(e) => setCc(e.target.value)}
        fullWidth
        margin="normal"
        onKeyPress={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleAddRecipient(cc, setCcRecipients, ccRecipients);
            setCc("");
          }
        }}
        helperText="Press Enter to add multiple recipients."
      />
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
        {ccRecipients.map((email) => (
          <Chip
            key={email}
            label={email}
            onDelete={() => handleRemoveRecipient(email, setCcRecipients, ccRecipients)}
          />
        ))}
      </Box>

      {/* BCC Email */}
      <TextField
        label="BCC"
        placeholder="Enter BCC email"
        value={bcc}
        onChange={(e) => setBcc(e.target.value)}
        fullWidth
        margin="normal"
        onKeyPress={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleAddRecipient(bcc, setBccRecipients, bccRecipients);
            setBcc("");
          }
        }}
        helperText="Press Enter to add multiple recipients."
      />
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
        {bccRecipients.map((email) => (
          <Chip
            key={email}
            label={email}
            onDelete={() => handleRemoveRecipient(email, setBccRecipients, bccRecipients)}
          />
        ))}
      </Box>

      {/* Subject */}
      <TextField
        label="Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        fullWidth
        margin="normal"
      />

      {/* Email Body */}
      <TextField
        label="Body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
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
          <Box
            dangerouslySetInnerHTML={{ __html: fullEmailBody }}
          ></Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default EmailPage;
