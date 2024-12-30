import React, { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Badge from '@mui/material/Badge';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import {useNavigate} from 'react-router-dom';

import useNotifications from '../../queryhooks/useNotifications';

const NotificationsButton = () => {
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);

    const { notifications, isLoading } = useNotifications();

    if (isLoading) {
        return null;
    }

    const formattedNotifications = notifications?.map((notification) => {
        if (notification.type === 'callback') {
            return {
                content : `Call back for ${notification?.donator?.fName || ""} ${notification?.donator?.lName || ""} on ${notification.notificationDate.split('T')[0]}`,
                ...notification,
            }
        }

        return {
            content: notification.message,
            ...notification,
        }
    });

    console.log('Formatted Notifications:', formattedNotifications);
    
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleNotificationClick = (notification) => {
        console.log(notification.type);
        
        if (notification.type === 'callback') {            
            navigate(`/dashboard/donators/${notification.donator._id}`);
        }
        handleClose()
    };

    return (
        <>
            <IconButton  aria-label="notifications" onClick={handleClick}
                color={notifications?.length > 0 ? 'secondary' : 'default'}
            >
                <Badge badgeContent={notifications?.length} color="secondary">
                    <NotificationsIcon />
                </Badge>
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                {formattedNotifications?.map((notification, index) => (
                    <MenuItem key={index} onClick={() => handleNotificationClick(notification)}>
                        {notification.content}
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
};

export default NotificationsButton;
