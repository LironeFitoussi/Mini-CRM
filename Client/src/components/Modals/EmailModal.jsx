// EmailModal.jsx
import React from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, Button } from "@mui/material";
import { useTranslation } from "react-i18next";

import EmailForm from "../Molecules/EmailForm"; // Adjust the import path as needed

const EmailModal = ({ open, onClose, handleChange, handleSubmit, formValues, mailContent }) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{t("emailModalTitle") || "Send Email"}</DialogTitle>
      <DialogContent>
        <EmailForm handleChange={handleChange} handleSubmit={handleSubmit} formValues={formValues} mailContent={mailContent} />
      </DialogContent>
      {/* <DialogActions>
        <Button onClick={onClose} color="secondary">
          {t("cancel") || "Cancel"}
        </Button>
        <Button onClick={handleSubmit} color="primary" variant="contained">
          {t("submit") || "Submit"}
        </Button>
      </DialogActions> */}
    </Dialog>
  );
};

export default EmailModal;
