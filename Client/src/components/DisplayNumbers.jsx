import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaWhatsapp, FaTimes, FaQuestion } from 'react-icons/fa';

const DisplayNumbers = () => {
    const [contacts, setContacts] = useState([]);

    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/contacts`);
                console.log(response.data);
                
                setContacts(response.data);
            } catch (error) {
                console.error('Error fetching contacts:', error);
            }
        };

        fetchContacts();
    }, []);

    return (
        <div className="w-full flex justify-center">
            <div className="w-1/2">
                <h1 className="text-xl font-bold mb-4">Contact List</h1>
                <table className="min-w-full table-auto border-collapse border border-gray-300">
                    <thead>
                        <tr>
                            <th className="px-2 py-1 border border-gray-300">Phone Number</th>
                            <th className="px-2 py-1 border border-gray-300">Country</th>
                            <th className="px-2 py-1 border border-gray-300">WhatsApp</th>
                        </tr>
                    </thead>
                    <tbody>
                        {contacts.map((contact, index) => (
                            <tr key={index}>
                                <td className="px-2 py-1 border border-gray-300">{contact.phoneNumber}</td>
                                <td className="px-2 py-1 border border-gray-300">{contact.country}</td>
                                <td className="px-2 py-1 border border-gray-300">
                                    {contact.is_whatsapp === true ? (
                                        <FaWhatsapp color="green" />
                                    ) : contact.is_whatsapp === false ? (
                                        <FaTimes color="red" />
                                    ) : (
                                        <FaQuestion color="gray" />
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DisplayNumbers;