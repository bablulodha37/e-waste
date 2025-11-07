// src/components/RequestHistory.js

import React, { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import { api } from '../api';
import "../css/RequestHistory.css";

export default function RequestHistory() {
    // Get the 'id' parameter from the URL
    const { id } = useParams();

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const data = await api(`/api/auth/user/${id}/requests`);
                setRequests(data);
            } catch (err) {
                setError('Failed to load request history.');
                console.error('Error fetching requests:', err);
            } finally {
                setLoading(false);
            }
        };
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
        return 'status-pending';
    };

    return (
        <div className="container request-history-card">
            <h3>Your Requests</h3>
            {/* 💡 NEW LINE: Display the total number of requests */}
            <p className="request-count">
                **Total Requests: {requests.length}**
            </p>
            <table className="request-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Device Type</th>
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
                                {req.scheduledTime
                                    ? new Date(req.scheduledTime).toLocaleString()
                                    : 'Awaiting Schedule'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
