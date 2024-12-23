// components/SmsDashboard.jsx
import React from 'react';
import NavBar from '../../components/Molecules/SmsNavBar';
import Conversations from '../../components/Molecules/Conversations';
import { Container, Typography, TextField, Button, Box } from '@mui/material';

const SmsDashboard = () => {
    const handleSendSms = () => {
        // Implement SMS sending logic here
        console.log('SMS Sent');
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <NavBar />
            <Container maxWidth="lg" className="mt-8 p-6">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* SMS Form */}
                    <div className="w-full md:w-1/2">
                        <Typography variant="h4" component="h1" className="text-center mb-6">
                            Send SMS
                        </Typography>
                        <Box component="form" noValidate autoComplete="off">
                            <Box className="mb-4">
                                <TextField
                                    fullWidth
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    label="Phone Number"
                                    variant="outlined"
                                    required
                                    InputProps={{
                                        className: 'bg-gray-50',
                                    }}
                                />
                            </Box>
                            <Box className="mb-6">
                                <TextField
                                    fullWidth
                                    id="message"
                                    name="message"
                                    label="Message"
                                    variant="outlined"
                                    multiline
                                    rows={4}
                                    required
                                    InputProps={{
                                        className: 'bg-gray-50',
                                    }}
                                />
                            </Box>
                            <Box className="flex justify-center">
                                <Button
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                    onClick={handleSendSms}
                                >
                                    Send SMS
                                </Button>
                            </Box>
                        </Box>
                    </div>
                    {/* Conversations List */}
                    <div className="w-full md:w-1/2">
                        <Conversations />
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default SmsDashboard;
