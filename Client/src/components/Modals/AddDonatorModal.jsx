import React, { useState } from 'react';
import { Box, TextField, Typography, Button, Modal, Alert, IconButton, Stack } from '@mui/material';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { Add, Remove } from '@mui/icons-material';

const AddDonatorModal = ({ open, onClose, handleAddDonator }) => {
    const [fName, setFName] = useState('');
    const [lName, setLName] = useState('');
    const [birthdate, setBirthdate] = useState('');
    const [donatorEmail, setDonatorEmail] = useState(['']);
    const [donatorPhone, setDonatorPhone] = useState(['']);
    const [error, setError] = useState('');

    const addEmailField = () => {
        if (donatorEmail.length >= 3) {
            setError('You can add up to 3 emails only.');
            return;
        }
        setError('');
        setDonatorEmail([...donatorEmail, '']);
    };

    const addPhoneField = () => {
        if (donatorPhone.length >= 3) {
            setError('You can add up to 3 phone numbers only.');
            return;
        }
        setError('');
        setDonatorPhone([...donatorPhone, '']);
    };

    const removeEmailField = (index) => {
        const updatedEmails = donatorEmail.filter((_, i) => i !== index);
        setDonatorEmail(updatedEmails);
        setError('');
    };

    const removePhoneField = (index) => {
        const updatedPhones = donatorPhone.filter((_, i) => i !== index);
        setDonatorPhone(updatedPhones);
        setError('');
    };

    const handleEmailChange = (index, value) => {
        const updatedEmails = [...donatorEmail];
        updatedEmails[index] = value;
        setDonatorEmail(updatedEmails);
    };

    const handlePhoneChange = (index, value) => {
        const updatedPhones = [...donatorPhone];
        updatedPhones[index] = value;
        setDonatorPhone(updatedPhones);
    };

    const handleSubmit = () => {
        if (!fName || !lName || !birthdate) {
            setError('First Name, Last Name, and Birthdate are required.');
            return;
        }
        handleAddDonator({
            fName,
            lName,
            birthdate,
            donatorEmail,
            donatorPhone,
        });
        onClose();
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 500,
                    bgcolor: 'background.paper',
                    border: '1px solid #ddd',
                    boxShadow: 24,
                    borderRadius: 2,
                    p: 4,
                }}
            >
                <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
                    Add New Donator
                </Typography>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <TextField
                    margin="normal"
                    fullWidth
                    label="First Name"
                    value={fName}
                    onChange={(e) => setFName(e.target.value)}
                    required
                    sx={{ mb: 2 }}
                />
                <TextField
                    margin="normal"
                    fullWidth
                    label="Last Name"
                    value={lName}
                    onChange={(e) => setLName(e.target.value)}
                    required
                    sx={{ mb: 2 }}
                />
                <TextField
                    margin="normal"
                    fullWidth
                    label="Birthdate"
                    type="date"
                    InputLabelProps={{
                        shrink: true,
                    }}
                    value={birthdate}
                    onChange={(e) => setBirthdate(e.target.value)}
                    required
                    sx={{ mb: 2 }}
                />

                <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                    Emails
                </Typography>
                {donatorEmail.map((email, index) => (
                    <Stack
                        key={index}
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        sx={{ mb: 1 }}
                    >
                        <TextField
                            fullWidth
                            label={`Email ${index + 1}`}
                            value={email}
                            onChange={(e) => handleEmailChange(index, e.target.value)}
                        />
                        <IconButton
                            color="error"
                            onClick={() => removeEmailField(index)}
                            disabled={donatorEmail.length === 1}
                        >
                            <Remove />
                        </IconButton>
                    </Stack>
                ))}
                {donatorEmail.length < 3 && (
                    <Button
                        startIcon={<Add />}
                        onClick={addEmailField}
                        sx={{ mt: 1 }}
                    >
                        Add Email
                    </Button>
                )}

                <Typography variant="subtitle1" sx={{ mt: 4, mb: 1 }}>
                    Phone Numbers
                </Typography>
                {donatorPhone.map((phone, index) => (
                    <Stack
                        key={index}
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        sx={{ mb: 1 }}
                    >
                        <PhoneInput
                            country={'il'}
                            value={phone}
                            onChange={(value) => handlePhoneChange(index, value)}
                            containerStyle={{ flex: 1 }}
                            inputStyle={{ width: '100%' }}
                        />
                        <IconButton
                            color="error"
                            onClick={() => removePhoneField(index)}
                            disabled={donatorPhone.length === 1}
                        >
                            <Remove />
                        </IconButton>
                    </Stack>
                ))}
                {donatorPhone.length < 3 && (
                    <Button
                        startIcon={<Add />}
                        onClick={addPhoneField}
                        sx={{ mt: 1 }}
                    >
                        Add Phone
                    </Button>
                )}

                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    sx={{ mt: 4 }}
                >
                    Add Donator
                </Button>
            </Box>
        </Modal>
    );
};

export default AddDonatorModal;
