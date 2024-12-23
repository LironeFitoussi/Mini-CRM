import React from 'react';
import { Card, CardContent, Typography, Chip, Divider, Stack } from '@mui/material';
import { format } from 'date-fns';

const DonatorTaskItem = ({ task }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'success';
            case 'pending':
                return 'warning';
            case 'overdue':
                return 'error';
            default:
                return 'default';
        }
    };

    return (
        <Card
            className="donator-task-item shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg"
            sx={{ marginBottom: '16px', backgroundColor: '#f9f9f9' }}
        >
            <CardContent className="flex flex-col space-y-4">
                {/* Task Title */}
                <Typography variant="h6" component="h3" className="font-bold text-gray-800">
                    {task.title}
                </Typography>

                {/* Task Description */}
                <Typography variant="body2" className="text-gray-600">
                    {task.description}
                </Typography>

                <Divider className="my-2" />

                {/* Task Metadata */}
                <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                    {/* Due Date */}
                    <Chip
                        label={`Due: ${format(new Date(task.dueDate), 'dd/MM/yyyy')}`}
                        size="small"
                        color={new Date(task.dueDate) < new Date() ? 'error' : 'default'}
                    />

                    {/* Status */}
                    <Chip
                        label={task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                        color={getStatusColor(task.status)}
                        size="small"
                    />
                </Stack>

                {/* Assignee and Donator */}
                <Stack direction="row" spacing={2} alignItems="center" className="text-sm text-gray-600">
                    <Typography variant="body2">Assigned to: {task.user.fName}</Typography>
                    <Typography variant="body2">Donator: {task.donator.fName}</Typography>
                </Stack>
            </CardContent>
        </Card>
    );
};

export default DonatorTaskItem;
