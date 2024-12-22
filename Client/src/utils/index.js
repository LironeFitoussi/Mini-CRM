// src/utils/index.js

// Capitalize the first letter of a string
export const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

// Map MUI color to actual color codes if needed
export const getStatusColor = (muiColor) => {
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
