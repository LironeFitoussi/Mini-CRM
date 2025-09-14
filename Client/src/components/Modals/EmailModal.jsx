// EmailModal.jsx
import { Dialog, DialogContent, DialogTitle, Box, Typography, Button } from "@mui/material";
import { useTranslation } from "react-i18next";
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

import EmailForm from "../Molecules/EmailForm";
import SaveAsTemplateButton from "../Atoms/SaveAsTemplateButton";

const EmailModal = ({
  open,
  onClose,
  handleChange,
  handleSubmit,
  formValues,
  mailContent,
}) => {
  const { t } = useTranslation();
  const [recipientsCount, setRecipientsCount] = useState(0);
  const [isBroadcast, setIsBroadcast] = useState(false);
  const [isSingleEmail, setIsSingleEmail] = useState(false);

  // Reset state when modal is closed
  useEffect(() => {
    if (!open) {
      setRecipientsCount(0);
      setIsBroadcast(false);
      setIsSingleEmail(false);
    }
  }, [open]);

  useEffect(() => {
    if (formValues && formValues?.to) {
      // Check if it's a single email (from SendEmailButton)
      const isSingle = typeof formValues.to === 'string' && !formValues.to.includes(',');
      setIsSingleEmail(isSingle);
      
      // Only treat as broadcast if it's not a single email
      const isMultipleRecipients = !isSingle && (
        Array.isArray(formValues.to) ? 
          formValues.to.length > 1 : 
          formValues.to.includes(',')
      );
      
      setIsBroadcast(isMultipleRecipients);
      
      // Calculate recipients count
      if (isSingle) {
        setRecipientsCount(1);
      } else {
        setRecipientsCount(Array.isArray(formValues.to) ? 
          formValues.to.length : 
          formValues.to.split(',').filter(email => email.trim()).length);
      }
    } else {
      setIsSingleEmail(false);
      setIsBroadcast(false);
      setRecipientsCount(0);
    }
  }, [formValues]);

  // Handle modal close with cleanup
  const handleModalClose = () => {
    // Reset local state
    setRecipientsCount(0);
    setIsBroadcast(false);
    setIsSingleEmail(false);
    
    // Call the provided onClose handler
    onClose();
  };

  // Generate full email content for saving as a template
  const generateFullEmailContent = () => {
    const { body, imageUrl, imageLink, isImageClickable, clickableImageText } = formValues;
    
    let imageHtml = '';
    
    // Only generate image HTML if there's an imageUrl
    if (imageUrl) {
      if (isImageClickable && imageLink) {
        imageHtml = `
          <a href="${imageLink}" target="_blank" rel="noopener noreferrer" style="text-decoration: none;">
            <img src="${imageUrl}" alt="Email Image" style="max-width: 100%; height: auto; display: block;" />
            <div style="
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              background-color: rgba(0, 0, 0, 0.5);
              color: white;
              padding: 10px 20px;
              border-radius: 5px;
              text-align: center;
              font-size: 16px;
              font-weight: bold;
            ">
              ${clickableImageText || 'Accomplissez la Mitsva du Makhatsit HaShekel'}
            </div>
          </a>
        `;
      } else {
        imageHtml = `
          <img src="${imageUrl}" alt="Email Image" style="max-width: 100%; height: auto; display: block;" />
        `;
      }
    }

    return `
      <div style="position: relative; display: inline-block;">
        <div>${body}</div>
        ${imageHtml}
      </div>
    `;
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={handleModalClose} 
      maxWidth={false}
      fullWidth
      fullScreen
      sx={{
        '& .MuiDialog-paper': {
          margin: 0,
          width: '100vw',
          height: '100vh',
          maxWidth: 'none',
          maxHeight: 'none',
          borderRadius: 0,
        }
      }}
    >
      <Box 
        sx={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          p: 2,
          borderBottom: '1px solid #e0e0e0',
          backgroundColor: '#f8f9fa',
          position: 'sticky',
          top: 0,
          zIndex: 1100
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <DialogTitle sx={{ p: 0, fontSize: '1.5rem' }}>
            {t("email.modalTitle") || "Send Email"}
          </DialogTitle>
          {isBroadcast && recipientsCount > 0 && (
            <Typography 
              variant="subtitle1" 
              sx={{ 
                color: 'primary.main',
                fontWeight: 'bold',
                backgroundColor: 'primary.light',
                px: 2,
                py: 0.5,
                borderRadius: 1,
                color: 'white'
              }}
            >
              {recipientsCount} {recipientsCount === 1 ? t("email.recipient") : t("email.recipients")}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SaveAsTemplateButton
            subject={formValues.subject}
            body={generateFullEmailContent()} 
            imageUrl={formValues.imageUrl}
            imagePosition={formValues.imagePosition}
            imageLink={formValues.imageLink}
            isImageClickable={formValues.isImageClickable}
            clickableImageText={formValues.clickableImageText}
          />
          <Button
            onClick={handleModalClose}
            variant="outlined"
            size="small"
            sx={{ minWidth: 'auto', px: 2 }}
          >
            ✕
          </Button>
        </Box>
      </Box>
      <DialogContent 
        sx={{ 
          flex: 1, 
          p: 3, 
          overflow: 'auto',
          height: 'calc(100vh - 80px)' // Account for header height
        }}
      >
        <EmailForm
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          formValues={formValues}
          mailContent={mailContent}
          isSingleEmail={isSingleEmail}
        />
      </DialogContent>
    </Dialog>
  );
};

EmailModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  formValues: PropTypes.shape({
    subject: PropTypes.string.isRequired,
    body: PropTypes.string.isRequired,
    to: PropTypes.string,
    imageUrl: PropTypes.string,
    imagePosition: PropTypes.string,
    imageLink: PropTypes.string,
    isImageClickable: PropTypes.bool.isRequired,
    clickableImageText: PropTypes.string
  }).isRequired,
  mailContent: PropTypes.string
};

export default EmailModal;
