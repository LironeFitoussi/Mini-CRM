// SendEmailButton.jsx
import React, { useState } from "react";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import { Button } from "@mui/material";
import axios from "axios";

import EmailModal from "../Modals/EmailModal"; // Adjust the import path as needed

const SendEmailButton = ({ recipient }) => {
  // State to control the modal's visibility
  const [emailModalOpen, setEmailModalOpen] = useState(false);

  // State to manage form values
  const [formValues, setFormValues] = useState({
    to: recipient || "",
    from: "lironefit@gmail.com", // Default "From" email
    subject: "",
    body: "",
    imagePosition: "top", // Default image position
    imageUrl: "",
  });

  // Function to handle sending the email
  const sendMail = async () => {
    const mailData = {
      to: formValues.to,
      from: formValues.from,
      subject: formValues.subject,
      body: formValues.body,
      imagePosition: formValues.imagePosition,
      imageUrl: formValues.imageUrl,
    };

    try {
      const response = await axios.post("http://localhost:5000/send-email", mailData);
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
  const handleSubmit = () => {
    // You can add form validation here if needed
    sendMail();
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
          marginRight: 2,
          backgroundColor: "#FFBF00",
          color: "white",
          "&:hover": {
            backgroundColor: "#e0a800",
          },
        }}
        color="primary"
        startIcon={<MailOutlineIcon />}
        onClick={handleClick}
      >
        Email
      </Button>
      <EmailModal
        open={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        formValues={formValues}
      />
    </>
  );
};

export default SendEmailButton;
