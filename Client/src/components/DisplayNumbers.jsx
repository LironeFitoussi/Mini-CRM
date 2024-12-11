import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaWhatsapp, FaTimes, FaQuestion } from 'react-icons/fa';

const DisplayNumbers = () => {
    const [contacts, setContacts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('unknown');
    const [limit, setLimit] = useState(50);

    console.log(filter);
    
    const fetchContacts = async (page, filter, limit) => {
        try {
            setLoading(true);
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/contacts?is_whatsapp=${filter}&page=${page}&limit=${limit}`
            );
            console.log(response.data);

            setContacts(response.data.contacts);
            setCurrentPage(response.data.currentPage);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('Error fetching contacts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContacts(currentPage, filter, limit);
    }, [currentPage, filter, limit]);

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage((prevPage) => prevPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage((prevPage) => prevPage - 1);
        }
    };

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
        setCurrentPage(1); // Reset to first page when filter changes
    };

    const handleLimitChange = (event) => {
        setLimit(Number(event.target.value));
        setCurrentPage(1); // Reset to first page when limit changes
    };

    const openWhatsapp = (phoneNumber) => {
        window.open(`https://wa.me/${phoneNumber}`, '_blank');
    }
    return (
        <div className="w-full flex flex-col items-center">
            <div className="w-1/2">
                <h1 className="text-xl font-bold mb-4">Contact List</h1>

                <div className="flex justify-between mb-4">
                    <div className="flex gap-2">
                        <button
                            className={`px-4 py-2 border rounded ${filter === 'true' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                            onClick={() => handleFilterChange('true')}
                        >
                            WhatsApp: True
                        </button>
                        <button
                            className={`px-4 py-2 border rounded ${filter === 'false' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                            onClick={() => handleFilterChange('false')}
                        >
                            WhatsApp: False
                        </button>
                        <button
                            className={`px-4 py-2 border rounded ${filter === 'unknown' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                            onClick={() => handleFilterChange('unknown')}
                        >
                            WhatsApp: Unknown
                        </button>
                    </div>

                    <select
                        className="px-4 py-2 border rounded"
                        value={limit}
                        onChange={handleLimitChange}
                    >
                        <option value={10}>10 per page</option>
                        <option value={50}>50 per page</option>
                        <option value={100}>100 per page</option>
                    </select>
                </div>

                {loading ? (
                    <p>Loading...</p>
                ) : (
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
                                            <FaWhatsapp color="green" onClick={() => openWhatsapp(contact.phoneNumber)} className='cursor-pointer'/>
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
                )}

                <div className="flex justify-between mt-4">
                    <button
                        className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </button>
                    <span className="px-4 py-2">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DisplayNumbers;