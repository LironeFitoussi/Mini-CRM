import React, { useState } from 'react';
import { Button } from '@mui/material';
import AddDonatorModal from '../Modals/AddDonatorModal';

const AddDonatorButton = () => {
    const [open, setOpen] = useState(false);
    const [donatorName, setDonatorName] = useState('');
    const [donatorEmail, setDonatorEmail] = useState('');

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleAddDonator = () => {
        // Add logic to handle adding the donator
        console.log('Donator Name:', donatorName);
        console.log('Donator Email:', donatorEmail);
        handleClose();
    };

    return (
        <div>
            <Button variant="contained" color="primary" onClick={handleOpen}>
                Add Donator
            </Button>
            <AddDonatorModal
                open={open}
                onClose={handleClose}
                donatorName={donatorName}
                setDonatorName={setDonatorName}
                donatorEmail={donatorEmail}
                setDonatorEmail={setDonatorEmail}
                handleAddDonator={handleAddDonator}
            />
        </div>
    );
};

export default AddDonatorButton;
