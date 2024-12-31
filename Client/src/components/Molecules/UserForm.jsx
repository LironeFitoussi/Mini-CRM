// UserForm.js
import React from "react";
import { TextField } from "@mui/material";
import { useTranslation } from "react-i18next";

const UserForm = ({ formValues, handleChange }) => {
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
      />
      <TextField
        margin="normal"
        label={t("clientInfo.lName")}
        name="lName"
        value={formValues.lName}
        onChange={handleChange}
        fullWidth
      />
      <TextField
        margin="normal"
        label={t("clientInfo.email")}
        name="email"
        value={formValues.email}
        onChange={handleChange}
        fullWidth
      />
      <TextField
        margin="normal"
        // label={t("userManagementRole")}
        name="role"
        value={formValues.role}
        onChange={handleChange}
        fullWidth
        select
        SelectProps={{
          native: true,
        }}
      >
        <option value="user">{t("userManagement.userRoleUser")}</option>
        <option value="admin">{t("userManagement.userRoleAdmin")}</option>
      </TextField>
    </>
  );
};

export default UserForm;
