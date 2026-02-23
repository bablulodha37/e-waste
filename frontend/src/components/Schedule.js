import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../css/Schedule.css";

const localizer = momentLocalizer(moment);

export default function Schedule() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [view, setView] = useState("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  // Sample data - in production, this would come from an API
  const sampleEvents = [
    {
      id: 1,
      title: "Downtown Pickup",
      start: new Date(2024, 2, 15, 9, 0),
      end: new Date(2024, 2, 15, 10, 0),
      pickupPerson: "John Smith",
      user: "Alice Johnson",
      location: "123 Main St, Downtown",
      type: "pickup",
      status: "scheduled"
    },
    {
      id: 2,
      title: "Westside Collection",
      start: new Date(2024, 2, 16, 14, 0),
      end: new Date(2024, 2, 16, 15, 30),
      pickupPerson: "Maria Garcia",
      user: "Bob Wilson",
      location: "456 Oak Ave, Westside",
      type: "collection",
      status: "confirmed"
    },
    {
      id: 3,
      title: "Bulk Waste Pickup",
      start: new Date(2024, 2, 18, 11, 0),
      end: new Date(2024, 2, 18, 12, 30),
      pickupPerson: "Raj Patel",
      user: "Carol Davis",
      location: "789 Pine Rd, Northside",
      type: "bulk",
      status: "pending"
    },
    {
      id: 4,
      title: "Urgent Pickup",
      start: new Date(2024, 2, 20, 16, 0),
      end: new Date(2024, 2, 20, 17, 0),
      pickupPerson: "Alex Chen",
      user: "David Miller",
      location: "321 Elm St, Eastend",
      type: "urgent",
      status: "in-progress"
    },
    {
      id: 5,
      title: "Regular Collection",
      start: new Date(2024, 2, 22, 10, 0),
      end: new Date(2024, 2, 22, 11, 0),
      pickupPerson: "Sarah Wilson",
      user: "Emma Brown",
      location: "654 Maple Dr, Southpark",
      type: "regular",
      status: "scheduled"
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setEvents(sampleEvents);
      setLoading(false);
    }, 1000);
  }, []);

  const eventStyleGetter = (event) => {
    const backgroundColor = {
      pickup: "#3B82F6",
      collection: "#10B981",
      bulk: "#F59E0B",
      urgent: "#EF4444",
      regular: "#8B5CF6"
    }[event.type] || "#6B7280";

    const style = {
      backgroundColor,
      borderRadius: "4px",
      opacity: 0.8,
      color: 'white',
      border: 'none',
      display: 'block'
    };
    return { style };
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
  };

  const handleSelectSlot = (slotInfo) => {
    // Handle creating new event
    console.log("Selected slot:", slotInfo);
  };

  const getStatusIcon = (status) => {
    const icons = {
      scheduled: "📅",
      confirmed: "✅",
      pending: "⏳",
      "in-progress": "🚚",
      completed: "🏁",
      cancelled: "❌"
    };
    return icons[status] || "📋";
  };

  const getEventCountByType = () => {
    const counts = { pickup: 0, collection: 0, bulk: 0, urgent: 0, regular: 0 };
    events.forEach(event => {
      if (counts[event.type] !== undefined) {
        counts[event.type]++;
      }
    });
    return counts;
  };

  if (loading) {
    return (
      <div className="schedule-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="schedule-container">
      {/* Header */}
      <div className="schedule-header">
        <div className="header-content">
          <h1>📅 Pickup Schedule</h1>
          <p className="subtitle">Manage and track all pickup appointments</p>
        </div>
        <div className="header-actions">
          <button className="add-event-btn">
            <span className="btn-icon">+</span>
            Add New Event
          </button>
          <div className="date-navigation">
            <button className="nav-btn" onClick={() => setCurrentDate(moment(currentDate).subtract(1, view).toDate())}>
              ←
            </button>
            <span className="current-date">
              {moment(currentDate).format(view === "month" ? "MMMM YYYY" : "MMM D, YYYY")}
            </span>
            <button className="nav-btn" onClick={() => setCurrentDate(moment(currentDate).add(1, view).toDate())}>
              →
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#EFF6FF' }}>
            📅
          </div>
          <div className="stat-content">
            <span className="stat-number">{events.length}</span>
            <span className="stat-label">Total Events</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#ECFDF5' }}>
            ✅
          </div>
          <div className="stat-content">
            <span className="stat-number">
              {events.filter(e => e.status === 'confirmed' || e.status === 'completed').length}
            </span>
            <span className="stat-label">Confirmed</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#FEF3C7' }}>
            ⏳
          </div>
          <div className="stat-content">
            <span className="stat-number">
              {events.filter(e => e.status === 'pending').length}
            </span>
            <span className="stat-label">Pending</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#FEF2F2' }}>
            🚚
          </div>
          <div className="stat-content">
            <span className="stat-number">
              {events.filter(e => e.status === 'in-progress').length}
            </span>
            <span className="stat-label">In Progress</span>
          </div>
        </div>
      </div>

      <div className="schedule-content">
        {/* Calendar View */}
        <div className="calendar-section">
          <div className="calendar-header">
            <div className="view-controls">
              <button 
                className={`view-btn ${view === "month" ? "active" : ""}`}
                onClick={() => setView("month")}
              >
                Month
              </button>
              <button 
                className={`view-btn ${view === "week" ? "active" : ""}`}
                onClick={() => setView("week")}
              >
                Week
              </button>
              <button 
                className={`view-btn ${view === "day" ? "active" : ""}`}
                onClick={() => setView("day")}
              >
                Day
              </button>
              <button 
                className={`view-btn ${view === "agenda" ? "active" : ""}`}
                onClick={() => setView("agenda")}
              >
                Agenda
              </button>
            </div>
            <div className="legend">
              <div className="legend-item">
                <span className="legend-color pickup"></span>
                <span>Pickup</span>
              </div>
              <div className="legend-item">
                <span className="legend-color collection"></span>
                <span>Collection</span>
              </div>
              <div className="legend-item">
                <span className="legend-color bulk"></span>
                <span>Bulk</span>
              </div>
              <div className="legend-item">
                <span className="legend-color urgent"></span>
                <span>Urgent</span>
              </div>
            </div>
          </div>
          
          <div className="calendar-wrapper">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 500 }}
              eventPropGetter={eventStyleGetter}
              onSelectEvent={handleSelectEvent}
              onSelectSlot={handleSelectSlot}
              selectable
              view={view}
              onView={setView}
              date={currentDate}
              onNavigate={setCurrentDate}
            />
          </div>
        </div>

        {/* Side Panel */}
        <div className="side-panel">
          {/* Event Details */}
          {selectedEvent ? (
            <div className="event-details">
              <h3>Event Details</h3>
              <div className="detail-card">
                <div className="detail-header">
                  <h4>{selectedEvent.title}</h4>
                  <span className="event-type">{selectedEvent.type}</span>
                </div>
                <div className="detail-content">
                  <div className="detail-row">
                    <span className="label">Status:</span>
                    <span className="value">
                      <span className="status-badge">
                        {getStatusIcon(selectedEvent.status)} {selectedEvent.status}
                      </span>
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Time:</span>
                    <span className="value">
                      {moment(selectedEvent.start).format("h:mm A")} - {moment(selectedEvent.end).format("h:mm A")}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Date:</span>
                    <span className="value">
                      {moment(selectedEvent.start).format("MMM D, YYYY")}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Pickup Person:</span>
                    <span className="value">{selectedEvent.pickupPerson}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Customer:</span>
                    <span className="value">{selectedEvent.user}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Location:</span>
                    <span className="value">{selectedEvent.location}</span>
                  </div>
                </div>
                <div className="detail-actions">
                  <button className="action-btn edit-btn">Edit Event</button>
                  <button className="action-btn cancel-btn">Cancel</button>
                  <button className="action-btn complete-btn">Mark Complete</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-event-selected">
              <div className="empty-icon">📅</div>
              <h4>No Event Selected</h4>
              <p>Click on an event to view details</p>
            </div>
          )}

          {/* Upcoming Events */}
          <div className="upcoming-events">
            <h3>Upcoming Events</h3>
            <div className="events-list">
              {events
                .filter(event => event.start > new Date())
                .sort((a, b) => a.start - b.start)
                .slice(0, 5)
                .map(event => (
                  <div 
                    key={event.id} 
                    className="event-item"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className="event-time">
                      {moment(event.start).format("h:mm A")}
                    </div>
                    <div className="event-info">
                      <div className="event-title">{event.title}</div>
                      <div className="event-location">{event.location}</div>
                    </div>
                    <div className="event-type-badge" style={{ 
                      backgroundColor: event.type === 'pickup' ? '#3B82F6' : 
                                    event.type === 'collection' ? '#10B981' :
                                    event.type === 'bulk' ? '#F59E0B' :
                                    event.type === 'urgent' ? '#EF4444' : '#8B5CF6'
                    }}>
                      {event.type.charAt(0).toUpperCase()}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}