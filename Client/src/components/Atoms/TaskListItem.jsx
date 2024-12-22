// src/components/TaskListItem.jsx
import React from 'react';
import {
    ListItem,
    ListItemText,
    Chip,
    Box,
    Collapse,
    Grid,
    Typography,
} from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import StatusSelect from './StatusSelect';
import TaskDetails from './TaskDetails';
import { capitalizeFirstLetter } from '../../utils';

const statusOptions = [
    { value: 'completed', label: 'Completed', color: 'success' },
    { value: 'pending', label: 'Pending', color: 'warning' },
    { value: 'critical', label: 'Critical', color: 'error' },
];

const TaskListItem = ({ task, onStatusChange, isUpdating }) => {
    const [open, setOpen] = React.useState(false);
    // console.log(isUpdating);
    
    const handleToggle = () => {
        setOpen((prev) => !prev);
    };

    return (
        <React.Fragment>
            <ListItem
                button={isUpdating.toString()}
                onClick={handleToggle}
                className="border-b border-gray-200"
                alignItems="flex-start"
            >
                <ListItemText
                    primary={
                        <Box display="flex" alignItems="center">
                            <Typography variant="h6" style={{ marginRight: '1rem' }}>
                                {task.title}
                            </Typography>
                            {/* <Chip
                                label={capitalizeFirstLetter(task.status)}
                                color={
                                    statusOptions.find((option) => option.value === task.status)?.color ||
                                    'default'
                                }
                                size="small"
                            /> */}
                        </Box>
                    }
                    secondary={task.description}
                />
                <Box display="flex" alignItems="center">
                    <StatusSelect
                        task={task}
                        onStatusChange={onStatusChange}
                        statusOptions={statusOptions}
                    />
                    {open ? <ExpandLess /> : <ExpandMore />}
                </Box>
            </ListItem>
            <Collapse in={open} timeout="auto" unmountOnExit>
                <TaskDetails task={task} />
            </Collapse>
        </React.Fragment>
    );
};

export default TaskListItem;
