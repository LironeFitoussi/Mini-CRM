// AddUserModal.js
import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
} from "@mui/material";
import { useTranslation } from "react-i18next";

import UserForm from "../Molecules/UserForm";

const AddUserModal = ({
  open,
  onClose,
  formValues,
  handleChange,
  handleSubmit,
}) => {
  const { t } = useTranslation();
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formValues.fName) newErrors.fName = t("validation.required");
    if (!formValues.lName) newErrors.lName = t("validation.required");
    if (!formValues.email) {
      newErrors.email = t("validation.required");
    } else if (!/\S+@\S+\.\S+/.test(formValues.email)) {
      newErrors.email = t("validation.invalidEmail");
    }
    if (!formValues.role) newErrors.role = t("validation.required");
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = () => {
    if (validateForm()) {
      handleSubmit(formValues);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{t("userManagement.add")}</DialogTitle>
      <DialogContent>
        <UserForm 
          formValues={formValues} 
          handleChange={handleChange} 
          errors={errors}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          {t("actions.cancel")}
        </Button>
        <Button onClick={handleFormSubmit} color="primary">
          {t("actions.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

AddUserModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  formValues: PropTypes.shape({
    fName: PropTypes.string,
    lName: PropTypes.string,
    email: PropTypes.string,
    role: PropTypes.string,
  }).isRequired,
  handleChange: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
};

export default AddUserModal;
