// components/NavBar.jsx
import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';

const NavBar = () => {
    return (
        <AppBar position="static" className="bg-blue-600">
            <Toolbar className="flex justify-between">
                <Typography variant="h6" component="div">
                    SMS Dashboard
                </Typography>
                <div>
                    <Button color="inherit">Home</Button>
                    <Button color="inherit">Conversations</Button>
                    <Button color="inherit">Settings</Button>
                </div>
            </Toolbar>
        </AppBar>
    );
};

export default NavBar;
