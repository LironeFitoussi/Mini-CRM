import React, { useState } from 'react';
import { Button } from '@mui/material';

import DeleteDonatorModal from '../Modals/DeleteDonatorModal.jsx';
import { useNavigate } from "react-router-dom";
import DeleteIcon from '@mui/icons-material/Delete';

import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';
const DeleteDonatorButton = ({donatorData}) => {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleDeleteDonator = async () => {
        try {
            const response = await axios.delete(import.meta.env.VITE_API_URL + '/api/v1/donators/' + donatorData._id);
            // console.log(response.data);

            // Invalidate QueryClient cache for donators
            queryClient.invalidateQueries({ queryKey: ['donators'] });
            navigate('/dashboard/donators');
        } catch (error) {
            console.error(error);
        }        
    };

    return (
        <div>
            <Button variant="contained" color="error" onClick={handleOpen} sx={{ display: "flex", gap: 1 }}>
                <DeleteIcon /> {" "}
                Delete Donator
            </Button>
            <DeleteDonatorModal
                open={open}
                onClose={handleClose}
                handleDeleteDonator={handleDeleteDonator}
                donatorName={donatorData.fName}
            />
        </div>
    );
}

export default DeleteDonatorButton;