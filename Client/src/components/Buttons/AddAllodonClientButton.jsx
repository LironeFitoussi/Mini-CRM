import { useState } from 'react';
import { Button } from '@mui/material';
import AddDonatorModal from '../Modals/AddDonatorModal';
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import axios from 'axios';

/**
 * AddAllodonClientButton - Specialized button for adding Allodon clients
 * 
 * @returns {JSX.Element} Button with modal for adding Allodon clients
 */
const AddAllodonClientButton = () => {
    const [open, setOpen] = useState(false);
    const [donatorName, setDonatorName] = useState('');
    const [donatorEmail, setDonatorEmail] = useState('');
    const { t } = useTranslation();
    const navigate = useNavigate();

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleAddClient = async (clientData) => {
        const newClient = {
            fName: clientData.fName,
            lName: clientData.lName,
            allo_don_id: clientData.alloDonId || undefined,
            birthdate: clientData.birthdate || undefined,
            email_1: clientData.donatorEmail[0] || undefined,
            email_2: clientData.donatorEmail[1] || undefined,
            email_3: clientData.donatorEmail[2] || undefined,
            phone_number_1: clientData.donatorPhone[0] || undefined,
            phone_number_2: clientData.donatorPhone[1] || undefined,
            phone_number_3: clientData.donatorPhone[2] || undefined,
            source: 'Allodon', // Mark the source as Allodon
        };
        
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/v1/allodon/donors`, 
                newClient
            );
            navigate(`/dashboard/allodon-clients/${response.data._id}`);
        } catch (error) {
            console.error(error.response?.data || error.message);
        }        
    };

    return (
        <div>
            <Button variant="contained" color="primary" onClick={handleOpen}>
                {t('addAllodonClient') || 'Add Allodon Client'}
            </Button>
            <AddDonatorModal
                open={open}
                onClose={handleClose}
                donatorName={donatorName}
                setDonatorName={setDonatorName}
                donatorEmail={donatorEmail}
                setDonatorEmail={setDonatorEmail}
                handleAddDonator={handleAddClient}
                title="Add Allodon Client"
            />
        </div>
    );
};

export default AddAllodonClientButton; 