import React, { useState, useEffect } from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import "../css/Analytics.css";

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("month");
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);

  // Sample data
  const sampleData = {
    overview: {
      totalPickups: 245,
      completed: 198,
      pending: 32,
      cancelled: 15,
      totalRevenue: 12540,
      avgRating: 4.7
    },
    monthlyTrends: [
      { month: 'Jan', pickups: 180, revenue: 8900, completed: 165 },
      { month: 'Feb', pickups: 210, revenue: 10200, completed: 195 },
      { month: 'Mar', pickups: 245, revenue: 12540, completed: 198 },
      { month: 'Apr', pickups: 230, revenue: 11800, completed: 185 },
      { month: 'May', pickups: 280, revenue: 14200, completed: 235 },
      { month: 'Jun', pickups: 320, revenue: 16500, completed: 285 }
    ],
    categoryDistribution: [
      { name: 'Regular', value: 45, color: '#3B82F6' },
      { name: 'Bulk', value: 25, color: '#10B981' },
      { name: 'Urgent', value: 15, color: '#EF4444' },
      { name: 'Special', value: 10, color: '#8B5CF6' },
      { name: 'Other', value: 5, color: '#F59E0B' }
    ],
    pickupPerformance: [
      { name: 'John Smith', pickups: 85, rating: 4.8, efficiency: 95 },
      { name: 'Maria Garcia', pickups: 72, rating: 4.9, efficiency: 98 },
      { name: 'Raj Patel', pickups: 68, rating: 4.7, efficiency: 92 },
      { name: 'Alex Chen', pickups: 52, rating: 4.6, efficiency: 88 },
      { name: 'Sarah Wilson', pickups: 48, rating: 4.5, efficiency: 85 }
    ],
    hourlyDistribution: [
      { hour: '8 AM', pickups: 15 },
      { hour: '10 AM', pickups: 42 },
      { hour: '12 PM', pickups: 68 },
      { hour: '2 PM', pickups: 55 },
      { hour: '4 PM', pickups: 32 },
      { hour: '6 PM', pickups: 18 }
    ]
  };

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setAnalyticsData(sampleData);
      setLoading(false);
    }, 1500);
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="tooltip-value" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="analytics-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-container">
      {/* Header */}
      <div className="analytics-header">
        <div className="header-content">
          <h1>📊 Analytics Dashboard</h1>
          <p className="subtitle">Performance insights and metrics overview</p>
        </div>
        <div className="time-range-selector">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="range-select"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
          <button className="export-btn">
            <span className="export-icon">📥</span>
            Export Report
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="overview-stats">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#EFF6FF' }}>
            📦
          </div>
          <div className="stat-content">
            <span className="stat-number">{analyticsData.overview.totalPickups}</span>
            <span className="stat-label">Total Pickups</span>
            <span className="stat-trend positive">+12% from last month</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#ECFDF5' }}>
            ✅
          </div>
          <div className="stat-content">
            <span className="stat-number">{analyticsData.overview.completed}</span>
            <span className="stat-label">Completed</span>
            <span className="stat-trend positive">+8% from last month</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#FEF3C7' }}>
            💰
          </div>
          <div className="stat-content">
            <span className="stat-number">${analyticsData.overview.totalRevenue.toLocaleString()}</span>
            <span className="stat-label">Total Revenue</span>
            <span className="stat-trend positive">+15% from last month</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#F0F9FF' }}>
            ⭐
          </div>
          <div className="stat-content">
            <span className="stat-number">{analyticsData.overview.avgRating}</span>
            <span className="stat-label">Avg. Rating</span>
            <span className="stat-trend positive">+0.2 from last month</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Monthly Trends */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Monthly Trends</h3>
            <span className="chart-subtitle">Pickups & Revenue</span>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="pickups" 
                  stroke="#0b8457" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Pickups"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 4 }}
                  name="Revenue"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Category Distribution</h3>
            <span className="chart-subtitle">Pickup Types</span>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.categoryDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analyticsData.categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} pickups`, 'Count']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hourly Distribution */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Hourly Distribution</h3>
            <span className="chart-subtitle">Peak Pickup Hours</span>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.hourlyDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar 
                  dataKey="pickups" 
                  fill="#0b8457" 
                  radius={[4, 4, 0, 0]}
                  name="Pickups"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pickup Performance */}
        <div className="chart-card performance-table">
          <div className="chart-header">
            <h3>Top Performers</h3>
            <span className="chart-subtitle">Pickup Personnel</span>
          </div>
          <div className="table-container">
            <table className="performance-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Pickups</th>
                  <th>Rating</th>
                  <th>Efficiency</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.pickupPerformance.map((person, index) => (
                  <tr key={index}>
                    <td>
                      <div className="person-cell">
                        <div className="person-avatar">
                          {person.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span>{person.name}</span>
                      </div>
                    </td>
                    <td>{person.pickups}</td>
                    <td>
                      <div className="rating-cell">
                        <span className="rating-value">{person.rating}</span>
                        <div className="stars">
                          {'★'.repeat(Math.floor(person.rating))}
                          <span className="half-star">
                            {person.rating % 1 >= 0.5 ? '★' : ''}
                          </span>
                          {'☆'.repeat(5 - Math.ceil(person.rating))}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="efficiency-cell">
                        <div className="efficiency-bar">
                          <div 
                            className="efficiency-fill"
                            style={{ width: `${person.efficiency}%` }}
                          ></div>
                        </div>
                        <span className="efficiency-value">{person.efficiency}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${person.efficiency > 90 ? 'excellent' : 'good'}`}>
                        {person.efficiency > 90 ? 'Excellent' : 'Good'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Insights Section */}
      <div className="insights-section">
        <h3>📈 Key Insights</h3>
        <div className="insights-grid">
          <div className="insight-card">
            <div className="insight-icon">📊</div>
            <h4>Peak Performance</h4>
            <p>12 PM - 2 PM are the busiest hours with 123 pickups completed daily on average.</p>
          </div>
          <div className="insight-card">
            <div className="insight-icon">🚀</div>
            <h4>Efficiency Growth</h4>
            <p>Overall efficiency increased by 8% compared to last month, reaching 92% completion rate.</p>
          </div>
          <div className="insight-card">
            <div className="insight-icon">💰</div>
            <h4>Revenue Trend</h4>
            <p>Revenue shows consistent growth of 15% month-over-month, exceeding targets.</p>
          </div>
          <div className="insight-card">
            <div className="insight-icon">👥</div>
            <h4>Team Performance</h4>
            <p>Top 3 performers account for 45% of total completed pickups this month.</p>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="kpi-section">
        <h3>🎯 Key Performance Indicators</h3>
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-value">92%</div>
            <div className="kpi-label">On-time Delivery</div>
            <div className="kpi-change positive">+2%</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-value">4.8/5</div>
            <div className="kpi-label">Customer Satisfaction</div>
            <div className="kpi-change positive">+0.3</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-value">15 min</div>
            <div className="kpi-label">Avg. Response Time</div>
            <div className="kpi-change negative">-2 min</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-value">98%</div>
            <div className="kpi-label">Task Completion</div>
            <div className="kpi-change positive">+3%</div>
          </div>
        </div>
      </div>
    </div>
  );
}