import { useState } from "react";
import { Button } from "@mui/material";
import PropTypes from 'prop-types';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import ConfirmationModal from "../Modals/ConfirmationModal"; // Adjust the path
import SaveIcon from '@mui/icons-material/Save';
import { useTranslation } from "react-i18next";

const SaveAsTemplateButton = ({ 
  subject, 
  body, 
  imageUrl, 
  imagePosition,
  imageLink = '',
  isImageClickable = false,
  clickableImageText = ''
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const saveTemplateMutation = useMutation({
    mutationFn: (templateData) =>
      axios.post(`${import.meta.env.VITE_API_URL}/api/v1/mail-templates`, templateData),
    onSuccess: () => {
      queryClient.invalidateQueries(["templates"]); // Refresh the templates list
      setIsModalOpen(false);
      alert(t("templates.templateSaved") || "Template saved successfully!");
    },
    onError: (error) => {
      // Log detailed error information
      console.error("Error saving template:", error.message);
      console.error("Response data:", error.response?.data);
      console.error("Status code:", error.response?.status);
      
      // Show a more informative error message
      let errorMessage = t("templates.templateSaveError") || "Error saving template. Please try again.";
      if (error.response?.data?.message) {
        errorMessage += ` (${error.response.data.message})`;
      }
      if (error.response?.data?.missingFields) {
        errorMessage += ` Missing fields: ${error.response.data.missingFields.join(', ')}`;
      }
      
      alert(errorMessage);
    },
  });

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleSaveTemplate = () => {
    // Check for empty body content
    if (!body || body.trim() === '' || body === '<p><br></p>') {
      alert(t("templates.templateBodyEmpty") || "Template body cannot be empty!");
      return;
    }

    // Create a template object with all fields
    const templateData = {
      name: subject, // Use the subject as the template name
      subject,
      body, // Use the processed HTML body content
      imageUrl: imageUrl || '',
      imagePosition: imagePosition || 'top',
      imageLink: imageLink || '',
      isImageClickable: isImageClickable === true,
      clickableImageText: clickableImageText || ''
    };

    // Log complete data for debugging
    console.log('Saving template with data:', templateData);
    console.log('Body content length:', body ? body.length : 0);
    console.log('Body content sample:', body ? body.substring(0, 100) + '...' : 'empty');
    console.log('Image URL:', imageUrl || 'none');
    
    saveTemplateMutation.mutate(templateData);
  };

  return (
    <>
      <Button variant="outlined" color="secondary" onClick={handleOpenModal}>
        <SaveIcon />
      </Button>
      <ConfirmationModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleSaveTemplate}
        title={t("templates.save") || "Save Template"}
        description={t("templates.confirmSave") || "Are you sure you want to save this email as a template?"}
        type={"primary"}
      />
    </>
  );
};

SaveAsTemplateButton.propTypes = {
  subject: PropTypes.string.isRequired,
  body: PropTypes.string.isRequired,
  imageUrl: PropTypes.string,
  imagePosition: PropTypes.string,
  imageLink: PropTypes.string,
  isImageClickable: PropTypes.bool,
  clickableImageText: PropTypes.string
};

export default SaveAsTemplateButton;
