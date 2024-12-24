import React from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, Button } from "@mui/material";
import { useTranslation } from "react-i18next";

import EmailForm from "../Molecules/EmailForm";

const EmailModal = ({ open, onClose, handleChange, handleSubmit, formValues }) => {
    const { t } = useTranslation();
    
    console.log("formValues", formValues);
    
    return (
        <Dialog open={open} onClose={onClose}>
        <DialogTitle>{t("emailModalTitle")}</DialogTitle>
        <DialogContent>
            <EmailForm formValues={formValues} handleChange={handleChange} />
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
    }

export default EmailModal;