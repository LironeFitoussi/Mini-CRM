// UserForm.js
import React from "react";
import PropTypes from "prop-types";
import { TextField, MenuItem } from "@mui/material";
import { useTranslation } from "react-i18next";

const UserForm = ({ formValues, handleChange, errors = {} }) => {
  const { t } = useTranslation();

  return (
    <>
      <TextField
        margin="normal"
        label={t("clientInfo.fName")}
        name="fName"
        value={formValues.fName}
        onChange={handleChange}
        fullWidth
        required
        error={!!errors.fName}
        helperText={errors.fName}
      />
      <TextField
        margin="normal"
        label={t("clientInfo.lName")}
        name="lName"
        value={formValues.lName}
        onChange={handleChange}
        fullWidth
        required
        error={!!errors.lName}
        helperText={errors.lName}
      />
      <TextField
        margin="normal"
        label={t("clientInfo.email")}
        name="email"
        type="email"
        value={formValues.email}
        onChange={handleChange}
        fullWidth
        required
        error={!!errors.email}
        helperText={errors.email}
      />
      <TextField
        margin="normal"
        label={t("userManagement.role")}
        name="role"
        value={formValues.role}
        onChange={handleChange}
        fullWidth
        select
        required
        error={!!errors.role}
        helperText={errors.role}
      >
        <MenuItem value="user">{t("userManagement.userRoleUser")}</MenuItem>
        <MenuItem value="admin">{t("userManagement.userRoleAdmin")}</MenuItem>
      </TextField>
    </>
  );
};

UserForm.propTypes = {
  formValues: PropTypes.shape({
    fName: PropTypes.string,
    lName: PropTypes.string,
    email: PropTypes.string,
    role: PropTypes.string,
  }).isRequired,
  handleChange: PropTypes.func.isRequired,
  errors: PropTypes.object,
};

export default UserForm;
