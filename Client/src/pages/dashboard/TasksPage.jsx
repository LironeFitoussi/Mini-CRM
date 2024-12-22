// src/pages/dashboard/TasksPage.jsx
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Container, Typography, CircularProgress, Box } from '@mui/material';
import TaskList from '../../components/Molecules/TaskList.jsx';
import SnackbarNotification from '../../components/Molecules/SnackbarNotification.jsx';
import { fetchTasks, updateTaskStatus } from '../../api/tasks';
import { capitalizeFirstLetter, getStatusColor } from '../../utils';

const API_URL = import.meta.env.VITE_API_URL;

const TasksPage = () => {
    const queryClient = useQueryClient();

    // Fetch tasks using useQuery
    const {
        data: tasks,
        error,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ['tasks'],
        queryFn: fetchTasks,
    });

    // State for Snackbar notifications
    const [snackbar, setSnackbar] = React.useState({
        open: false,
        message: '',
        severity: 'success', // 'success' | 'error' | 'warning' | 'info'
    });

    const handleCloseSnackbar = () => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    };

    // Mutation for updating task status
    const mutation = useMutation({
        mutationFn: updateTaskStatus,
        onSuccess: () => {
            // Invalidate and refetch tasks after successful mutation
            queryClient.invalidateQueries(['tasks']);
            setSnackbar({
                open: true,
                message: 'Task status updated successfully!',
                severity: 'success',
            });
        },
        onError: (error) => {
            console.error('Failed to update task status:', error);
            setSnackbar({
                open: true,
                message: 'Failed to update task status. Please try again.',
                severity: 'error',
            });
        },
    });

    // console.log(mutation);
    
    // Handle status change
    const handleStatusChange = (taskId, newStatus) => {
        mutation.mutate({ taskId, newStatus });
    };

    if (isLoading) {
        return (
            <Container className="mt-8" style={{ textAlign: 'center', marginTop: '2rem' }}>
                <CircularProgress />
            </Container>
        );
    }

    if (isError) {
        return (
            <Container className="mt-8">
                <Typography color="error" variant="h6">
                    Error loading tasks: {error.message}
                </Typography>
            </Container>
        );
    }

    return (
        <Container className="mt-8">
            <Typography variant="h4" className="mb-4">
                Tasks
            </Typography>
            <TaskList
                tasks={tasks}
                onStatusChange={handleStatusChange}
                isUpdating={mutation.isPending}
            />
            {/* Snackbar Notifications */}
            <SnackbarNotification
                open={snackbar.open}
                message={snackbar.message}
                severity={snackbar.severity}
                onClose={handleCloseSnackbar}
            />
            {/* Mutation Loading Indicator */}
            {mutation.isLoading && (
                <Box display="flex" justifyContent="center" mt={2}>
                    <CircularProgress size={24} />
                    <Typography variant="body2" style={{ marginLeft: '0.5rem' }}>
                        Updating status...
                    </Typography>
                </Box>
            )}
            {/* Mutation Error Message */}
            {mutation.isError && (
                <Box display="flex" justifyContent="center" mt={2}>
                    <Typography color="error" variant="body2">
                        Failed to update task status. Please try again.
                    </Typography>
                </Box>
            )}
        </Container>
    );
};

export default TasksPage;
