// src/components/TaskDetails.jsx
import React from 'react';
import { Box, Grid, Typography, Chip } from '@mui/material';
import { capitalizeFirstLetter } from '../../utils';

const statusOptions = [
    { value: 'completed', label: 'Completed', color: 'success' },
    { value: 'pending', label: 'Pending', color: 'warning' },
    { value: 'critical', label: 'Critical', color: 'error' },
];

const getStatusColor = (muiColor) => {
    switch (muiColor) {
        case 'success':
            return 'green';
        case 'warning':
            return 'goldenrod';
        case 'error':
            return 'red';
        default:
            return 'grey';
    }
};

const TaskDetails = ({ task }) => {
    const currentStatus = statusOptions.find((option) => option.value === task.status);

    return (
        <Box sx={{ padding: 2, backgroundColor: '#f9f9f9' }}>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Donator:</Typography>
                    <Typography variant="body1">{task.donator.fName}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">User:</Typography>
                    <Typography variant="body1">{task.user.fName}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Due Date:</Typography>
                    <Typography variant="body1">
                        {new Date(task.dueDate).toLocaleDateString()}
                    </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2">Status:</Typography>
                    <Chip
                        label={capitalizeFirstLetter(task.status)}
                        color={currentStatus?.color || 'default'}
                        size="small"
                        sx={{ bgcolor: getStatusColor(currentStatus?.color) }}
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default TaskDetails;
