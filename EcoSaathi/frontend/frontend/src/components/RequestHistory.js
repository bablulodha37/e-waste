import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { api } from '../api';
import "../css/RequestHistory.css";

export default function RequestHistory() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState('ALL');

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
        if (status === 'REJECTED') return 'status-rejected';
        if (status === 'APPROVED') return 'status-approved';
        return 'status-pending';
    };
    
    const filteredRequests = requests.filter(req => 
        filterStatus === 'ALL' || req.status === filterStatus
    );

    return (
        <div className="container request-history-card">
            <h3>Your Requests</h3>
            
            <div className="status-filter">
                <label>Filter Status: </label>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="ALL">ALL ({requests.length})</option>
                    <option value="PENDING">PENDING</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="SCHEDULED">SCHEDULED</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="REJECTED">REJECTED</option>
                </select>
            </div>
            
            <p className="request-count">
                Showing {filteredRequests.length} requests
            </p>
            
            <table className="request-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Device Type</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Scheduled Time</th>
                        <th>Pickup Person</th>
                        <th>Track</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredRequests.map((req) => (
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

                            <td>
                                {req.assignedPickupPerson
                                    ? `${req.assignedPickupPerson.name} (${req.assignedPickupPerson.phone})`
                                    : 'Not Assigned Yet'}
                            </td>

                            <td>
                                {req.status === "SCHEDULED" && (
                                    <button
                                        className="track-btn"
                                        onClick={() => navigate(`/track/pickup/${req.id}`)}
                                    >
                                        🚛 Track Pickup Person
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
