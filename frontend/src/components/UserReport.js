import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import { api } from '../api';
import '../css/UserReport.css';
import {
  FiDownload,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCheckCircle,
  FiXCircle,
  FiPackage,
  FiCalendar,
  FiClock,
  FiTrendingUp,
  FiBarChart2,
  FiFileText,
  FiShield
} from 'react-icons/fi';

export default function UserReport() {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [generatingPdf, setGeneratingPdf] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        completed: 0,
        pending: 0,
        scheduled: 0
    });
    
    const reportRef = useRef(null);

    useEffect(() => {
        const fetchReportData = async () => {
            try {
                const [userData, requestsData] = await Promise.all([
                    api(`/api/auth/user/${id}`),
                    api(`/api/auth/user/${id}/requests`)
                ]);
                
                setUser(userData);
                const sortedRequests = Array.isArray(requestsData) 
                    ? requestsData.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
                    : [];
                setRequests(sortedRequests);
                
                // Calculate statistics
                const statsData = {
                    total: sortedRequests.length,
                    completed: sortedRequests.filter(r => r.status === 'COMPLETED').length,
                    pending: sortedRequests.filter(r => r.status === 'PENDING' || r.status === 'APPROVED').length,
                    scheduled: sortedRequests.filter(r => r.status === 'SCHEDULED').length
                };
                setStats(statsData);
                
            } catch (err) {
                setError('Failed to load report data. Please try again later.');
                console.error('Error fetching report data:', err);
            } finally {
                setLoading(false);
            }
        };
        
        if (id) fetchReportData();
    }, [id]);

    const generatePdf = async () => {
        const element = reportRef.current;
        if (element) {
            setGeneratingPdf(true);
            try {
                const options = {
                    margin: [15, 15, 15, 15],
                    filename: `EcoSaathi_Report_${user?.firstName}_${new Date().toISOString().split('T')[0]}.pdf`,
                    image: { type: 'jpeg', quality: 1.0 },
                    html2canvas: { 
                        scale: 2, 
                        useCORS: true,
                        backgroundColor: '#ffffff'
                    },
                    jsPDF: { 
                        unit: 'mm', 
                        format: 'a4', 
                        orientation: 'portrait',
                        compress: true
                    },
                    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
                };
                
                await html2pdf().set(options).from(element).save();
            } catch (err) {
                console.error('PDF generation failed:', err);
                alert('Failed to generate PDF. Please try again.');
            } finally {
                setGeneratingPdf(false);
            }
        }
    };

    const getStatusClass = (status) => {
        const statusMap = {
            'PENDING': 'status-pending',
            'APPROVED': 'status-approved',
            'SCHEDULED': 'status-scheduled',
            'COMPLETED': 'status-completed',
            'CANCELLED': 'status-cancelled'
        };
        return statusMap[status] || 'status-pending';
    };

    const getStatusIcon = (status) => {
        const iconMap = {
            'PENDING': '⏳',
            'APPROVED': '✅',
            'SCHEDULED': '📅',
            'COMPLETED': '🏆',
            'CANCELLED': '❌'
        };
        return iconMap[status] || '📝';
    };

    // Safe function to format request ID
    const formatRequestId = (id) => {
        if (!id) return 'N/A';
        
        // Convert to string first
        const idStr = String(id);
        
        // Take first 8 characters
        if (idStr.length > 8) {
            return `#${idStr.slice(0, 8)}`;
        }
        return `#${idStr}`;
    };

    // Safe function to format report ID
    const formatReportId = (userId) => {
        if (!userId) return 'ES-UNKNOWN';
        
        const idStr = String(userId);
        if (idStr.length > 8) {
            return `ES-${idStr.slice(0, 8).toUpperCase()}`;
        }
        return `ES-${idStr.toUpperCase()}`;
    };

    if (loading) return (
        <div className="report-page loading">
            <div className="loading-content">
                <div className="loading-spinner"></div>
                <p>Generating your report...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="report-page error">
            <div className="error-content">
                <div className="error-icon">⚠️</div>
                <h3>Report Unavailable</h3>
                <p>{error}</p>
                <button className="retry-btn" onClick={() => window.location.reload()}>
                    Retry
                </button>
            </div>
        </div>
    );

    if (!user) return (
        <div className="report-page">
            <div className="no-data">
                <h2>User not found</h2>
                <p>The requested user report could not be generated.</p>
            </div>
        </div>
    );

    return (
        <div className="report-page">
            {/* Report Controls */}
            <div className="report-controls">
                <div className="header-content">
                    <div className="header-icon">
                        <FiFileText />
                    </div>
                    <div>
                        <h1>User E-Waste Report</h1>
                        <p className="header-subtitle">
                            Detailed analysis of user activity and requests
                        </p>
                    </div>
                </div>
                <button 
                    className={`pdf-download-btn ${generatingPdf ? 'generating' : ''}`} 
                    onClick={generatePdf}
                    disabled={generatingPdf}
                >
                    <FiDownload />
                    {generatingPdf ? 'Generating PDF...' : 'Download Report'}
                </button>
            </div>

            {/* Report Content */}
            <div className="report-content" ref={reportRef}>
                {/* Report Header */}
                <div className="report-header">
                    <div className="report-brand">
                        <div className="brand-icon">🌍</div>
                        <div>
                            <h2>EcoSaathi</h2>
                            <p>Environmental Impact Report</p>
                        </div>
                    </div>
                    <div className="report-meta">
                        <p>Report ID: {formatReportId(id)}</p>
                        <p>Generated: {new Date().toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}</p>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon total">
                            <FiBarChart2 />
                        </div>
                        <div className="stat-content">
                            <h3>{stats.total}</h3>
                            <p>Total Requests</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon completed">
                            <FiCheckCircle />
                        </div>
                        <div className="stat-content">
                            <h3>{stats.completed}</h3>
                            <p>Completed</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon pending">
                            <FiClock />
                        </div>
                        <div className="stat-content">
                            <h3>{stats.pending}</h3>
                            <p>Pending</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon scheduled">
                            <FiCalendar />
                        </div>
                        <div className="stat-content">
                            <h3>{stats.scheduled}</h3>
                            <p>Scheduled</p>
                        </div>
                    </div>
                </div>

                {/* User Profile Section */}
                <div className="report-section profile-section">
                    <div className="section-header">
                        <h3>
                            <FiUser /> User Profile
                        </h3>
                        <div className={`verification-badge ${user.verified ? 'verified' : 'unverified'}`}>
                            {user.verified ? <FiCheckCircle /> : <FiXCircle />}
                            {user.verified ? 'Verified Account' : 'Unverified Account'}
                        </div>
                    </div>
                    
                    <div className="profile-details">
                        <div className="detail-row">
                            <div className="detail-item">
                                <span className="detail-label">Full Name</span>
                                <span className="detail-value">
                                    {user.firstName} {user.lastName}
                                </span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">
                                    <FiMail /> Email
                                </span>
                                <span className="detail-value">{user.email}</span>
                            </div>
                        </div>
                        
                        <div className="detail-row">
                            <div className="detail-item">
                                <span className="detail-label">
                                    <FiPhone /> Phone
                                </span>
                                <span className="detail-value">{user.phone || 'Not provided'}</span>
                            </div>
                            <div className="detail-item">
                                <span className="detail-label">
                                    <FiShield /> Account Status
                                </span>
                                <span className="detail-value status-indicator">
                                    {user.verified ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                        
                        <div className="detail-item full-width">
                            <span className="detail-label">
                                <FiMapPin /> Pickup Address
                            </span>
                            <span className="detail-value address">
                                {user.pickupAddress || 'No address provided'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Request History Section */}
                <div className="report-section history-section">
                    <div className="section-header">
                        <h3>
                            <FiPackage /> Request History
                        </h3>
                        <div className="section-summary">
                            Showing {requests.length} request{requests.length !== 1 ? 's' : ''}
                        </div>
                    </div>

                    {requests.length === 0 ? (
                        <div className="empty-requests">
                            <FiPackage />
                            <p>No e-waste requests submitted by this user</p>
                        </div>
                    ) : (
                        <div className="requests-table-container">
                            <table className="requests-table">
                                <thead>
                                    <tr>
                                        <th>Request ID</th>
                                        <th>Device Type</th>
                                        <th>Status</th>
                                        <th>Scheduled Date</th>
                                        <th>Pickup Person</th>
                                        <th>Description</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {requests.map((req) => (
                                        <tr key={req.id}>
                                            <td className="request-id">
                                                {formatRequestId(req.id)}
                                            </td>
                                            <td>
                                                <div className="device-info">
                                                    <span className="device-icon">💻</span>
                                                    <span>{req.type || 'Unknown'}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`status-badge ${getStatusClass(req.status)}`}>
                                                    {getStatusIcon(req.status)} {req.status || 'Unknown'}
                                                </span>
                                            </td>
                                            <td>
                                                {req.scheduledTime ? (
                                                    <div className="date-info">
                                                        <span className="date">
                                                            {new Date(req.scheduledTime).toLocaleDateString()}
                                                        </span>
                                                        <span className="time">
                                                            {new Date(req.scheduledTime).toLocaleTimeString([], {
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="na-text">Not scheduled</span>
                                                )}
                                            </td>
                                            <td>
                                                {req.assignedPickupPerson ? (
                                                    <div className="pickup-person">
                                                        <span className="person-name">
                                                            {req.assignedPickupPerson.name || 'Unknown'}
                                                        </span>
                                                        <span className="person-phone">
                                                            {req.assignedPickupPerson.phone || 'No phone'}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="na-text">Not assigned</span>
                                                )}
                                            </td>
                                            <td className="description">
                                                {req.description || 'No description'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Environmental Impact Section */}
                {stats.completed > 0 && (
                    <div className="report-section impact-section">
                        <div className="section-header">
                            <h3>
                                <FiTrendingUp /> Environmental Impact
                            </h3>
                        </div>
                        <div className="impact-metrics">
                            <div className="metric">
                                <div className="metric-value">{stats.completed}</div>
                                <div className="metric-label">Devices Recycled</div>
                                <div className="metric-description">
                                    Preventing e-waste from landfills
                                </div>
                            </div>
                            <div className="metric">
                                <div className="metric-value">
                                    {(stats.completed * 2.5).toFixed(1)} kg
                                </div>
                                <div className="metric-label">CO₂ Saved</div>
                                <div className="metric-description">
                                    Equivalent to planting {Math.ceil(stats.completed * 0.5)} trees
                                </div>
                            </div>
                            <div className="metric">
                                <div className="metric-value">
                                    {(stats.completed * 1.2).toFixed(1)} kg
                                </div>
                                <div className="metric-label">Materials Recovered</div>
                                <div className="metric-description">
                                    Metals, plastics, and components
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Report Footer */}
                <div className="report-footer">
                    <div className="footer-content">
                        <div className="footer-brand">EcoSaathi</div>
                        <div className="footer-text">
                            <p>This report was automatically generated by the EcoSaathi platform.</p>
                            <p className="confidential">
                                <strong>Confidential</strong> - For authorized use only
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}