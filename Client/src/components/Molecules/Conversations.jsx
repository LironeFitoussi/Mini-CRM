// components/Conversations.jsx
import React from 'react';
import Conversation from '../Atoms/Conversation';
import { Typography } from '@mui/material';

const Conversations = () => {
    // Dummy data for demonstration
    const activeConversations = [
        {
            id: 1,
            contact: '+1 234 567 890',
            lastMessage: 'Hey, how are you?',
            timestamp: '2024-04-25T10:30:00Z',
        },
        {
            id: 2,
            contact: '+1 987 654 321',
            lastMessage: 'Meeting at 5 PM.',
            timestamp: '2024-04-25T09:15:00Z',
        },
        // Add more conversations as needed
    ];

    return (
        <div className="mt-8">
            <Typography variant="h5" className="mb-4">
                Active Conversations
            </Typography>
            {activeConversations.map((conv) => (
                <Conversation
                    key={conv.id}
                    contact={conv.contact}
                    lastMessage={conv.lastMessage}
                    timestamp={conv.timestamp}
                />
            ))}
        </div>
    );
};

export default Conversations;
