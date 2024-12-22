import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Container, Typography, CircularProgress, List, ListItem, ListItemText } from '@mui/material';

const fetchTasks = async () => {
    const { data } = await axios.get(import.meta.env.VITE_API_URL + '/api/v1/tasks');
    console.log(data);
    
    return data.data
};

const TasksPage = () => {
    const { data, error, isLoading } = useQuery({
        queryKey: ['tasks'],
        queryFn: fetchTasks
    });

    if (isLoading) return <CircularProgress />;
    if (error) return <Typography color="error">Error loading tasks</Typography>;

    return (
        <Container className="mt-8">
            <Typography variant="h4" className="mb-4">Tasks</Typography>
            <List>
                {data.map(task => (
                    <ListItem key={task.id} className="border-b border-gray-200">
                        <ListItemText primary={task.title} secondary={task.description} />
                        {/* Staus */}
                        <ListItemText primary={task.status} />

                        {/* Donator */}
                        <ListItemText primary={task.donator.fName} />

                        {/* User */}
                        <ListItemText primary={task.user.fName} />

                        {/* Due Date */}
                        <ListItemText primary={task.dueDate} />
                    </ListItem>
                ))}
            </List>
        </Container>
    );
};

export default TasksPage;