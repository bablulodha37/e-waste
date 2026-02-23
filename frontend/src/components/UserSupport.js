import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "../css/UserSupport.css";
import "../css/UserDashboard.css";

// Icons for Support
import {
  FiHelpCircle,
  FiMessageSquare,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiSend,
  FiArrowLeft,
  FiChevronDown,
  FiChevronUp,
  FiFileText,
  FiSearch,
  FiUser,
  FiMail
} from "react-icons/fi";

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
} from "react-icons/fa";

export default function UserSupport() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Support State
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [activeTab, setActiveTab] = useState("create");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);
  const [creatingTicket, setCreatingTicket] = useState(false);
  
  // Dashboard State
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeNavTab, setActiveNavTab] = useState('support');
  const [notifications, setNotifications] = useState([]);

  const API_BASE = "http://localhost:8080/api/issues";

  // Fetch User Data
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    
    // Mock notifications
    const mockNotifications = [
      { id: 1, title: 'Support Update', message: 'Your ticket #123 has been updated', time: '5 min ago', read: false },
      { id: 2, title: 'New Feature', message: 'Check out our new help center', time: '2 hours ago', read: true },
    ];
    setNotifications(mockNotifications);
  }, [navigate]);

  // Fetch User Issues
  const fetchIssues = async () => {
    if (!id) return;
    try {
      const res = await axios.get(`${API_BASE}/user/${id}`);
      const issuesData = Array.isArray(res.data) ? res.data : [];
      setIssues(issuesData);
      setFilteredIssues(issuesData);
    } catch (err) {
      console.error("Error fetching issues:", err);
      setIssues([]);
      setFilteredIssues([]);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [id]);

  // Filter Issues based on search and status
  useEffect(() => {
    let filtered = issues;
    
    if (searchTerm) {
      filtered = filtered.filter(issue =>
        issue.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== "all") {
      filtered = filtered.filter(issue => 
        issue.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    
    setFilteredIssues(filtered);
  }, [searchTerm, statusFilter, issues]);

  // Create New Ticket
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      alert("Please fill in both subject and description");
      return;
    }

    setCreatingTicket(true);
    try {
      await axios.post(`${API_BASE}/create/user/${id}`, {
        subject: subject.trim(),
        description: description.trim(),
      });
      
      alert("Ticket created successfully!");
      setSubject("");
      setDescription("");
      setActiveTab("history");
      await fetchIssues();
    } catch (err) {
      console.error("Create Error:", err);
      alert("Failed to create ticket. Please try again.");
    } finally {
      setCreatingTicket(false);
    }
  };

  // Open Chat View
  const openChat = async (issueId) => {
    setLoadingChat(true);
    try {
      const res = await axios.get(`${API_BASE}/${issueId}?requesterId=${id}&role=USER`);
      setSelectedIssue(res.data);
    } catch (err) {
      console.error("Error opening chat", err);
      alert("Could not load ticket details.");
    } finally {
      setLoadingChat(false);
    }
  };

  // Send Reply
  const sendReply = async () => {
    if (!replyText.trim() || !selectedIssue) return;
    
    try {
      const payload = {
        role: "USER",
        senderId: id,
        message: replyText.trim()
      };
      
      const res = await axios.post(`${API_BASE}/${selectedIssue.id}/reply`, payload);
      setSelectedIssue(res.data);
      setReplyText("");
      
      // Update issue in list
      setIssues(prev => prev.map(issue => 
        issue.id === selectedIssue.id ? res.data : issue
      ));
    } catch (err) {
      alert("Failed to send reply. Please try again.");
    }
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  // FAQs Data
  const faqs = [
    {
      question: "How long does it take to get a reply?",
      answer: "Our support team typically responds within 24–48 hours. Urgent issues are prioritized for faster resolution.",
      icon: <FiClock />
    },
    {
      question: "What do the different ticket statuses mean?",
      answer: "OPEN: Newly created ticket. IN_PROGRESS: Being reviewed. WAITING_FOR_USER: Waiting for your response. RESOLVED: Issue fixed. CLOSED: Ticket completed.",
      icon: <FiAlertCircle />
    },
    {
      question: "Can I reopen a closed ticket?",
      answer: "No, you cannot reopen closed tickets. Please create a new ticket and reference the old ticket ID for context.",
      icon: <FiFileText />
    },
    {
      question: "What information should I include in my ticket?",
      answer: "Be specific about the issue, include steps to reproduce, error messages, and any relevant screenshots or details.",
      icon: <FiHelpCircle />
    },
    {
      question: "How can I track my ticket progress?",
      answer: "All updates are sent via email and you can check the status in your ticket history. You'll receive notifications for any changes.",
      icon: <FiCheckCircle />
    }
  ];

  const toggleFaq = (index) => {
    setOpenFaqIndex(prev => prev === index ? null : index);
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Helper function to get status badge color
  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'open': return '#f59e0b';
      case 'in_progress': return '#3b82f6';
      case 'waiting_for_user': return '#8b5cf6';
      case 'resolved': return '#10b981';
      case 'closed': return '#6b7280';
      default: return '#6b7280';
    }
  };

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
            className={`nav-item ${activeNavTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveNavTab('dashboard')}
          >
            <FaHome className="nav-icon" />
            <span>Dashboard</span>
          </Link>
          
          <Link 
            to={`/profile/${id}`}
            className={`nav-item ${activeNavTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveNavTab('profile')}
          >
            <FaUserIcon className="nav-icon" />
            <span>My Profile</span>
          </Link>
          
          <Link 
            to={`/request/submit/${id}`}
            className={`nav-item ${activeNavTab === 'new-request' ? 'active' : ''}`}
            onClick={() => setActiveNavTab('new-request')}
          >
            <FaBoxOpen className="nav-icon" />
            <span>New Request</span>
          </Link>
          
          <Link 
            to={`/profile/${id}/history`}
            className={`nav-item ${activeNavTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveNavTab('history')}
          >
            <FaHistory className="nav-icon" />
            <span>Request History</span>
          </Link>
          
          <Link 
            to={`/certificate/${id}`}
            className={`nav-item ${activeNavTab === 'certificate' ? 'active' : ''}`}
            onClick={() => setActiveNavTab('certificate')}
          >
            <FaCertificate className="nav-icon" />
            <span>Certificates</span>
          </Link>
          
          <Link 
            to={`/report/${id}`}
            className={`nav-item ${activeNavTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveNavTab('reports')}
          >
            <FaChartLine className="nav-icon" />
            <span>Reports</span>
          </Link>
          
          <div className="sidebar-divider"></div>
          
          <Link 
  to={`/profile/${id}/edit`}
  className={`nav-item ${activeNavTab === 'settings' ? 'active' : ''}`}
  onClick={() => setActiveNavTab('settings')}
>
  <FaCog className="nav-icon" />
  <span>Settings</span>
</Link>
          
          <Link 
            to={`/support/${id}`}
            className={`nav-item ${activeNavTab === 'support' ? 'active' : ''}`}
            onClick={() => setActiveNavTab('support')}
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
            <h1 className="page-title">Help & Support Center</h1>
            <p className="page-subtitle">
              Get assistance with your issues, track tickets, and find answers
            </p>
          </div>

          <div className="topbar-right">
            <Link to={`/dashboard/${id}`} className="btn btn-primary">
              ← Back to Dashboard
            </Link>
          </div>
        </header>

        {/* Support Content */}
        <main className="dashboard-content">
          <div className="support-page">
            <div className="support-container">
              {/* Header */}
              <div className="support-header">
                <div className="header-content">
                  <div className="header-icon">
                    <FiHelpCircle />
                  </div>
                  <div>
                    <h1>Help & Support Center</h1>
                    <p className="header-subtitle">
                      Get assistance with your issues, track tickets, and find answers
                    </p>
                  </div>
                </div>
                <div className="header-stats">
                  <div className="stat-item">
                    <span className="stat-number">{issues.length}</span>
                    <span className="stat-label">Total Tickets</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">
                      {issues.filter(i => i.status === 'OPEN' || i.status === 'IN_PROGRESS').length}
                    </span>
                    <span className="stat-label">Active</span>
                  </div>
                </div>
              </div>

              {/* Chat Interface */}
              {selectedIssue ? (
                <div className="chat-interface-container">
                  <div className="chat-header-bar">
                    <button 
                      className="back-btn" 
                      onClick={() => {
                        setSelectedIssue(null);
                        fetchIssues();
                      }}
                    >
                      <FiArrowLeft /> Back to Tickets
                    </button>
                    <div className="chat-ticket-info">
                      <h3>Ticket #{selectedIssue.id}</h3>
                      <div className="ticket-meta">
                        <span className="ticket-subject">{selectedIssue.subject}</span>
                        <span 
                          className="status-badge" 
                          style={{ backgroundColor: getStatusColor(selectedIssue.status) }}
                        >
                          {selectedIssue.status}
                        </span>
                        <span className="ticket-date">
                          Created: {formatDate(selectedIssue.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="chat-window">
                    <div className="messages-container">
                      {/* Original Issue */}
                      <div className="message-bubble original">
                        <div className="message-header">
                          <div className="sender-info">
                            <FiUser className="sender-icon" />
                            <div>
                              <span className="sender-name">You</span>
                              <span className="message-time">
                                {selectedIssue.createdAt ? formatDate(selectedIssue.createdAt) : ''}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="message-content">
                          <p className="message-description">{selectedIssue.description}</p>
                          <div className="message-label">Original Issue</div>
                        </div>
                      </div>

                      {/* Chat Messages */}
                      {selectedIssue.messages?.map((msg) => (
                        <div 
                          key={msg.id} 
                          className={`message-bubble ${msg.senderRole === 'USER' ? 'user' : 'support'}`}
                        >
                          <div className="message-header">
                            <div className="sender-info">
                              {msg.senderRole === 'USER' ? (
                                <FiUser className="sender-icon" />
                              ) : (
                                <FiMessageSquare className="sender-icon support-icon" />
                              )}
                              <div>
                                <span className="sender-name">
                                  {msg.senderRole === 'USER' ? 'You' : msg.senderName || 'Support'}
                                </span>
                                <span className="message-time">
                                  {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  }) : ''}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="message-content">
                            <p>{msg.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {selectedIssue.status !== 'CLOSED' && selectedIssue.status !== 'RESOLVED' ? (
                      <div className="reply-section">
                        <div className="reply-input">
                          <input
                            type="text"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Type your reply here..."
                            onKeyPress={(e) => e.key === 'Enter' && sendReply()}
                          />
                          <button 
                            className="send-btn" 
                            onClick={sendReply}
                            disabled={!replyText.trim()}
                          >
                            <FiSend />
                          </button>
                        </div>
                        <p className="reply-hint">Press Enter to send</p>
                      </div>
                    ) : (
                      <div className="ticket-closed">
                        <FiCheckCircle />
                        <span>This ticket has been closed.</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Main Support Interface */
                <div className="support-layout">
                  {/* Left Column - Tickets */}
                  <div className="tickets-section">
                    <div className="section-header">
                      <div className="section-tabs">
                        <button
                          className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`}
                          onClick={() => setActiveTab('create')}
                        >
                          <FiMessageSquare /> New Ticket
                        </button>
                        <button
                          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                          onClick={() => setActiveTab('history')}
                        >
                          <FiClock /> Ticket History
                        </button>
                      </div>

                      {activeTab === 'history' && (
                        <div className="filters-section">
                          <div className="search-box">
                            <FiSearch />
                            <input
                              type="text"
                              placeholder="Search tickets..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                            />
                          </div>
                          <select
                            className="status-filter"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                          >
                            <option value="all">All Status</option>
                            <option value="open">Open</option>
                            <option value="in_progress">In Progress</option>
                            <option value="waiting_for_user">Waiting</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Create Ticket Form */}
                    {activeTab === 'create' && (
                      <div className="create-ticket-card glass-card">
                        <div className="card-header">
                          <h3>Create New Support Ticket</h3>
                          <p>Describe your issue in detail for faster resolution</p>
                        </div>
                        <form onSubmit={handleSubmit} className="ticket-form">
                          <div className="form-group">
                            <label>
                              <FiFileText /> Subject
                            </label>
                            <input
                              type="text"
                              value={subject}
                              onChange={(e) => setSubject(e.target.value)}
                              placeholder="Brief summary of your issue"
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label>
                              <FiMessageSquare /> Description
                            </label>
                            <textarea
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                              placeholder="Provide detailed information about your issue..."
                              rows="6"
                              required
                            />
                          </div>
                          <div className="form-tips">
                            <p><strong>Tips for better help:</strong></p>
                            <ul>
                              <li>Be specific about the problem</li>
                              <li>Include steps to reproduce</li>
                              <li>Add any error messages you received</li>
                            </ul>
                          </div>
                          <button
                            type="submit"
                            className="submit-btn"
                            disabled={creatingTicket}
                          >
                            {creatingTicket ? 'Creating...' : 'Submit Ticket'}
                          </button>
                        </form>
                      </div>
                    )}

                    {/* Ticket History */}
                    {activeTab === 'history' && (
                      <div className="tickets-list">
                        {filteredIssues.length === 0 ? (
                          <div className="empty-state glass-card">
                            <FiMessageSquare />
                            <p>No tickets found</p>
                            {searchTerm || statusFilter !== 'all' ? (
                              <button
                                className="clear-filters"
                                onClick={() => {
                                  setSearchTerm('');
                                  setStatusFilter('all');
                                }}
                              >
                                Clear filters
                              </button>
                            ) : (
                              <p className="empty-hint">Create your first support ticket to get started</p>
                            )}
                          </div>
                        ) : (
                          filteredIssues.map((issue) => (
                            <div
                              key={issue.id}
                              className="ticket-card glass-card"
                              onClick={() => openChat(issue.id)}
                            >
                              <div className="ticket-header">
                                <div className="ticket-info">
                                  <h4>#{issue.id} - {issue.subject}</h4>
                                  <span className="ticket-date">
                                    {formatDate(issue.createdAt)}
                                  </span>
                                </div>
                                <div
                                  className="status-badge"
                                  style={{ backgroundColor: getStatusColor(issue.status) }}
                                >
                                  {issue.status}
                                </div>
                              </div>
                              <p className="ticket-preview">
                                {issue.description?.substring(0, 120)}...
                              </p>
                              <div className="ticket-footer">
                                <span className="message-count">
                                  <FiMessageSquare /> {issue.messages?.length || 0} messages
                                </span>
                                <span className="view-chat">Click to view chat →</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right Column - FAQ */}
                  <div className="faq-section glass-card">
                    <div className="faq-header">
                      <h3>
                        <FiHelpCircle /> Frequently Asked Questions
                      </h3>
                      <p>Quick answers to common questions</p>
                    </div>
                    <div className="faq-list">
                      {faqs.map((faq, index) => (
                        <div
                          key={index}
                          className={`faq-item ${openFaqIndex === index ? 'open' : ''}`}
                        >
                          <button
                            className="faq-question"
                            onClick={() => toggleFaq(index)}
                          >
                            <div className="question-content">
                              {faq.icon}
                              <span>{faq.question}</span>
                            </div>
                            {openFaqIndex === index ? <FiChevronUp /> : <FiChevronDown />}
                          </button>
                          {openFaqIndex === index && (
                            <div className="faq-answer">
                              <p>{faq.answer}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="faq-footer">
                      <p>Still need help?</p>
                      <button
                        className="create-from-faq"
                        onClick={() => setActiveTab('create')}
                      >
                        Create a Support Ticket
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}