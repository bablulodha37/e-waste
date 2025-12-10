import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import { api } from '../api';
import '../css/Certificate.css';
import '../css/UserDashboard.css';

// Icons for Certificate
import { 
  FiAward, 
  FiDownload, 
  FiCheckCircle, 
  FiXCircle, 
  FiBarChart2, 
  FiTarget,
  FiCalendar,
  FiUser
} from 'react-icons/fi';

// Icons for Sidebar
import {
  FaHome,
  FaUser as FaUserIcon,
  FaBoxOpen,
  FaHistory,
  FaCertificate,
  FaChartLine,
  FaCog,
  FaQuestionCircle,
  FaSignOutAlt,
  FaBell,
  FaTimes
} from 'react-icons/fa';

const MIN_COMPLETED_REQUESTS = 10;

export default function CertificateGenerator() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // Certificate state
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [generating, setGenerating] = useState(false);
    const certificateRef = useRef(null);
    
    // Dashboard state
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState('certificate');
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const currentUser = JSON.parse(localStorage.getItem('user'));
                if (!currentUser) {
                    navigate('/login');
                    return;
                }
                
                const [userData, statsData] = await Promise.all([
                    api(`/api/auth/user/${id}`),
                    api(`/api/auth/user/${id}/stats`)
                ]);
                
                setUser(userData);
                setStats(statsData);
                
                // Mock notifications
                const mockNotifications = [
                    { id: 1, title: 'Certificate Update', message: 'Your certificate is ready to download', time: '5 min ago', read: false },
                    { id: 2, title: 'Progress Milestone', message: 'You reached 50% of certificate goal', time: '1 day ago', read: true },
                ];
                setNotifications(mockNotifications);
            } catch (err) {
                setError('Failed to load certificate data. Please try again.');
                console.error('Error fetching certificate data:', err);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchData();
    }, [id, navigate]);

    const generatePdf = async () => {
        const element = certificateRef.current;
        if (element) {
            setGenerating(true);
            try {
                const options = {
                    margin: [10, 10, 10, 10],
                    filename: `EcoSaathi_Certificate_${user.firstName}_${user.lastName || ''}.pdf`,
                    image: { type: 'jpeg', quality: 1.0 },
                    html2canvas: { 
                        scale: 3, 
                        useCORS: true, 
                        logging: false,
                        backgroundColor: '#f8fafc'
                    },
                    jsPDF: { 
                        unit: 'mm', 
                        format: 'a4', 
                        orientation: 'landscape',
                        compress: true
                    },
                    pagebreak: { mode: 'avoid-all' }
                };
                
                await html2pdf().set(options).from(element).save();
            } catch (err) {
                console.error('PDF generation failed:', err);
                alert('Failed to generate PDF. Please try again.');
            } finally {
                setGenerating(false);
            }
        }
    };

    // Logout function
    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="loading-spinner"></div>
                <p>Loading certificate information...</p>
            </div>
        );
    }

    if (error) return (
        <div className="request-history-error">{error}</div>
    );

    const completedCount = stats?.completed || 0;
    const isEligible = completedCount >= MIN_COMPLETED_REQUESTS;
    const progressPercent = Math.min(100, Math.round((completedCount / MIN_COMPLETED_REQUESTS) * 100));
    const remaining = Math.max(0, MIN_COMPLETED_REQUESTS - completedCount);

    const progressColor = isEligible 
        ? 'linear-gradient(90deg, #059669 0%, #10b981 100%)' 
        : 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)';

    return (
        <div className={`dashboard-container ${sidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
            {/* Sidebar - Same as Dashboard */}
            <div className="dashboard-sidebar">
              <div className="sidebar-user">
                    <div className="user-avatar">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </div>
                    <div className="user-info">
                        <h4>{user?.firstName} {user?.lastName}</h4>
                        <p>{user?.email}</p>
                        <span className="user-role">Standard User</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <Link 
                        to={`/dashboard/${id}`}
                        className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setActiveTab('dashboard')}
                    >
                        <FaHome className="nav-icon" />
                        <span>Dashboard</span>
                    </Link>
                    
                    <Link 
                        to={`/profile/${id}`}
                        className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        <FaUserIcon className="nav-icon" />
                        <span>My Profile</span>
                    </Link>
                    
                    <Link 
                        to={`/request/submit/${id}`}
                        className={`nav-item ${activeTab === 'new-request' ? 'active' : ''}`}
                        onClick={() => setActiveTab('new-request')}
                    >
                        <FaBoxOpen className="nav-icon" />
                        <span>New Request</span>
                    </Link>
                    
                    <Link 
                        to={`/profile/${id}/history`}
                        className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
                        onClick={() => setActiveTab('history')}
                    >
                        <FaHistory className="nav-icon" />
                        <span>Request History</span>
                    </Link>
                    
                    <Link 
                        to={`/certificate/${id}`}
                        className={`nav-item ${activeTab === 'certificate' ? 'active' : ''}`}
                        onClick={() => setActiveTab('certificate')}
                    >
                        <FaCertificate className="nav-icon" />
                        <span>Certificates</span>
                    </Link>
                    
                    <Link 
                        to={`/report/${id}`}
                        className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
                        onClick={() => setActiveTab('reports')}
                    >
                        <FaChartLine className="nav-icon" />
                        <span>Reports</span>
                    </Link>
                    
                    <div className="sidebar-divider"></div>
                    
         <Link 
            to={`/profile/${id}/edit`}
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <FaCog className="nav-icon" />
            <span>Settings</span>
          </Link>
                    
                    <Link 
                        to={`/support/${id}`}
                        className={`nav-item ${activeTab === 'support' ? 'active' : ''}`}
                        onClick={() => setActiveTab('support')}
                    >
                        <FaQuestionCircle className="nav-icon" />
                        <span>Help & Support</span>
                    </Link>
                </nav>

                <div className="sidebar-footer">
                    <button 
                        className="nav-item logout" 
                        onClick={handleLogout}
                    >
                        <FaSignOutAlt className="nav-icon" />
                        <span>Logout</span>
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="dashboard-main">
                {/* Top Bar */}
                <header className="dashboard-topbar">
                    <div className="topbar-left">
                        <h1 className="page-title">Certificate of Recognition</h1>
                        <p className="page-subtitle">
                            Your journey towards environmental sustainability
                        </p>
                    </div>

                    <div className="topbar-right">
                        <Link to={`/dashboard/${id}`} className="btn btn-primary">
                            ← Back to Dashboard
                        </Link>
                    </div>
                </header>

                {/* Certificate Content */}
                <main className="dashboard-content">
                    <div className="certificate-page">
                        {/* Progress Dashboard */}
                        <div className="progress-dashboard glass-card">
                            <div className="dashboard-card">
                                <div className="card-header">
                                    <FiTarget />
                                    <h3>Certificate Progress</h3>
                                </div>
                                
                                <div className="progress-stats">
                                    <div className="stat-item">
                                        <div className="stat-value">{completedCount}</div>
                                        <div className="stat-label">Completed Requests</div>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-value">{MIN_COMPLETED_REQUESTS}</div>
                                        <div className="stat-label">Required</div>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-value" style={{ color: isEligible ? '#059669' : '#d97706' }}>
                                            {progressPercent}%
                                        </div>
                                        <div className="stat-label">Progress</div>
                                    </div>
                                </div>

                                <div className="progress-visual">
                                    <div className="progress-bar-container">
                                        <div 
                                            className="progress-bar-fill" 
                                            style={{ 
                                                width: `${progressPercent}%`,
                                                background: progressColor
                                            }}
                                        >
                                            <span className="progress-text">{progressPercent}%</span>
                                        </div>
                                    </div>
                                    <div className="progress-labels">
                                        <span>0</span>
                                        <span>{MIN_COMPLETED_REQUESTS}</span>
                                    </div>
                                </div>

                                <div className="progress-message">
                                    {isEligible ? (
                                        <div className="eligible-message">
                                            <FiCheckCircle />
                                            <span>Congratulations! You're eligible for your certificate</span>
                                        </div>
                                    ) : (
                                        <div className="ineligible-message">
                                            <FiXCircle />
                                            <span>{remaining} more request{remaining !== 1 ? 's' : ''} needed</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Certificate Preview */}
                        {isEligible ? (
                            <div className="certificate-section glass-card">
                                <div className="section-header">
                                    <h2>Your Certificate Preview</h2>
                                    <p>Ready for download</p>
                                </div>
                                
                                <div className="certificate-actions">
                                    <button 
                                        className={`download-btn ${generating ? 'generating' : ''}`} 
                                        onClick={generatePdf}
                                        disabled={generating}
                                    >
                                        <FiDownload />
                                        {generating ? 'Generating PDF...' : 'Download Certificate'}
                                    </button>
                                </div>

                                <div className="certificate-preview" ref={certificateRef}>
                                    <div className="certificate-design">
                                        {/* Decorative Elements */}
                                        <div className="corner-decoration top-left"></div>
                                        <div className="corner-decoration top-right"></div>
                                        <div className="corner-decoration bottom-left"></div>
                                        <div className="corner-decoration bottom-right"></div>
                                        
                                        {/* Certificate Content */}
                                        <div className="certificate-content">
                                            <div className="certificate-logo">
                                                <div className="logo-icon">🌍</div>
                                                <div className="logo-text">
                                                    <h2>EcoSaathi</h2>
                                                    <span>Environmental Initiative</span>
                                                </div>
                                            </div>
                                            
                                            <div className="certificate-title">
                                                <h1>CERTIFICATE OF RECOGNITION</h1>
                                                <div className="title-decoration"></div>
                                            </div>
                                            
                                            <div className="certificate-subtitle">
                                                This certificate is proudly presented to
                                            </div>
                                            
                                            <div className="recipient-name">
                                                <h2>{user?.firstName} {user?.lastName}</h2>
                                                <div className="name-underline"></div>
                                            </div>
                                            
                                            <div className="certificate-body">
                                                <p>
                                                    For demonstrating outstanding commitment to <strong>environmental sustainability</strong> 
                                                    and responsible e-waste disposal through active participation in the EcoSaathi program.
                                                </p>
                                                
                                                <div className="achievement-highlight">
                                                    <div className="achievement-icon">🏆</div>
                                                    <div className="achievement-text">
                                                        Successfully completed <span className="highlight">{completedCount}</span> 
                                                        e-waste collection requests
                                                    </div>
                                                </div>
                                                
                                                <p className="certificate-message">
                                                    Your efforts contribute to a cleaner environment and promote sustainable practices 
                                                    in our community.
                                                </p>
                                            </div>
                                            
                                            <div className="certificate-footer">
                                                <div className="signature-section">
                                                    <div className="signature-line"></div>
                                                    <div className="signature-name">Bablu Lodha</div>
                                                    <div className="signature-title">EcoSaathi Administration</div>
                                                </div>
                                                
                                                <div className="date-section">
                                                    <div className="date-icon">
                                                        <FiCalendar />
                                                    </div>
                                                    <div className="date-text">
                                                        {new Date().toLocaleDateString('en-US', { 
                                                            year: 'numeric', 
                                                            month: 'long', 
                                                            day: 'numeric' 
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="certificate-id">
                                                Certificate ID: ES-{user?.id?.slice(0, 8)?.toUpperCase() || 'USER'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="ineligible-section glass-card">
                                <div className="ineligible-content">
                                    <div className="ineligible-icon">
                                        <FiTarget />
                                    </div>
                                    <h3>Continue Your Journey</h3>
                                    <p>
                                        You've completed <strong>{completedCount}</strong> of <strong>{MIN_COMPLETED_REQUESTS}</strong> 
                                        required requests. Keep going to earn your certificate!
                                    </p>
                                    <div className="action-tips">
                                        <div className="tip">
                                            <div className="tip-number">1</div>
                                            <p>Schedule more e-waste pickups</p>
                                        </div>
                                        <div className="tip">
                                            <div className="tip-number">2</div>
                                            <p>Complete pending requests</p>
                                        </div>
                                        <div className="tip">
                                            <div className="tip-number">3</div>
                                            <p>Invite others to participate</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}