import { useState } from "react";
import CampaignIcon from "@mui/icons-material/Campaign";
import { Button, Alert, Snackbar, Tooltip } from "@mui/material";
import axios from "axios";
import PropTypes from 'prop-types';

import EmailModal from "../Modals/EmailModal";
import { emailFooter } from "../../utils";
import { useTranslation } from "react-i18next";

const BroadcastEmailButton = ({ fetchEmails }) => {
  // State to control the modal's visibility
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const { t } = useTranslation();
  
  // State to manage form values
  const [formValues, setFormValues] = useState({
    to: "",
    from: "contact.lesenfantsderachi@gmail.com", // Default "From" email
    subject: "",
    body: "",
    emailFooter: emailFooter,
    imagePosition: "top", // Default image position
    imageUrl: "",
    imageLink: "", // Add imageLink field
    isImageClickable: false, // Add isImageClickable field
    clickableImageText: "", // Add clickableImageText field
  });

  // State for notifications
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success", // "success" or "error"
  });

  // State for loading
  const [loading, setLoading] = useState(false);

  // Function to fetch donor emails
  const fetchDonorEmails = async () => {
    setLoading(true);
    try {
      // If a custom fetch function was provided, use it
      if (fetchEmails) {
        const emails = await fetchEmails();
        setFormValues(prev => ({
          ...prev,
          to: emails,
        }));
      } else {
        // Default behavior - fetch all donors
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/v1/donors?limit=10000`
        );
        console.log(response.data.donors.length);
        const emails = response.data.donors
          .filter(donor => donor?.email_1?.email && donor?.email_1?.email?.trim() !== "" && donor?.email_1?.isSubscribed)
          .map(donor => donor?.email_1?.email);
        const uniqueEmails = [...new Set(emails)];
        // console.log(uniqueEmails);
        setFormValues(prev => ({
          ...prev,
          to: uniqueEmails,
        }));
      }
    } catch (error) {
      console.error("Error fetching donor emails:", error);
      setNotification({
        open: true,
        message: t("notifications.errorFetchingEmails") || "Failed to fetch donor emails.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const mailContent = `
    ${
      formValues.imagePosition === "top" && formValues.imageUrl
        ? `<img src="${formValues.imageUrl}" alt="Email Header" style="max-width: 100%; height: auto;" />`
        : ""
    }
    ${formValues.body}
    ${
      formValues.imagePosition === "bottom" && formValues.imageUrl
        ? `<img src="${formValues.imageUrl}" alt="Email Footer" style="max-width: 100%; height: auto;" />`
        : ""
    }
    ${emailFooter}
  `;

  // Function to prepare the email modal with donor emails
  const prepareEmailModal = () => {
    fetchDonorEmails();
    setFormValues(prev => ({
      ...prev,
      subject: t("email.broadcastSubject") || "Important Update from Our Organization"
    }));
    setEmailModalOpen(true);
  };

  // Function to handle sending the email
  const sendMail = async () => {
    // Convert comma-separated emails back to an array for sending
    const emailsArray = Array.isArray(formValues.to) ? formValues.to : formValues.to.split(",").map(email => email.trim());
    
    const mailData = {
      to: emailsArray,
      from: formValues.from,
      subject: formValues.subject,
      body: mailContent,
      imageUrl: formValues.imageUrl,
    };

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/email`,
        mailData
      );

      // Show success notification
      setNotification({
        open: true,
        message: t("notifications.emailSentSuccess") || "Broadcast email sent successfully!",
        severity: "success",
      });

      setEmailModalOpen(false); // Close the modal after sending
      // Reset form values
      setFormValues({
        to: "",
        from: "contact.lesenfantsderachi@gmail.com",
        subject: "",
        body: "",
        imagePosition: "top",
        imageUrl: "",
        imageLink: "",
        isImageClickable: false,
        clickableImageText: "",
      });
    } catch (error) {
      // Show error notification
      console.error("Error sending broadcast email:", error);
      setNotification({
        open: true,
        message: t("notifications.emailSendFailed") || "Failed to send broadcast email.",
        severity: "error",
      });
    }
  };

  // Function to handle form input changes
  const handleChange = (name, value) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  // Function to handle form submission
  const handleSubmit = async () => {
    await sendMail();
  };

  // Function to handle button click
  const handleClick = () => {
    prepareEmailModal();
  };

  return (
    <>
      <Tooltip title={t("buttons.broadcastEmail") || "Send Email to All Donors"}>
        <Button
          variant="contained"
          sx={{
            backgroundColor: "#4CAF50", // Green color for broadcast
            color: "white",
            "&:hover": {
              backgroundColor: "#388E3C",
            },
          }}
          onClick={handleClick}
          disabled={loading}
        >
          <CampaignIcon />
          {t("buttons.broadcast") || "Broadcast"}
        </Button>
      </Tooltip>
      
      <EmailModal
        open={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        formValues={formValues}
        mailContent={mailContent}
      />

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setNotification((prev) => ({ ...prev, open: false }))}
          severity={notification.severity}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
};

BroadcastEmailButton.propTypes = {
  fetchEmails: PropTypes.func
};

export default BroadcastEmailButton; 