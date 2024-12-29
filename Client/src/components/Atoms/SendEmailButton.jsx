// SendEmailButton.jsx
import React, { useState } from "react";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import { Button } from "@mui/material";
import axios from "axios";

import EmailModal from "../Modals/EmailModal"; // Adjust the import path as needed
import { emailFooter } from "../../utils"; // Adjust the import path as needed
const SendEmailButton = ({ recipient }) => {
  // State to control the modal's visibility
  const [emailModalOpen, setEmailModalOpen] = useState(false);

  // State to manage form values
  const [formValues, setFormValues] = useState({
    to: recipient || "",
    from: "contact.lesenfantsderachi@gmail.com", // Default "From" email
    subject: "",
    body: "",
    emailFooter: emailFooter,
    imagePosition: "top", // Default image position
    imageUrl: "",
  });

  const mailContent = `
    ${formValues.imagePosition === "top"  && formValues.imageUrl ? `<img src="${formValues.imageUrl}" alt="Email Header" style="max-width: 100%; height: auto;" />` : ""}
    ${formValues.body}
    ${formValues.imagePosition === "bottom" && formValues.imageUrl ? `<img src="${formValues.imageUrl}" alt="Email Footer" style="max-width: 100%; height: auto;" />` : ""}
    ${emailFooter}
  `;

  // Function to handle sending the email
  const sendMail = async () => {
    const mailData = {
      to: formValues.to,
      from: formValues.from,
      subject: formValues.subject,
      body: mailContent,
      imageUrl: formValues.imageUrl,
    };

    console.log("Sending email with data:", mailData);
    
    try {
      const response = await axios.post(import.meta.env.VITE_API_URL + "/api/v1/email", mailData);
      
      // Handle success (e.g., show a success message)
      alert("Email sent successfully!");
      setEmailModalOpen(false); // Close the modal after sending
      // Optionally, reset form values
      setFormValues({
        to: recipient || "",
        from: "lironefit@gmail.com",
        subject: "",
        body: "",
        imagePosition: "top",
        imageUrl: "",
      });
    } catch (error) {
      // Handle error (e.g., show an error message)
      console.error("Error sending email:", error);
      alert("Failed to send email.");
    }
  };

  // Function to handle form input changes
  const handleChange = (name, value) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  // Function to handle form submission
  const handleSubmit = async () => {
    // You can add form validation here if needed
    await sendMail();
  };

  // Function to handle button click
  const handleClick = () => {
    if (recipient) {
      setFormValues((prev) => ({ ...prev, to: recipient }));
      setEmailModalOpen(true);
    } else {
      alert("No email address found.");
    }
  };

  return (
    <>
      <Button
        sx={{
          // marginRight: 2,
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
    </>
  );
};

export default SendEmailButton;
