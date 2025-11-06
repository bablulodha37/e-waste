// src/components/RequestHistory.js

import React, { useEffect, useState } from 'react';
// 💡 Import useParams to read the ID from the URL
import { useParams } from "react-router-dom"; 
import { api } from '../api';
import "../css/RequestHistory.css";

// 💡 Props are no longer needed; use useParams()
export default function RequestHistory() { 
    // 💡 Get the 'id' parameter from the URL
    const { id } = useParams();
    
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                // Use the ID obtained from useParams
                const data = await api(`/api/auth/user/${id}/requests`); 
                setRequests(data);
            } catch (err) {
                setError('Failed to load request history.');
                console.error('Error fetching requests:', err);
            } finally {
                setLoading(false);
            }
        };
        // Use 'id' to trigger the fetch
        if (id) {
            fetchRequests();
        }
    }, [id]); 

    if (loading) return <div className="container">Loading request history...</div>;
    if (error) return <div className="container error-msg">{error}</div>;
    if (requests.length === 0) return <div className="container">You have not submitted any requests yet.</div>;

    const getStatusClass = (status) => {
        if (status === 'SCHEDULED') return 'status-scheduled';
        if (status === 'COMPLETED') return 'status-completed';
        return 'status-pending'; // PENDING
    };

    return (
        <div className="container request-history-card">
            <h3>Your Requests</h3>
            <table className="request-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Type</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Scheduled Time</th>
                    </tr>
                </thead>
                <tbody>
                    {requests.map((req) => (
                        <tr key={req.id}>
                            <td>{req.id}</td>
                            <td>{req.type}</td>
                            <td>{req.description}</td>
                            <td>
                                <span className={`status-badge ${getStatusClass(req.status)}`}>
                                    {req.status}
                                </span>
                            </td>
                            <td>
                                {req.scheduledTime ? 
                                    new Date(req.scheduledTime).toLocaleString() : 
                                    'Awaiting Schedule'
                                }
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}