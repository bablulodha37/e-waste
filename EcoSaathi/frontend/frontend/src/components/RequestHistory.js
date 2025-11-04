import React, { useEffect, useState } from 'react';
import { api } from '../api';

export default function RequestHistory({ userId }) {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const data = await api(`/api/auth/user/${userId}/requests`);
                setRequests(data);
            } catch (err) {
                setError('Failed to load request history.');
                console.error('Error fetching requests:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchRequests();
    }, [userId]);

    if (loading) return <div>Loading request history...</div>;
    if (error) return <div className="error-msg">{error}</div>;
    if (requests.length === 0) return <div>You have not submitted any requests yet.</div>;

    const getStatusClass = (status) => {
        if (status === 'SCHEDULED') return 'status-scheduled';
        if (status === 'COMPLETED') return 'status-completed';
        return 'status-pending'; // PENDING
    };

    return (
        <div className="request-history-card">
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