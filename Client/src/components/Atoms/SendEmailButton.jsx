// SendEmailButton.jsx
import { useState } from "react";
import PropTypes from "prop-types";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import { Button, Alert, Snackbar } from "@mui/material";
import axios from "axios";

import EmailModal from "../Modals/EmailModal"; // Adjust the import path as needed
import { emailFooter } from "../../utils"; // Adjust the import path as needed
import { useTranslation } from "react-i18next";

const SendEmailButton = ({ recipient }) => {
  // State to control the modal's visibility
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const { t } = useTranslation();
  // State to manage form values
  const [formValues, setFormValues] = useState({
    to: recipient || "",
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

  // Email content generation function similar to the one in EmailForm
  const generateEmailContent = () => {
    return `
      <div style="position: relative; display: inline-block;">
        <div>${formValues.body}</div>
        ${
          formValues.isImageClickable && formValues.imageLink && formValues.imageUrl
            ? `
          <a href="${formValues.imageLink}" target="_blank" rel="noopener noreferrer" style="text-decoration: none;">
            <img src="${formValues.imageUrl}" alt="Email Image" style="max-width: 100%; height: auto; display: block;" />
            <div style="
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              background-color: rgba(0, 0, 0, 0.5);
              color: white;
              padding: 10px 20px;
              border-radius: 5px;
              text-align: center;
              font-size: 16px;
              font-weight: bold;
            ">
              ${formValues.clickableImageText || 'Click here'}
            </div>
          </a>
        `
            : `
          <img src="${formValues.imageUrl}" alt="Email Image" style="max-width: 100%; height: auto;" />
        `
        }
        <!-- Email Footer -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding: 10px; margin-top: 20px;">
          <tr>
            <td align="center">
              <img src="https://image-uploader-lirone-v1.s3.eu-central-1.amazonaws.com/logo%20table%20mail.jpeg" alt="Email Footer" style="max-width: 100%; height: auto;" />
            </td>
          </tr>
        </table>
      </div>
    `;
  };

  // Use the new email content generation function
  const mailContent = generateEmailContent();

  // Function to handle sending the email
  const sendMail = async () => {
    console.log(mailContent);
    
    const mailData = {
      to: formValues.to,
      from: formValues.from,
      subject: formValues.subject,
      body: mailContent,
      imageUrl: formValues.imageUrl,
      imageLink: formValues.imageLink,
      isImageClickable: formValues.isImageClickable,
      clickableImageText: formValues.clickableImageText,
    };

    console.log("Sending email with data:", mailData);

    try {
      await axios.post(
        import.meta.env.VITE_API_URL + "/api/v1/email",
        mailData
      );

      // Show success notification
      setNotification({
        open: true,
        message: "Email sent successfully!",
        severity: "success",
      });

      setEmailModalOpen(false); // Close the modal after sending
      // Optionally, reset form values
      setFormValues({
        to: recipient || "",
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
      console.error("Error sending email:", error);
      setNotification({
        open: true,
        message: "Failed to send email.",
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
    if (recipient) {
      setFormValues((prev) => ({ ...prev, to: recipient }));
      setEmailModalOpen(true);
    } else {
      setNotification({
        open: true,
        message: t("notifications.noMailFound"),
        severity: "error",
      });
    }
  };

  return (
    <>
      <Button
        sx={{
          backgroundColor: "#FFBF00",
          color: "white",
          "&:hover": {
            backgroundColor: "#e0a800",
          },
        }}
        color="primary"
        onClick={handleClick}
      >
        <MailOutlineIcon />
      </Button>
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

SendEmailButton.propTypes = {
  recipient: PropTypes.string,
};

export default SendEmailButton;
