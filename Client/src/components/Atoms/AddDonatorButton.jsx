import React, { useState } from 'react';
import { Button } from '@mui/material';
import AddDonatorModal from '../Modals/AddDonatorModal';
import { useNavigate } from "react-router-dom";

import axios from 'axios';

const AddDonatorButton = () => {
    const [open, setOpen] = useState(false);
    const [donatorName, setDonatorName] = useState('');
    const [donatorEmail, setDonatorEmail] = useState('');
    const navigate = useNavigate();

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleAddDonator = async (donatorData) => {
        console.log(donatorData);
        
        const newDonator = {
            fName: donatorData.fName,
            lName: donatorData.lName,
            allo_don_id: donatorData.alloDonId || undefined,
            birthdate: donatorData.birthdate || undefined,
            email_1: {
                email: donatorData.donatorEmail[0],
            },
            email_2: {
                email: donatorData.donatorEmail[1] || undefined,
            },
            email_3: {
                email: donatorData.donatorEmail[2] || undefined,
            },
            phone_number_1: donatorData.donatorPhone[0] || undefined,
            phone_number_2: donatorData.donatorPhone[1] || undefined,
            phone_number_3: donatorData.donatorPhone[2] || undefined
        };

        console.log(newDonator);
        
        try {
            const response = await axios.post(import.meta.env.VITE_API_URL + '/api/v1/donators', newDonator);
            console.log(response.data);
            navigate(`${response.data._id}`);

            // handleClose();
        } catch (error) {
            console.error(error);
        }        
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
