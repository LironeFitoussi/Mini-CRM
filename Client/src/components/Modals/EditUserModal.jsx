// EditUserModal.js
import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
} from "@mui/material";
import { useTranslation } from "react-i18next";

import UserForm from "../Molecules/UserForm";

const EditUserModal = ({
  open,
  onClose,
  formValues,
  handleChange,
  handleSubmit,
}) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{t("userManagement.editUser")}</DialogTitle>
      <DialogContent>
        <UserForm formValues={formValues} handleChange={handleChange} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          {t("cancel")}
        </Button>
        <Button onClick={() => handleSubmit(formValues)} color="primary">
          {t("submit")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditUserModal;
