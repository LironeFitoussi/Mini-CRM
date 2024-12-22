// src/components/StatusSelect.jsx
import React from 'react';
import {
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
} from '@mui/material';
import { getStatusColor } from '../../utils';

const StatusSelect = ({ task, onStatusChange, statusOptions }) => {
    const handleChange = (e) => {
        const newStatus = e.target.value;
        if (newStatus !== task.status) {
            onStatusChange(task._id, newStatus);
        }
    };

    const selectedOption = statusOptions.find((option) => option.value === task.status);

    return (
        <FormControl
            variant="outlined"
            size="small"
            style={{ minWidth: 140, marginRight: '1rem' }}
            onClick={(e) => e.stopPropagation()} // Prevent triggering the details toggle
        >
            <InputLabel id={`status-select-label-${task._id}`}>Status</InputLabel>
            <Select
                labelId={`status-select-label-${task._id}`}
                id={`status-select-${task._id}`}
                value={task.status}
                onChange={handleChange}
                label="Status"
                renderValue={(selected) => {
                    const option = statusOptions.find((opt) => opt.value === selected);
                    return (
                        <Box display="flex" alignItems="center">
                            <Box
                                sx={{
                                    width: 12,
                                    height: 12,
                                    bgcolor: getStatusColor(option.color),
                                    borderRadius: '50%',
                                    marginRight: '0.5rem',
                                }}
                            />
                            {option.label}
                        </Box>
                    );
                }}
            >
                {statusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                        <Box display="flex" alignItems="center">
                            <Box
                                sx={{
                                    width: 12,
                                    height: 12,
                                    bgcolor: getStatusColor(option.color),
                                    borderRadius: '50%',
                                    marginRight: '0.5rem',
                                }}
                            />
                            {option.label}
                        </Box>
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

export default StatusSelect;
