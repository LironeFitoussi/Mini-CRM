// src/components/AddTaskButton.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import {
    Modal,
    TextField,
    Button,
    Autocomplete,
    CircularProgress,
} from '@mui/material';
import useDonators from '../../queryhooks/useDonators';
import useUsers from '../../queryhooks/useUsers'; // Import the useUsers hook
import useDebounce from '../../../hooks/useDebounce'; // Ensure the correct path

const addTask = async (newTask) => {
    console.log('Adding Task:', newTask);
    
    const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/tasks`,
        newTask
    );
    return response.data;
};

const AddTaskButton = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // **Donator States**
    const [donatorInputValue, setDonatorInputValue] = useState('');
    const debouncedDonatorSearchTerm = useDebounce(donatorInputValue, 500);
    const [selectedDonator, setSelectedDonator] = useState(null);

    // **User States**
    const [userInputValue, setUserInputValue] = useState('');
    const debouncedUserSearchTerm = useDebounce(userInputValue, 500);
    const [selectedUser, setSelectedUser] = useState(null);

    // **Form Data State**
    const [taskData, setTaskData] = useState({
        user: '',
        title: '',
        description: '',
        donator: '',
        dueDate: '',
    });

    // **Error Handling**
    const [errorMessage, setErrorMessage] = useState('');

    const queryClient = useQueryClient();

    // **Fetching Donators**
    const {
        donators,
        isLoading: isDonatorsLoading,
        isError: isDonatorsError,
    } = useDonators({
        initialPage: 1,
        limit: 10000,
        search: debouncedDonatorSearchTerm,
    });

    // **Fetching Users**
    const {
        users,
        isLoading: isUsersLoading,
        isError: isUsersError,
    } = useUsers({
        initialPage: 1,
        limit: 10000,
        search: debouncedUserSearchTerm,
    });

    // **Mutation for Adding Task**
    const mutation = useMutation({
        mutationFn: addTask,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            setIsModalOpen(false);
            setTaskData({
                user: '',
                title: '',
                description: '',
                donator: '',
                dueDate: '',
            });
            setSelectedDonator(null);
            setSelectedUser(null);
            setErrorMessage('');
        },
        onError: (error) => {
            console.error('Error adding task:', error);
            setErrorMessage('Failed to add task. Please try again.');
        },
    });

    // **Handle Form Field Changes**
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setTaskData((prevState) => ({ ...prevState, [name]: value }));
    };

    // **Handle Donator Input Change**
    const handleDonatorInputChange = (event, value) => {
        setDonatorInputValue(value);
    };

    // **Handle Donator Selection**
    const handleDonatorChange = (event, value) => {
        setSelectedDonator(value);
        setTaskData((prevState) => ({
            ...prevState,
            donator: value ? value.id : '',
        }));
    };

    // **Handle User Input Change**
    const handleUserInputChange = (event, value) => {
        setUserInputValue(value);
    };

    // **Handle User Selection**
    const handleUserChange = (event, value) => {
        setSelectedUser(value);
        console.log('Selected User:', value);
        
        setTaskData((prevState) => ({
            ...prevState,
            user: value ? value._id : '',
        }));
    };

    // **Handle Form Submission**
    const handleAddTask = (e) => {
        e.preventDefault();
        // Optional: Add additional validation here
        mutation.mutate(taskData);
    };

    // **Sanitize Donators to Ensure fullName**
    const sanitizedDonators = donators.map((donator) => ({
        ...donator,
        fullName: `${donator.fName || ''} ${donator.lName || ''}`.trim(),
    }));

    // **Sanitize Users to Ensure fullName**
    const sanitizedUsers = users.map((user) => ({
        ...user,
        fullName: `${user.fName || ''} ${user.lName || ''}`.trim(),
    }));

    return (
        <>
            {/* Add Task Button */}
            <button
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
                onClick={() => setIsModalOpen((prevState) => !prevState)}
                disabled={mutation.isLoading}
            >
                {mutation.isLoading ? 'Adding...' : 'Add Task'}
            </button>

            {/* Modal */}
            <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-96">
                        <form onSubmit={handleAddTask} className="space-y-4">
                            {/* **User Autocomplete** */}
                            <Autocomplete
                                fullWidth
                                options={sanitizedUsers}
                                getOptionLabel={(option) =>
                                    option.fullName || 'Unknown User'
                                }
                                loading={isUsersLoading}
                                onInputChange={handleUserInputChange}
                                onChange={handleUserChange}
                                value={selectedUser}
                                inputValue={userInputValue}
                                renderOption={(props, option) => (
                                    <li {...props} key={option.id}>
                                        {option.fullName}
                                    </li>
                                )}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="User"
                                        required
                                        InputProps={{
                                            ...params.InputProps,
                                            endAdornment: (
                                                <>
                                                    {isUsersLoading ? (
                                                        <CircularProgress size={20} />
                                                    ) : null}
                                                    {params.InputProps.endAdornment}
                                                </>
                                            ),
                                        }}
                                        className="mt-2"
                                    />
                                )}
                            />

                            {/* **Title Field** */}
                            <TextField
                                fullWidth
                                label="Title"
                                name="title"
                                value={taskData.title}
                                onChange={handleInputChange}
                                required
                                className="mt-2"
                            />

                            {/* **Description Field** */}
                            <TextField
                                fullWidth
                                label="Description"
                                name="description"
                                value={taskData.description}
                                onChange={handleInputChange}
                                multiline
                                rows={4}
                                required
                                className="mt-2"
                            />

                            {/* **Donator Autocomplete** */}
                            <Autocomplete
                                fullWidth
                                options={sanitizedDonators}
                                getOptionLabel={(option) =>
                                    option.fullName || 'Unknown Donator'
                                }
                                loading={isDonatorsLoading}
                                onInputChange={handleDonatorInputChange}
                                onChange={handleDonatorChange}
                                value={selectedDonator}
                                inputValue={donatorInputValue}
                                renderOption={(props, option) => (
                                    <li {...props} key={option.id}>
                                        {option.fullName}
                                    </li>
                                )}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Donator"
                                        required
                                        InputProps={{
                                            ...params.InputProps,
                                            endAdornment: (
                                                <>
                                                    {isDonatorsLoading ? (
                                                        <CircularProgress size={20} />
                                                    ) : null}
                                                    {params.InputProps.endAdornment}
                                                </>
                                            ),
                                        }}
                                        className="mt-2"
                                    />
                                )}
                            />

                            {/* **Due Date Field** */}
                            <TextField
                                fullWidth
                                label="Due Date"
                                name="dueDate"
                                type="date"
                                value={taskData.dueDate}
                                onChange={handleInputChange}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                required
                                className="mt-2"
                            />

                            {/* **Error Message Display** */}
                            {errorMessage && (
                                <div className="text-red-500 text-sm">
                                    {errorMessage}
                                </div>
                            )}

                            {/* **Form Buttons** */}
                            <div className="flex justify-between mt-4">
                                <Button
                                    variant="contained"
                                    color="primary"
                                    type="submit"
                                    disabled={mutation.isLoading}
                                    className="bg-blue-500 hover:bg-blue-600"
                                >
                                    {mutation.isLoading ? 'Adding...' : 'Submit'}
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    onClick={() => setIsModalOpen(false)}
                                    className="border-gray-400 hover:border-gray-500"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default AddTaskButton;
