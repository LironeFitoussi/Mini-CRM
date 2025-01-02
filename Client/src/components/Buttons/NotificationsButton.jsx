import React, { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Badge from '@mui/material/Badge';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider'; // For adding a linear line
import { useNavigate } from 'react-router-dom';

import useUserNotifications from '../../queryhooks/useUserNotifications';

const NotificationsButton = () => {
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);

    const { notifications, isLoading, setNotificationAsRead, refetch } = useUserNotifications();

    if (isLoading) {
        return null;
    }

    const formattedNotifications = notifications?.map((notification) => ({
        content: (
            <span style={{ fontWeight: notification.isRead ? 'normal' : 'bold' }}>
                {notification.type === 'callback'
                    ? `Call back for ${notification?.donator?.fName || ""} ${notification?.donator?.lName || ""} on ${notification.notificationDate.split('T')[0]}`
                    : notification.message}
            </span>
        ),
        isRead: notification.isRead,
        ...notification,
    }));

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const unreadNotifications = notifications?.filter((notification) => !notification.isRead);

    const handleNotificationClick = async (notification) => {
        // Set notification as read
        await setNotificationAsRead(notification._id);
        await refetch();
        if (notification.type === 'callback') {
            navigate(`/dashboard/donators/${notification.donator._id}`);
        }
        handleClose();
    };

    return (
        <>
            <IconButton
                aria-label="notifications"
                onClick={handleClick}
                color={unreadNotifications?.length > 0 ? 'secondary' : 'default'}
            >
                <Badge badgeContent={unreadNotifications?.length} color="secondary">
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
                    <MenuItem
                        key={index}
                        onClick={() => handleNotificationClick(notification)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            position: 'relative',
                        }}
                    >
                        {!notification.isRead && (
                            <div
                                style={{
                                    width: '4px',
                                    height: '100%',
                                    backgroundColor: 'blue',
                                    position: 'absolute',
                                    left: 0,
                                    top: 0,
                                }}
                            />
                        )}
                        <div style={{ marginLeft: notification.isRead ? 0 : '8px' }}>
                            {notification.content}
                        </div>
                    </MenuItem>
                ))}
                <Divider />
            </Menu>
        </>
    );
};

export default NotificationsButton;
