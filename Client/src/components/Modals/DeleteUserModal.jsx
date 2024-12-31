// DeleteUserModal.js
import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
} from "@mui/material";
import { useTranslation } from "react-i18next";
const DeleteUserModal = ({ open, onClose, onDelete }) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{t("userManagement.delete")}</DialogTitle>
      <DialogContent>
        <p>{t("userManagement.deleteConfirmation")}</p>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          {t("actions.cancel")}
        </Button>
        <Button onClick={onDelete} color="error">
          {t("actions.delete")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteUserModal;
