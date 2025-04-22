import { useState, useEffect } from "react";
import { Box, Typography, Divider } from "@mui/material";
import axios from "axios";

import RecipientsSection from "../../components/Atoms/RecipientsSection";
import EmailForm from "../../components/Molecules/EmailForm";
import EmailPreviewModal from "../../components/Modals/EmailPreviewModal";

/**
 * Main container component that orchestrates fetching donors,
 * handling state for 'from', 'to', 'subject', 'body', image uploads, etc.
 */
const EmailPage = () => {
  // Mock data for "From" emails (approved registered emails from the backend)
  const fromEmails = [
    // "lironefit@gmail.com",
    "contact.lesenfantsderachi@gmail.com",
  ];

  // State variables
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [toMode, setToMode] = useState("manual"); // "manual" or "donors"
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [imagePosition, setImagePosition] = useState("top");
  const [imageUrl, setImageUrl] = useState(null);

  // Recipients arrays
  const [toRecipients, setToRecipients] = useState([]);

  // Donators fetched from the API
  const [donors, setDonators] = useState([]);

  // Preview modal
  const [openPreview, setOpenPreview] = useState(false);

  // Footer image (example)
  const emailFooter = `
<!-- Email Footer -->
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding: 10px; margin-top: 20px;">
  <tr>
    <td align="center">
      <img src="https://image-uploader-lirone-v1.s3.eu-central-1.amazonaws.com/logo%20table%20mail.jpeg"
           alt="Email Footer"
           style="max-width: 100%; height: auto;" />
    </td>
  </tr>
</table>
`;

  // Fetch donors on component mount
  useEffect(() => {
    const fetchDonators = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/v1/donors?page=1&limit=1200`
        );
        const result = await response.json();
        const fetchedDonators = result.donors || [];
        setDonators(fetchedDonators);
      } catch (error) {
        console.error("Error fetching donors:", error);
      }
    };
    fetchDonators();
  }, []);

  /**
   * Whenever toMode = 'donors', we automatically populate toRecipients
   * with all unique emails from the donors list.
   */
  useEffect(() => {
    if (toMode === "donors") {
      // Extract all emails from donors
      const donorEmails = donors.reduce((acc, donor) => {
        const donorEmailsArray = Object.keys(donor)
          .filter((key) => key.startsWith("email_"))
          .map((emailKey) => donor[emailKey])
          .filter(Boolean); // filter out any falsy values
        return [...acc, ...donorEmailsArray];
      }, []);

      // Remove duplicates
      const uniqueDonorEmails = [...new Set(donorEmails)];
      setToRecipients(uniqueDonorEmails);
    } else {
      // If switching back to manual, clear the toRecipients
      setToRecipients([]);
    }
  }, [toMode, donors]);

  // Combine body, optional image, and footer
  const fullEmailBody = `
    ${imagePosition === "top" && imageUrl ? `<img src="${imageUrl}" alt="Email Image" /><br/>` : ""}
    ${body}
    ${imagePosition === "bottom" && imageUrl ? `<img src="${imageUrl}" alt="Email Image" /><br/>` : ""}
    ${emailFooter}
  `;

  /**
   * Sends email via the backend API.
   */
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

  // Preview modal handlers
  const handleOpenPreview = () => setOpenPreview(true);
  const handleClosePreview = () => setOpenPreview(false);

  // Used to disable the "Send Email" button if mandatory fields are empty
  const canSendEmail = from && toRecipients.length && subject && body;

  return (
    <Box sx={{ padding: 4, bgcolor: "gray.100", minHeight: "100vh" }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Compose Email
      </Typography>
      <Divider sx={{ mb: 4 }} />

      {/* Recipients section (manual vs. donors) */}
      <RecipientsSection
        toMode={toMode}
        setToMode={setToMode}
        to={to}
        setTo={setTo}
        toRecipients={toRecipients}
        setToRecipients={setToRecipients}
      />

      {/* Main form: From, Subject, Body, Image Uploader, etc. */}
      <EmailForm
        fromEmails={fromEmails}
        from={from}
        setFrom={setFrom}
        subject={subject}
        setSubject={setSubject}
        body={body}
        setBody={setBody}
        imagePosition={imagePosition}
        setImagePosition={setImagePosition}
        imageUrl={imageUrl}
        setImageUrl={setImageUrl}
        onSendEmail={handleSendEmail}
        onOpenPreview={handleOpenPreview}
        canSendEmail={canSendEmail}
      />

      {/* Preview Modal */}
      <EmailPreviewModal
        open={openPreview}
        onClose={handleClosePreview}
        fullEmailBody={fullEmailBody}
      />
    </Box>
  );
};

export default EmailPage;
