// EmailModal.jsx
import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  Button,
} from "@mui/material";
import { useTranslation } from "react-i18next";

import EmailForm from "../Molecules/EmailForm"; // Adjust the import path as needed
import SaveAsTemplateButton from "../Atoms/SaveAsTemplateButton"; // Adjust the import path as needed
const EmailModal = ({
  open,
  onClose,
  handleChange,
  handleSubmit,
  formValues,
  mailContent,
}) => {
  const { t } = useTranslation();

  console.log(formValues);
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <Box sx={{ display: "flex", justifyContent: "space-between", p: 2 }}>
        <DialogTitle>{t("emailModalTitle") || "Send Email"}</DialogTitle>
        <SaveAsTemplateButton
          subject={formValues.subject}
          body={formValues.body}
          imageUrl={formValues.imageUrl}
          imagePosition={formValues.imagePosition}
        />
      </Box>
      <DialogContent>
        <EmailForm
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          formValues={formValues}
          mailContent={mailContent}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EmailModal;
