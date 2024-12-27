// src/components/AddToLeadButton.jsx
import React, { useState, useCallback } from 'react';
import {
    Modal,
    TextField,
    Button,
    Autocomplete,
    CircularProgress,
    Box,
    Typography,
    Alert,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import debounce from 'lodash.debounce';
import useLeads from '../../queryhooks/useLeads';
import useAddDonorsToLead from '../../queryhooks/useAddDonorsToLead';
import CreateLeadButton from '../Buttons/CreateLeadButton';

const AddToLeadButton = ({ selectedDonorIds }) => {
    const { t } = useTranslation();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [leadInputValue, setLeadInputValue] = useState('');
    const [selectedLead, setSelectedLead] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    const { data: leads, isLoading: isLeadsLoading, isError: isLeadsError, error: leadsError } = useLeads();

    const addDonorsMutation = useAddDonorsToLead();

    // Debounce the lead search input (if implementing search)
    const debouncedChangeHandler = useCallback(
        debounce((value) => {
            // Implement search logic if your backend supports it
            // For simplicity, assuming all leads are fetched
        }, 500),
        []
    );

    const handleLeadInputChange = (event, value) => {
        setLeadInputValue(value);
        debouncedChangeHandler(value);
    };

    const handleLeadChange = (event, value) => {
        setSelectedLead(value);
    };

    const handleAddToLead = async () => {
        if (!selectedLead) {
            setErrorMessage('Please select a lead.');
            return;
        }

        if (selectedDonorIds.length === 0) {
            setErrorMessage('No donors selected.');
            return;
        }

        try {
            await addDonorsMutation.mutateAsync({
                leadId: selectedLead._id,
                donorIds: selectedDonorIds,
            });
            setIsModalOpen(false);
            setSelectedLead(null);
            setErrorMessage('');
            // Optionally, show a success message or toast notification
        } catch (error) {
            setErrorMessage('Failed to add donors to the lead. Please try again.');
        }
    };

    return (
        <>
            {/* Add To Lead Button */}
            <Button
                variant="contained"
                color="primary"
                onClick={() => setIsModalOpen(true)}
                disabled={selectedDonorIds.length === 0}
                sx={{ ml: 2 }}
            >
                Add to Lead List
            </Button>

            {/* Modal */}
            <Modal
                open={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedLead(null);
                    setErrorMessage('');
                }}
                aria-labelledby="add-to-lead-modal-title"
                aria-describedby="add-to-lead-modal-description"
            >
                <Box
                    sx={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 400,
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        boxShadow: 24,
                        p: 4,
                    }}
                >
                    <Typography id="add-to-lead-modal-title" variant="h6" component="h2" gutterBottom>
                        {t('Add Selected Donors to Lead')}
                    </Typography>

                    {/* Lead Selection */}
                    <Autocomplete
                        fullWidth
                        options={leads || []}
                        getOptionLabel={(option) => option.name || 'Unknown Lead'}
                        loading={isLeadsLoading}
                        onInputChange={handleLeadInputChange}
                        onChange={handleLeadChange}
                        value={selectedLead}
                        inputValue={leadInputValue}
                        renderOption={(props, option) => (
                            <li {...props} key={option._id}>
                                {option.name}
                            </li>
                        )}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Select Lead"
                                variant="outlined"
                                required
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <>
                                            {isLeadsLoading ? <CircularProgress size={20} /> : null}
                                            {params.InputProps.endAdornment}
                                        </>
                                    ),
                                }}
                                sx={{ mt: 2 }}
                            />
                        )}
                    />

                    {/* Error Message */}
                    {errorMessage && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {errorMessage}
                        </Alert>
                    )}

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleAddToLead}
                            disabled={addDonorsMutation.isLoading}
                        >
                            {addDonorsMutation.isLoading ? 'Adding...' : 'Add'}
                        </Button>
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={() => {
                                setIsModalOpen(false);
                                setSelectedLead(null);
                                setErrorMessage('');
                            }}
                        >
                            Cancel
                        </Button>
                        </Box>
                        <Box>
                            <CreateLeadButton />
                        </Box>
                    </Box>
                </Box>
            </Modal>
        </>
    );

};

export default AddToLeadButton;
