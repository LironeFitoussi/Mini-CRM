import React from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
const ConfirmationModal = ({ open, onClose, onConfirm, title, description, type }) => {
    const { t } = useTranslation();
    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="confirmation-modal-title"
            aria-describedby="confirmation-modal-description"
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 400,
                    bgcolor: 'background.paper',
                    border: '2px solid #000',
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2,
                }}
            >
                <Typography id="confirmation-modal-title" variant="h6" component="h2">
                    {t(`confirmations.${title}`)}
                </Typography>
                <Typography id="confirmation-modal-description" sx={{ mt: 2 }}>
                    {t(`confirmations.${description}`)}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                    <Button onClick={onClose} sx={{ mr: 2 }}>
                        {t('general.cancel')}
                    </Button>
                    <Button variant="contained" color={type === 'danger' ? 'error' : 'primary'}
                    onClick={onConfirm}>
                        {t('general.confirm')}
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default ConfirmationModal;
