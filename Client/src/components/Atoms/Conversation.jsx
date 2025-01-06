// components/Conversation.jsx
import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const Conversation = ({ contact, lastMessage, timestamp }) => {
    return (
        <Card className="mb-4">
            <CardContent>
                <Typography variant="h6" component="div">
                    {contact}
                </Typography>
                <Typography color="text.secondary">
                    {lastMessage}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {new Date(timestamp).toLocaleString('en-GB')}
                </Typography>
            </CardContent>
        </Card>
    );
};

export default Conversation;
