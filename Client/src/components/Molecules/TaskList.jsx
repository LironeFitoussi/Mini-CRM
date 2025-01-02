// src/components/TaskList.jsx
import React from 'react';
import { List } from '@mui/material';
import TaskListItem from '../Atoms/TaskListItem.jsx';

const TaskList = ({ tasks, onStatusChange, isUpdating }) => {
    // console.log(isUpdating);
    
    return (
        <List>
            {tasks.map((task) => (
                <TaskListItem
                    key={task._id}
                    task={task}
                    onStatusChange={onStatusChange}
                    isUpdating={isUpdating}
                />
            ))}
        </List>
    );
};

export default TaskList;
