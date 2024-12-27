// LeadsPage.jsx
import React, { useState } from 'react';
import { Box, Button, Typography, Paper, Select, MenuItem, CircularProgress } from '@mui/material';
import SmartTable from '../../components/Molecules/SmartTable.jsx';
import CreateLeadModal from '../../components/Modals/CreateLeadModal.jsx';
import useLeads from '../../queryhooks/useLeads';

const LeadsPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);

    const { data: leads, isLoading, isError, createLead } = useLeads();

    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    const handleCreateLead = (leadData) => {
        createLead.mutate(leadData, {
            onSuccess: () => {
                setIsModalOpen(false);
                setSelectedLead(null); // Reset selection after creating a lead
            },
        });
    };

    const handleLeadSelection = (event) => {
        const selected = leads?.find((lead) => lead._id === event.target.value);
        setSelectedLead(selected);
    };

    // Example: Define or fetch allDonators
    const allDonatorsList = [
        {
            _id: "676d05017539c8c141ac7753",
            fName: "Y",
            lName: "G",
        },
        {
            _id: "676d05027539c8c141ac7906",
            fName: "Don",
            lName: "Jerem",
        },
        {
            _id: "676d05037539c8c141ac7907",
            fName: "Alice",
            lName: "Smith",
        },
        // Add more donators as needed
    ];

    const [loading, setLoading] = useState(false);

    // Handle status toggle
    const handleStatusToggle = (donatorEntryId, newStatus) => {
        console.log(`Toggling status for Donator Entry ID: ${donatorEntryId} to ${newStatus}`);

        // Implement your status toggle logic here
        // For example, update the state or make an API call
    };

    // Handle donator selection
    const handleDonatorSelect = (donatorEntryId, selectedDonatorIds) => {
        console.log(`Selected Donators for Entry ID: ${donatorEntryId}:`, selectedDonatorIds);

        // Implement your donator selection logic here
        // For example, update the state or make an API call
    };

    if (isLoading) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <CircularProgress />
                <Typography variant="h6" sx={{ mt: 2 }}>
                    Loading Leads...
                </Typography>
            </Box>
        );
    }

    if (isError) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" color="error">
                    Failed to load leads. Please try again later.
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Leads Management
            </Typography>

            <Select
                fullWidth
                value={selectedLead?._id || ''}
                onChange={handleLeadSelection}
                displayEmpty
                sx={{ mb: 2 }}
            >
                <MenuItem value="" disabled>
                    Select a Lead
                </MenuItem>
                {leads?.map((lead) => (
                    <MenuItem key={lead._id} value={lead._id}>
                        {lead.title}
                    </MenuItem>
                ))}
            </Select>

            <Button
                variant="contained"
                color="primary"
                onClick={handleOpenModal}
                sx={{ mb: 2 }}
            >
                Create New Lead
            </Button>

            <Paper sx={{ p: 2 }}>
                {selectedLead ? (
                    <SmartTable
                        data={selectedLead}
                        loading={isLoading}
                        onStatusToggle={handleStatusToggle}
                        onDonatorSelect={handleDonatorSelect}
                        allDonators={allDonatorsList} // Pass the allDonators prop
                    />
                ) : (
                    <Typography variant="h6" align="center">
                        No Lead Selected
                    </Typography>
                )}
            </Paper>

            <CreateLeadModal
                open={isModalOpen}
                onClose={handleCloseModal}
                handleCreateLead={handleCreateLead}
            />
        </Box>
    );
};

export default LeadsPage;
