// EmailModal.jsx
import { Dialog, DialogContent, DialogTitle, Box, Typography } from "@mui/material";
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
  // console.log(formValues);

  useEffect(() => {
    if (formValues && formValues?.to) {
      setRecipientsCount(formValues?.to?.length);
    } else {
      setRecipientsCount(0);
    }
  }, [formValues]);

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
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <Box sx={{ display: "flex", justifyContent: "space-between", p: 2 }}>
        <Box>
          <DialogTitle>{t("email.modalTitle") || "Send Email"}</DialogTitle>
          {recipientsCount > 0 && (
            <Typography 
              variant="subtitle1" 
              sx={{ 
                ml: 2, 
                color: 'primary.main',
                fontWeight: 'bold',
                display: 'block'
              }}
            >
              {recipientsCount} {recipientsCount === 1 ? t("email.recipient") : t("email.recipients")}
            </Typography>
          )}
        </Box>
        <SaveAsTemplateButton
          subject={formValues.subject}
          body={generateFullEmailContent()} 
          imageUrl={formValues.imageUrl}
          imagePosition={formValues.imagePosition}
          imageLink={formValues.imageLink}
          isImageClickable={formValues.isImageClickable}
          clickableImageText={formValues.clickableImageText}
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
