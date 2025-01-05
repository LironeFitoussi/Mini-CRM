// src/components/AddToLeadButton.jsx
import React, { useState } from 'react';
import { Button } from '@mui/material';
import AddToOwnerModal from '../Modals/AddToOwnerModal.jsx';
import { useTranslation } from 'react-i18next';
const AddToOwnerButton = ({ selectedDonorId }) => {
    console.log(selectedDonorId);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { t } = useTranslation();
    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <>
            {/* Add To Lead Button */}
            <Button
                variant="contained"
                color="primary"
                onClick={handleOpenModal}
                sx={{ ml: 2 }}
            >
                {t('general.addToTelepro')}
            </Button>

            {/* AddToLead Modal */}
            <AddToOwnerModal
                open={isModalOpen}
                onClose={handleCloseModal}
                selectedDonorId={selectedDonorId}
            />
        </>
    );
};

export default AddToOwnerButton;
