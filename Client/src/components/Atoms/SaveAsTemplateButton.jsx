import React, { useState } from "react";
import { Button } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import ConfirmationModal from "../Modals/ConfirmationModal"; // Adjust the path
import SaveIcon from '@mui/icons-material/Save';
import { useTranslation } from "react-i18next";

const SaveAsTemplateButton = ({ subject, body, imageUrl, imagePosition }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const saveTemplateMutation = useMutation({
    mutationFn: (templateData) =>
      axios.post(`${import.meta.env.VITE_API_URL}/api/v1/mail-templates`, templateData),
    onSuccess: () => {
      queryClient.invalidateQueries(["templates"]); // Refresh the templates list
      setIsModalOpen(false);
    },
    onError: (error) => {
      console.error("Error saving template:", error.message);
    },
  });

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleSaveTemplate = () => {
    saveTemplateMutation.mutate({
      name: subject, // Use the subject as the template name (or adjust as needed)
      subject,
      body,
      imageUrl,
      imagePosition,
    });
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
        title={t("saveTemplate")}
        description={t("confirmSaveTemplate")}
        type={"primary"}
      />
    </>
  );
};

export default SaveAsTemplateButton;
