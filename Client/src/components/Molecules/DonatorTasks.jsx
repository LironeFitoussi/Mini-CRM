import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DonatorTaskItem from '../Atoms/DonatorTaskItem';

const DonatorTasks = ({ donatorId }) => {
    // console.log(donatorId);
    
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_API_URL}/api/v1/donators/${donatorId}/tasks`);
                console.log(response.data);
                
                setTasks(response.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, [donatorId]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h2>Tasks for Donator {donatorId}</h2>
            <ul>
                {tasks.map(task => (
                    <li key={task._id}>
                        <DonatorTaskItem task={task} />
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default DonatorTasks;