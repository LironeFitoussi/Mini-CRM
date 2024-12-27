import React, { useState } from 'react';
import { Modal, Box, TextField, Button, Autocomplete, CircularProgress, Typography } from '@mui/material';
import useDonators from '../../queryhooks/useDonators';

const CreateLeadModal = ({ open, onClose, handleCreateLead }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [owner, setOwner] = useState('');
    const [selectedDonators, setSelectedDonators] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [errors, setErrors] = useState({});

    // Using useDonators hook with searchTerm
    const { donators, isLoading, refetch } = useDonators({ search: searchTerm });

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        refetch();
    };

    const validateFields = () => {
        const newErrors = {};
        if (!title.trim()) newErrors.title = 'Title is required';
        if (!description.trim()) newErrors.description = 'Description is required';
        if (!owner.trim()) newErrors.owner = 'Owner ID is required';
        if (selectedDonators.length === 0) newErrors.selectedDonators = 'At least one donator is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validateFields()) return;

        const leadData = {
            title,
            description,
            owner,
            donators: selectedDonators.map(donator => ({
                donatorId: donator._id,
            })),
        };

        handleCreateLead(leadData);
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 400,
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2,
                }}
            >
                <Typography variant="h6" gutterBottom>
                    Create New Lead
                </Typography>
                <TextField
                    label="Title"
                    fullWidth
                    margin="normal"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    error={!!errors.title}
                    helperText={errors.title}
                />
                <TextField
                    label="Description"
                    fullWidth
                    margin="normal"
                    multiline
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    error={!!errors.description}
                    helperText={errors.description}
                />
                <TextField
                    label="Owner ID"
                    fullWidth
                    margin="normal"
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    error={!!errors.owner}
                    helperText={errors.owner}
                />
                <Autocomplete
                    multiple
                    options={donators}
                    getOptionLabel={(option) => `${option?.fName || ''} ${option?.lName || ''}`}
                    onChange={(event, value) => setSelectedDonators(value)}
                    isOptionEqualToValue={(option, value) => option._id === value._id}
                    filterSelectedOptions
                    loading={isLoading}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Donators"
                            margin="normal"
                            fullWidth
                            onChange={handleSearchChange}
                            error={!!errors.selectedDonators}
                            helperText={errors.selectedDonators}
                            InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                    <>
                                        {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                                        {params.InputProps.endAdornment}
                                    </>
                                ),
                            }}
                        />
                    )}
                />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    fullWidth
                    sx={{ mt: 2 }}
                >
                    Create
                </Button>
            </Box>
        </Modal>
    );
};

export default CreateLeadModal;
