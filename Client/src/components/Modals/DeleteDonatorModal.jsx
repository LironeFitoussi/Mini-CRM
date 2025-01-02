import React from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
};

const DeleteDonatorModal = ({ open, onClose, handleDeleteDonator, donatorName }) => {
    const handleConfirmDelete = () => {
        handleDeleteDonator();
        onClose();
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="delete-modal-title"
            aria-describedby="delete-modal-description"
        >
            <Box sx={modalStyle}>
                <Typography id="delete-modal-title" variant="h6" component="h2">
                    Confirm Deletion
                </Typography>
                <Typography id="delete-modal-description" sx={{ mt: 2 }}>
                    Are you sure you want to delete {donatorName}? This action cannot be undone.
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
                    <Button variant="outlined" color="primary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant="contained" color="error" onClick={handleConfirmDelete}>
                        Delete
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default DeleteDonatorModal;