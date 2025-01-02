// src/components/AddToLeadModal.jsx
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

const AddToLeadModal = ({ open, onClose, selectedDonorIds }) => {
    const { t } = useTranslation();
    const [leadInputValue, setLeadInputValue] = useState('');
    const [selectedLead, setSelectedLead] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    const { data: leads, isLoading: isLeadsLoading } = useLeads(leadInputValue);
    const addDonorsMutation = useAddDonorsToLead();

    // Debounced input handler
    const debouncedChangeHandler = useCallback(
        debounce((value) => {
            setLeadInputValue(value);
        }, 500),
        []
    );

    const handleLeadInputChange = (event, value, reason) => {
        if (reason === 'input') {
            debouncedChangeHandler(value);
        }
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
            onClose();
            setSelectedLead(null);
            setErrorMessage('');
        } catch (error) {
            setErrorMessage('Failed to add donors to the lead. Please try again.');
        }
    };

    const handleClose = () => {
        onClose();
        setSelectedLead(null);
        setErrorMessage('');
    };

    // Enrich leads to include the selected lead if it's not already in the list
    const enrichedLeads = leads && selectedLead ? [selectedLead, ...leads.filter(lead => lead._id !== selectedLead._id)] : leads;

    return (
        <Modal
            open={open}
            onClose={handleClose}
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
                    options={enrichedLeads || []}
                    getOptionLabel={(option) => option.title || 'Unknown Lead'}
                    loading={isLeadsLoading}
                    onInputChange={handleLeadInputChange}
                    onChange={handleLeadChange}
                    value={selectedLead}
                    isOptionEqualToValue={(option, value) => option._id === value._id}
                    noOptionsText={isLeadsLoading ? 'Loading...' : 'No leads found'}
                    renderOption={(props, option) => (
                        <li {...props} key={option._id}>
                            {option.title}
                        </li>
                    )}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label={t('leadsManagement.select')}
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
                        onClick={handleClose}
                    >
                        Cancel
                    </Button>
                    <CreateLeadButton />
                </Box>
            </Box>
        </Modal>
    );
};

export default AddToLeadModal;
