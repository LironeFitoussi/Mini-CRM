// src/components/AddToLeadButton.jsx
import React, { useState } from 'react';
import { Button } from '@mui/material';
import AddToLeadModal from '../Modals/AddToLeadModal.jsx';

const AddToLeadButton = ({ selectedDonorIds }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

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
                disabled={selectedDonorIds.length === 0}
                sx={{ ml: 2 }}
            >
                Add to Lead List
            </Button>

            {/* AddToLead Modal */}
            <AddToLeadModal
                open={isModalOpen}
                onClose={handleCloseModal}
                selectedDonorIds={selectedDonorIds}
            />
        </>
    );
};

export default AddToLeadButton;
