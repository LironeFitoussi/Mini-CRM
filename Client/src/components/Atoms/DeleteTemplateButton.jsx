import React, { useState } from 'react';
import { Button } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import ConfirmationModal from '../Modals/ConfirmationModal';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { useTranslation } from 'react-i18next';
const deleteTemplate = async (templateId) => {
    const response = await axios.delete(`${import.meta.env.VITE_API_URL}/api/v1/mail-templates/${templateId}`);
    return response.data;
};

const DeleteTemplateButton = ({ templateId }) => {
    const { t } = useTranslation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: () => deleteTemplate(templateId),
        onSuccess: () => {
            queryClient.invalidateQueries(['templates']); // Refresh the templates list
        },
        onError: (error) => {
            console.error('Error deleting template:', error.message);
        },
    });

    const handleOpenModal = (event) => {
        event.stopPropagation(); // Prevent bubbling to the MenuItem
        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);

    const handleDelete = () => {
        mutation.mutate();
        handleCloseModal();
    };

    return (
        <>
            <Button variant="text" color="error" size="small" onClick={handleOpenModal}>
                <DeleteForeverIcon />
            </Button>
            <ConfirmationModal
                open={isModalOpen}
                onClose={handleCloseModal}
                onConfirm={handleDelete}
                title={t('deleteTemplate')}
                description={t('confirmDeleteTemplate')}
                type="danger"
            />
        </>
    );
};

export default DeleteTemplateButton;
