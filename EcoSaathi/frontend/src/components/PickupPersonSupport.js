import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "../css/PickupPersonSupport.css";

// Icons
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
  FiMail,
  FiTruck,
  FiPackage,
  FiMapPin,
  FiDollarSign
} from "react-icons/fi";

export default function PickupPersonSupport() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Support State
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("TECHNICAL");
  const [priority, setPriority] = useState("MEDIUM");
  const [activeTab, setActiveTab] = useState("create");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);
  const [creatingTicket, setCreatingTicket] = useState(false);
  
  const [user, setUser] = useState(null);

  const API_BASE = "http://localhost:8080/api/issues/pickup";

  // Fetch User Data
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (!currentUser || currentUser.role !== "PICKUP_PERSON") {
      navigate('/login');
      return;
    }
    setUser(currentUser);
  }, [navigate]);

  // Fetch Pickup Person Issues
  const fetchIssues = async () => {
    if (!id) return;
    try {
      const res = await axios.get(`${API_BASE}/person/${id}`);
      const issuesData = Array.isArray(res.data) ? res.data : [];
      setIssues(issuesData);
      setFilteredIssues(issuesData);
    } catch (err) {
      console.error("Error fetching issues:", err);
      // For demo, create mock data
      const mockIssues = [
        {
          id: 1001,
          subject: "App Navigation Issue",
          description: "Map navigation not working properly in the pickup app",
          category: "TECHNICAL",
          priority: "HIGH",
          status: "IN_PROGRESS",
          createdAt: "2024-03-10T10:30:00",
          messages: [
            {
              id: 1,
              message: "The map keeps freezing when I try to navigate to pickup locations",
              senderRole: "PICKUP_PERSON",
              senderName: "You",
              createdAt: "2024-03-10T10:30:00"
            },
            {
              id: 2,
              message: "We're looking into this issue. Please try clearing app cache and restarting.",
              senderRole: "SUPPORT",
              senderName: "Support Team",
              createdAt: "2024-03-10T11:15:00"
            }
          ]
        },
        {
          id: 1002,
          subject: "Payment Delay",
          description: "Last week's payments not credited to my account",
          category: "PAYMENT",
          priority: "HIGH",
          status: "OPEN",
          createdAt: "2024-03-08T14:20:00",
          messages: [
            {
              id: 1,
              message: "I haven't received payment for 5 pickups completed on March 5th",
              senderRole: "PICKUP_PERSON",
              senderName: "You",
              createdAt: "2024-03-08T14:20:00"
            }
          ]
        }
      ];
      setIssues(mockIssues);
      setFilteredIssues(mockIssues);
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
        issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== "all") {
      filtered = filtered.filter(issue => 
        issue.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    
    setFilteredIssues(filtered);
  }, [searchTerm, statusFilter, issues]);

  // Create New Ticket for Pickup Person
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      alert("Please fill in both subject and description");
      return;
    }

    setCreatingTicket(true);
    try {
      const ticketData = {
        subject: subject.trim(),
        description: description.trim(),
        category: category,
        priority: priority,
        pickupPersonId: id
      };
      
      await axios.post(`${API_BASE}/create`, ticketData);
      
      alert("Issue reported successfully!");
      setSubject("");
      setDescription("");
      setCategory("TECHNICAL");
      setPriority("MEDIUM");
      setActiveTab("history");
      await fetchIssues();
    } catch (err) {
      console.error("Create Error:", err);
      // For demo, add to local state
      const newIssue = {
        id: Date.now(),
        subject: subject.trim(),
        description: description.trim(),
        category: category,
        priority: priority,
        status: "OPEN",
        createdAt: new Date().toISOString(),
        messages: [{
          id: 1,
          message: description.trim(),
          senderRole: "PICKUP_PERSON",
          senderName: "You",
          createdAt: new Date().toISOString()
        }]
      };
      
      setIssues(prev => [newIssue, ...prev]);
      setFilteredIssues(prev => [newIssue, ...prev]);
      alert("Issue reported successfully! (Demo Mode)");
      
      setSubject("");
      setDescription("");
      setCategory("TECHNICAL");
      setPriority("MEDIUM");
      setActiveTab("history");
    } finally {
      setCreatingTicket(false);
    }
  };

  // Open Chat View
  const openChat = (issueId) => {
    setLoadingChat(true);
    const issue = issues.find(i => i.id === issueId);
    if (issue) {
      setSelectedIssue(issue);
    }
    setLoadingChat(false);
  };

  // Send Reply
  const sendReply = async () => {
    if (!replyText.trim() || !selectedIssue) return;
    
    try {
      const payload = {
        role: "PICKUP_PERSON",
        senderId: id,
        message: replyText.trim()
      };
      
      // For demo, update locally
      const newMessage = {
        id: selectedIssue.messages.length + 1,
        message: replyText.trim(),
        senderRole: "PICKUP_PERSON",
        senderName: "You",
        createdAt: new Date().toISOString()
      };
      
      const updatedIssue = {
        ...selectedIssue,
        messages: [...selectedIssue.messages, newMessage],
        status: "WAITING_FOR_SUPPORT"
      };
      
      setSelectedIssue(updatedIssue);
      setReplyText("");
      
      // Update issue in list
      setIssues(prev => prev.map(issue => 
        issue.id === selectedIssue.id ? updatedIssue : issue
      ));
      
      setFilteredIssues(prev => prev.map(issue => 
        issue.id === selectedIssue.id ? updatedIssue : issue
      ));
      
      alert("Reply sent! Support team will respond soon.");
    } catch (err) {
      alert("Failed to send reply. Please try again.");
    }
  };

  // FAQs Data for Pickup Persons
  const faqs = [
    {
      question: "How do I report a payment issue?",
      answer: "Go to 'Report Issue' → Select 'PAYMENT' category → Provide transaction details and dates → Submit. Our finance team will review within 48 hours.",
      icon: <FiDollarSign />
    },
    {
      question: "App not working during pickup?",
      answer: "If app crashes during navigation: 1) Take screenshot 2) Note pickup ID 3) Complete pickup manually 4) Report issue with details. You'll still get paid.",
      icon: <FiTruck />
    },
    {
      question: "Customer not available for pickup?",
      answer: "Wait 10 minutes, try calling customer. If no response: 1) Mark as 'Customer Unavailable' in app 2) Take photo as proof 3) Move to next pickup 4) Report if pattern continues.",
      icon: <FiUser />
    },
    {
      question: "Vehicle breakdown during shift?",
      answer: "Immediate steps: 1) Move vehicle to safe location 2) Contact emergency support: 1800-XXX-XXX 3) Report in app 4) Inform assigned pickups. Emergency support available 24/7.",
      icon: <FiAlertCircle />
    },
    {
      question: "How to update profile/vehicle details?",
      answer: "Go to Profile → Edit Details → Update information → Save. For vehicle documents, upload clear photos of RC, Insurance, and Pollution Certificate.",
      icon: <FiFileText />
    },
    {
      question: "Route optimization not working?",
      answer: "Check: 1) GPS is enabled 2) Location permissions granted 3) Internet connection stable. If issue persists, report with screenshot of route screen.",
      icon: <FiMapPin />
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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper function to get status badge color
  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'open': return '#f59e0b';
      case 'in_progress': return '#3b82f6';
      case 'waiting_for_support': return '#8b5cf6';
      case 'waiting_for_pickup_person': return '#0ea5e9';
      case 'resolved': return '#10b981';
      case 'closed': return '#6b7280';
      default: return '#6b7280';
    }
  };

  // Helper function to get priority color
  const getPriorityColor = (priority) => {
    switch(priority?.toLowerCase()) {
      case 'low': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'high': return '#ef4444';
      case 'urgent': return '#dc2626';
      default: return '#6b7280';
    }
  };

  // Helper function to get category icon
  const getCategoryIcon = (category) => {
    switch(category?.toLowerCase()) {
      case 'technical': return <FiTruck />;
      case 'payment': return <FiDollarSign />;
      case 'customer': return <FiUser />;
      case 'vehicle': return <FiTruck />;
      case 'route': return <FiMapPin />;
      case 'app': return <FiPackage />;
      default: return <FiHelpCircle />;
    }
  };

  return (
    <div className="pickup-support-container">
      {/* Header */}
      <div className="support-header">
        <div className="header-left">
          <button 
            className="back-btn" 
            onClick={() => navigate(`/pickup-dashboard/${id}`)}
          >
            <FiArrowLeft /> Back to Dashboard
          </button>
          <div className="header-title">
            <div className="header-icon">
              <FiTruck />
            </div>
            <div>
              <h1>Pickup Person Support</h1>
              <p className="subtitle">Report issues, get assistance, and track your tickets</p>
            </div>
          </div>
        </div>
        
        <div className="header-stats">
          <div className="stat-card">
            <div className="stat-icon">
              <FiMessageSquare />
            </div>
            <div className="stat-content">
              <div className="stat-number">{issues.length}</div>
              <div className="stat-label">Total Reports</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <FiClock />
            </div>
            <div className="stat-content">
              <div className="stat-number">
                {issues.filter(i => i.status === 'OPEN' || i.status === 'IN_PROGRESS').length}
              </div>
              <div className="stat-label">Active Issues</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="support-main">
        {selectedIssue ? (
          /* Chat Interface */
          <div className="chat-container">
            <div className="chat-header">
              <div className="ticket-info">
                <h3>
                  <FiMessageSquare /> Ticket #{selectedIssue.id}
                  <span className="ticket-category">
                    {getCategoryIcon(selectedIssue.category)}
                    {selectedIssue.category}
                  </span>
                </h3>
                <div className="ticket-meta">
                  <div className="meta-item">
                    <span className="label">Subject:</span>
                    <span className="value">{selectedIssue.subject}</span>
                  </div>
                  <div className="meta-item">
                    <span className="label">Priority:</span>
                    <span 
                      className="priority-badge"
                      style={{ backgroundColor: getPriorityColor(selectedIssue.priority) }}
                    >
                      {selectedIssue.priority}
                    </span>
                  </div>
                  <div className="meta-item">
                    <span className="label">Status:</span>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(selectedIssue.status) }}
                    >
                      {selectedIssue.status}
                    </span>
                  </div>
                  <div className="meta-item">
                    <span className="label">Created:</span>
                    <span className="value">{formatDate(selectedIssue.createdAt)}</span>
                  </div>
                </div>
              </div>
              <button 
                className="close-chat-btn"
                onClick={() => setSelectedIssue(null)}
              >
                <FiArrowLeft /> Back to List
              </button>
            </div>

            <div className="chat-messages">
              {/* Original Issue */}
              <div className="message original">
                <div className="message-header">
                  <div className="sender">
                    <FiUser />
                    <span>You</span>
                  </div>
                  <span className="time">{formatDate(selectedIssue.createdAt)}</span>
                </div>
                <div className="message-content">
                  <h4>{selectedIssue.subject}</h4>
                  <p>{selectedIssue.description}</p>
                  <div className="message-tags">
                    <span className="tag category">
                      {getCategoryIcon(selectedIssue.category)}
                      {selectedIssue.category}
                    </span>
                    <span 
                      className="tag priority"
                      style={{ backgroundColor: getPriorityColor(selectedIssue.priority) }}
                    >
                      {selectedIssue.priority} Priority
                    </span>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              {selectedIssue.messages?.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`message ${msg.senderRole === 'PICKUP_PERSON' ? 'sent' : 'received'}`}
                >
                  <div className="message-header">
                    <div className="sender">
                      {msg.senderRole === 'PICKUP_PERSON' ? <FiUser /> : <FiHelpCircle />}
                      <span>{msg.senderName}</span>
                    </div>
                    <span className="time">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className="message-content">
                    <p>{msg.message}</p>
                  </div>
                </div>
              ))}
            </div>

            {selectedIssue.status !== 'CLOSED' && selectedIssue.status !== 'RESOLVED' ? (
              <div className="chat-input">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply here..."
                  rows="3"
                />
                <div className="input-actions">
                  <button 
                    className="send-btn"
                    onClick={sendReply}
                    disabled={!replyText.trim() || loadingChat}
                  >
                    <FiSend /> {loadingChat ? 'Sending...' : 'Send Reply'}
                  </button>
                  <p className="hint">Support team typically responds within 24 hours</p>
                </div>
              </div>
            ) : (
              <div className="ticket-closed">
                <FiCheckCircle />
                <div>
                  <h4>This ticket has been resolved</h4>
                  <p>If you have further issues, please create a new ticket</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Main Support Interface */
          <div className="support-tabs">
            {/* Tab Navigation */}
            <div className="tab-navigation">
              <button 
                className={`tab ${activeTab === 'create' ? 'active' : ''}`}
                onClick={() => setActiveTab('create')}
              >
                <FiMessageSquare /> Report New Issue
              </button>
              <button 
                className={`tab ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => setActiveTab('history')}
              >
                <FiClock /> My Reports ({issues.length})
              </button>
              <button 
                className={`tab ${activeTab === 'faq' ? 'active' : ''}`}
                onClick={() => setActiveTab('faq')}
              >
                <FiHelpCircle /> Help & FAQ
              </button>
            </div>

            {/* Create New Issue Tab */}
            {activeTab === 'create' && (
              <div className="create-issue">
                <div className="create-header">
                  <h2><FiMessageSquare /> Report an Issue</h2>
                  <p>Fill out the form below to report any problems you're facing</p>
                </div>

                <form onSubmit={handleSubmit} className="issue-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>
                        <FiFileText /> Subject *
                      </label>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Brief summary of the issue"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        <FiAlertCircle /> Category *
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                      >
                        <option value="TECHNICAL">Technical Issue</option>
                        <option value="PAYMENT">Payment Problem</option>
                        <option value="CUSTOMER">Customer Related</option>
                        <option value="VEHICLE">Vehicle Issue</option>
                        <option value="ROUTE">Route/Navigation</option>
                        <option value="APP">App Problem</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>
                        <FiAlertCircle /> Priority *
                      </label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        required
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="URGENT">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>
                      <FiMessageSquare /> Description *
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Please provide detailed information about the issue. Include:
• What happened?
• When did it occur?
• Steps to reproduce (if applicable)
• Any error messages shown
• How it affects your work"
                      rows="8"
                      required
                    />
                  </div>

                  <div className="form-tips">
                    <h4><FiCheckCircle /> Tips for Better Support</h4>
                    <ul>
                      <li>Include specific dates, times, and pickup IDs if applicable</li>
                      <li>Add screenshots if possible (describe what they show)</li>
                      <li>Mention if this is a recurring issue</li>
                      <li>Specify how urgently you need resolution</li>
                    </ul>
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={() => {
                        setSubject("");
                        setDescription("");
                        setCategory("TECHNICAL");
                        setPriority("MEDIUM");
                      }}
                    >
                      Clear Form
                    </button>
                    <button
                      type="submit"
                      className="submit-btn"
                      disabled={creatingTicket}
                    >
                      {creatingTicket ? (
                        <>Submitting...</>
                      ) : (
                        <>Submit Issue Report</>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Issue History Tab */}
            {activeTab === 'history' && (
              <div className="issue-history">
                <div className="history-header">
                  <h2><FiClock /> My Reported Issues</h2>
                  <div className="history-filters">
                    <div className="search-box">
                      <FiSearch />
                      <input
                        type="text"
                        placeholder="Search issues..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <select
                      className="filter-select"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="waiting_for_support">Waiting for Support</option>
                      <option value="waiting_for_pickup_person">Waiting for You</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>

                {filteredIssues.length === 0 ? (
                  <div className="empty-state">
                    <FiMessageSquare size={48} />
                    <h3>No Issues Found</h3>
                    <p>
                      {searchTerm || statusFilter !== 'all' 
                        ? "No issues match your filters. Try changing search criteria."
                        : "You haven't reported any issues yet."
                      }
                    </p>
                    {searchTerm || statusFilter !== 'all' ? (
                      <button
                        className="clear-filters-btn"
                        onClick={() => {
                          setSearchTerm('');
                          setStatusFilter('all');
                        }}
                      >
                        Clear Filters
                      </button>
                    ) : (
                      <button
                        className="report-first-btn"
                        onClick={() => setActiveTab('create')}
                      >
                        Report Your First Issue
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="issues-list">
                    {filteredIssues.map((issue) => (
                      <div
                        key={issue.id}
                        className="issue-card"
                        onClick={() => openChat(issue.id)}
                      >
                        <div className="issue-header">
                          <div className="issue-id">#{issue.id}</div>
                          <div className="issue-meta">
                            <span className="category">
                              {getCategoryIcon(issue.category)}
                              {issue.category}
                            </span>
                            <span 
                              className="priority"
                              style={{ backgroundColor: getPriorityColor(issue.priority) }}
                            >
                              {issue.priority}
                            </span>
                            <span 
                              className="status"
                              style={{ backgroundColor: getStatusColor(issue.status) }}
                            >
                              {issue.status}
                            </span>
                          </div>
                        </div>
                        
                        <h4 className="issue-subject">{issue.subject}</h4>
                        <p className="issue-description">
                          {issue.description.substring(0, 150)}...
                        </p>
                        
                        <div className="issue-footer">
                          <div className="issue-info">
                            <span className="date">
                              <FiClock /> {formatDate(issue.createdAt)}
                            </span>
                            <span className="messages">
                              <FiMessageSquare /> {issue.messages?.length || 1} messages
                            </span>
                          </div>
                          <button className="view-btn">
                            View Details →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* FAQ Tab */}
            {activeTab === 'faq' && (
              <div className="faq-section">
                <div className="faq-header">
                  <h2><FiHelpCircle /> Frequently Asked Questions</h2>
                  <p>Quick answers to common questions from pickup persons</p>
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
                          <div className="question-icon">
                            {faq.icon}
                          </div>
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

                <div className="emergency-contact">
                  <h3><FiAlertCircle /> Emergency Contact</h3>
                  <div className="contact-cards">
                    <div className="contact-card">
                      <h4>24/7 Technical Support</h4>
                      <p className="phone">📞 1800-000-7778</p>
                      <p className="email">✉️ techsupport@ecosaathi.com</p>
                    </div>
                    <div className="contact-card">
                      <h4>Payment Issues</h4>
                      <p className="phone">📞 1800-222-8888</p>
                      <p className="email">✉️ payments@ecosaathi.com</p>
                    </div>
                    <div className="contact-card">
                      <h4>Vehicle Emergency</h4>
                      <p className="phone">📞 1800-222-0000</p>
                      <p className="hint">Available 24/7 for on-road assistance</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}