import React, { useState } from 'react';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CreateLeadModal from '../Modals/CreateLeadModal';
import useLeads from '../../queryhooks/useLeads';

const CreateLeadButton = () => {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const { createLead } = useLeads();

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleCreateLead = (leadData) => {
        createLead.mutate(leadData, {
            onSuccess: (newLead) => {
                console.log('Lead created:', newLead);
                navigate(`/leads/${newLead._id}`);
                handleClose();
            },
            onError: (error) => {
                console.error('Error creating lead:', error.response?.data || error.message);
            },
        });
    };

    return (
        <div>
            <Button variant="contained" color="primary" onClick={handleOpen}>
                Create Lead
            </Button>
            <CreateLeadModal
                open={open}
                onClose={handleClose}
                handleCreateLead={handleCreateLead}
            />
        </div>
    );
};

export default CreateLeadButton;
