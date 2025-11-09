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
    
    // 🆕 Filter Logic
    const filteredRequests = requests.filter(req => 
        filterStatus === 'ALL' || req.status === filterStatus
    );

    if (loading) return <div className="container">Loading request history...</div>;
    if (error) return <div className="container error-msg">{error}</div>;
    if (requests.length === 0) return <div className="container">You have not submitted any requests yet.</div>;

    return (
        <div className="container request-history-card">
            <h3>Your Requests</h3>
            
            {/* 🆕 Status Filter UI */}
            <div className="status-filter">
                <label>Filter Status: </label>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="ALL">ALL ({requests.length})</option>
                    {/* Unique statuses from requests could be calculated, but a fixed list is fine */}
                    <option value="PENDING">PENDING</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="SCHEDULED">SCHEDULED</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="REJECTED">REJECTED</option>
                </select>
            </div>
            
            <p className="request-count">
                **Showing {filteredRequests.length} requests**
            </p>
            
            <table className="request-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Device Type</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Scheduled Time</th>
                        {/* 🆕 New Header */}
                        <th>Pickup Person</th> 
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
                            {/* 🆕 Display Pickup Person Info */}
                            <td>
                                {req.isPickupPersonAssigned && req.assignedPickupPerson 
                                    ? `Name: ${req.assignedPickupPerson.name} | Contact: ${req.assignedPickupPerson.phone}` 
                                    : 'Not Assigned Yet'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}