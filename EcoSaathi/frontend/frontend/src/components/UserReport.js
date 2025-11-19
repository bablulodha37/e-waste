// src/components/UserReport.js

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import { api } from '../api';
import '../css/UserReport.css';

export default function UserReport() {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const reportRef = useRef(null);

    useEffect(() => {
        const fetchReportData = async () => {
            try {
                const userData = await api(`/api/auth/user/${id}`);
                setUser(userData);

                const requestsData = await api(`/api/auth/user/${id}/requests`);
                setRequests(requestsData);
            } catch (err) {
                setError('Failed to load report data. Please check user ID and API.');
                console.error('Error fetching report data:', err);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchReportData();
    }, [id]);

    const generatePdf = () => {
        const element = reportRef.current;
        if (element) {
            const options = {
                margin: 10,
                filename: `eWaste_Report_User_${id}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            html2pdf().from(element).set(options).save();
        }
    };

    const getStatusClass = (status) => {
        if (status === 'SCHEDULED') return 'status-scheduled';
        if (status === 'COMPLETED') return 'status-completed';
        if (status === 'APPROVED') return 'status-approved';
        return 'status-pending';
    };

    if (loading) return <div className="container">Generating Report...</div>;
    if (error) return <div className="container error-msg">❌ {error}</div>;
    if (!user) return <div className="container">User not found.</div>;

    return (
        <div className="container report-page">
            <div className="report-controls">
                <h2>📊 User E-Waste Report</h2>
                <button className="pdf-download-btn" onClick={generatePdf}>
                    ⬇️ Download PDF
                </button>
            </div>

            <div className="report-content-wrapper" ref={reportRef}>
                <h1 className="report-main-title">EcoSaathi Report</h1>
                <p className="report-date">Generated on: {new Date().toLocaleDateString()}</p>

                {/* Profile Section */}
                <div className="report-section profile-section">
                    <h3>👤 Profile Details</h3>
                    <div className="detail-grid">
                        <p><strong>Full Name:</strong> {user.firstName} {user.lastName}</p>
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Phone:</strong> {user.phone}</p>
                        <p><strong>Verified:</strong> {user.verified ? '✅ Yes' : '❌ No'}</p>
                    </div>
                    <p><strong>Address:</strong> {user.pickupAddress}</p>
                </div>

                {/* Request History Section */}
                <div className="report-section history-section">
                    <h3>📦 Request History (Total: {requests.length})</h3>
                    {requests.length === 0 ? (
                        <p>No e-waste requests submitted by this user.</p>
                    ) : (
                        <table className="report-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Device Type</th>
                                    <th>Status</th>
                                    <th>Scheduled Time</th>
                                    <th>Pickup Person</th>
                                    <th>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map((req) => (
                                    <tr key={req.id}>
                                        <td>{req.id}</td>
                                        <td>{req.type}</td>
                                        <td>
                                            <span className={`status-badge ${getStatusClass(req.status)}`}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td>
                                            {req.scheduledTime
                                                ? new Date(req.scheduledTime).toLocaleDateString()
                                                : 'N/A'}
                                        </td>
                                        <td>
                                            {req.assignedPickupPerson
                                                ? `${req.assignedPickupPerson.name} (${req.assignedPickupPerson.phone})`
                                                : 'Not Assigned'}
                                        </td>
                                        <td>{req.description}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="report-footer">
                    <p>End of Report.</p>
                </div>
            </div>
        </div>
    );
}
