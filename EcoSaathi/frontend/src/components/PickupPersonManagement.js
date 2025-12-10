import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/PickupPersonManagement.css';
import { 
  FaTruck,
  FaUserPlus,
  FaEdit,
  FaTrash,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaKey,
  FaCar,
  FaSync,
  FaSearch,
  FaFilter,
  FaCheckCircle,
  FaTimesCircle,
  FaIdCard
} from 'react-icons/fa';

const initialPerson = {
    name: '',
    phone: '',
    email: '',
    password: '',
    vehicleNumber: '', 
    vehicleType: ''    
};

export default function PickupPersonManagement({ API_BASE_URL }) {
    const [persons, setPersons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState(initialPerson);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterVehicle, setFilterVehicle] = useState('ALL');
    const [showSuccess, setShowSuccess] = useState(false);

    const API_URL = `${API_BASE_URL}/pickuppersons`;

    const fetchPersons = async () => {
        try {
            setLoading(true);
            const response = await axios.get(API_URL);
            setPersons(response.data);
        } catch (err) {
            console.error(err);
            setError("Failed to load pickup person data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { 
        fetchPersons(); 
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await axios.put(`${API_URL}/${editId}`, formData);
                setShowSuccess(`Pickup Person ${formData.name} updated successfully!`);
            } else {
                await axios.post(API_URL, formData);
                setShowSuccess(`Pickup Person ${formData.name} added successfully!`);
            }
            resetForm();
            fetchPersons();
            
            // Hide success message after 3 seconds
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (err) {
            alert(`Failed to save: ${err.response?.data?.message || err.message}`);
        }
    };

    const resetForm = () => {
        setFormData(initialPerson);
        setIsEditing(false);
        setEditId(null);
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
        try {
            await axios.delete(`${API_URL}/${id}`);
            setShowSuccess(`Pickup Person ${name} deleted successfully!`);
            fetchPersons();
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (err) { 
            alert("Failed to delete."); 
        }
    };

    const startEdit = (person) => {
        setFormData({
            name: person.name,
            phone: person.phone,
            email: person.email,
            password: '', // Don't fill password on edit for security
            vehicleNumber: person.vehicleNumber || '', 
            vehicleType: person.vehicleType || ''      
        });
        setEditId(person.id);
        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Filter persons based on search and vehicle type
    const filteredPersons = persons.filter(person => {
        const matchesSearch = searchTerm === '' || 
            person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            person.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            person.phone.includes(searchTerm) ||
            (person.vehicleNumber && person.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesVehicle = filterVehicle === 'ALL' || person.vehicleType === filterVehicle;
        
        return matchesSearch && matchesVehicle;
    });

    // Get vehicle type options from existing persons
    const vehicleTypes = ['ALL', ...new Set(persons.map(p => p.vehicleType).filter(Boolean))];

    if (loading) return (
        <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading pickup persons...</p>
        </div>
    );
    
    if (error) return (
        <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h3>Error Loading Data</h3>
            <p>{error}</p>
            <button className="retry-btn" onClick={fetchPersons}>
                <FaSync /> Retry
            </button>
        </div>
    );

    return (
        <div className="pickup-management-modern">
            {/* Success Message */}
            {showSuccess && (
                <div className="success-message">
                    <FaCheckCircle />
                    <span>{showSuccess}</span>
                    <button className="close-btn" onClick={() => setShowSuccess(false)}>
                        <FaTimesCircle />
                    </button>
                </div>
            )}

            {/* Stats Overview */}
            <div className="pm-stats-grid">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #3B82F6, #60A5FA)' }}>
                        <FaUser />
                    </div>
                    <div className="stat-content">
                        <h3>Total Persons</h3>
                        <div className="stat-value">{persons.length}</div>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10B981, #34D399)' }}>
                        <FaCar />
                    </div>
                    <div className="stat-content">
                        <h3>Active Vehicles</h3>
                        <div className="stat-value">
                            {persons.filter(p => p.vehicleType && p.vehicleNumber).length}
                        </div>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #8B5CF6, #A78BFA)' }}>
                        <FaTruck />
                    </div>
                    <div className="stat-content">
                        <h3>Without Vehicle</h3>
                        <div className="stat-value">
                            {persons.filter(p => !p.vehicleType || !p.vehicleNumber).length}
                        </div>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #F59E0B, #FBBF24)' }}>
                        <FaIdCard />
                    </div>
                    <div className="stat-content">
                        <h3>Pending Updates</h3>
                        <div className="stat-value">0</div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="pm-main-content">
                {/* Left Column - Form */}
                <div className="pm-left-column">
                    <div className="form-card-modern">
                        <div className="form-header">
                            <h3>
                                {isEditing ? (
                                    <>
                                        <FaEdit /> Edit Pickup Person
                                        <span className="edit-id">ID: {editId}</span>
                                    </>
                                ) : (
                                    <>
                                        <FaUserPlus /> Add New Pickup Person
                                    </>
                                )}
                            </h3>
                            {isEditing && (
                                <button className="cancel-action-btn" onClick={resetForm}>
                                    Cancel Edit
                                </button>
                            )}
                        </div>
                        
                        <form onSubmit={handleSubmit} className="modern-form">
                            <div className="form-grid">
                                {/* Basic Info */}
                                <div className="form-group">
                                    <label>
                                        <FaUser className="label-icon" />
                                        Full Name
                                    </label>
                                    <input 
                                        type="text" 
                                        name="name" 
                                        value={formData.name} 
                                        onChange={handleChange} 
                                        placeholder="Enter full name" 
                                        required 
                                        className="modern-input"
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label>
                                        <FaPhone className="label-icon" />
                                        Phone Number
                                    </label>
                                    <input 
                                        type="tel" 
                                        name="phone" 
                                        value={formData.phone} 
                                        onChange={handleChange} 
                                        placeholder="Enter phone number" 
                                        required 
                                        className="modern-input"
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label>
                                        <FaEnvelope className="label-icon" />
                                        Email Address
                                    </label>
                                    <input 
                                        type="email" 
                                        name="email" 
                                        value={formData.email} 
                                        onChange={handleChange} 
                                        placeholder="Enter email address" 
                                        className="modern-input"
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label>
                                        <FaKey className="label-icon" />
                                        {isEditing ? 'New Password (Optional)' : 'Password'}
                                    </label>
                                    <input 
                                        type="password" 
                                        name="password" 
                                        value={formData.password} 
                                        onChange={handleChange} 
                                        placeholder={isEditing ? "Enter new password if needed" : "Enter password"} 
                                        required={!isEditing}
                                        className="modern-input"
                                    />
                                </div>
                                
                                {/* Vehicle Info */}
                                <div className="form-group">
                                    <label>
                                        <FaCar className="label-icon" />
                                        Vehicle Number
                                    </label>
                                    <input 
                                        type="text" 
                                        name="vehicleNumber" 
                                        value={formData.vehicleNumber} 
                                        onChange={handleChange} 
                                        placeholder="e.g. MH-01-AB-1234" 
                                        className="modern-input"
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label>
                                        <FaTruck className="label-icon" />
                                        Vehicle Type
                                    </label>
                                    <select 
                                        name="vehicleType" 
                                        value={formData.vehicleType} 
                                        onChange={handleChange}
                                        className="modern-select"
                                    >
                                        <option value="">Select Vehicle Type</option>
                                        <option value="Bike">Bike</option>
                                        <option value="Scooter">Scooter</option>
                                        <option value="Tempo">Tempo / Van</option>
                                        <option value="Truck">Truck</option>
                                        <option value="Electric Vehicle">Electric Vehicle</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="form-actions">
                                <button type="submit" className="submit-btn">
                                    {isEditing ? (
                                        <>
                                            <FaEdit /> Update Details
                                        </>
                                    ) : (
                                        <>
                                            <FaUserPlus /> Add Pickup Person
                                        </>
                                    )}
                                </button>
                                
                                {isEditing && (
                                    <button type="button" onClick={resetForm} className="cancel-btn">
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* Right Column - List */}
                <div className="pm-right-column">
                    {/* Filters & Search */}
                    <div className="filters-card">
                        <div className="search-box">
                            <FaSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search by name, email, phone, or vehicle..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </div>
                        
                        <div className="filter-controls">
                            <div className="filter-group">
                                <label>
                                    <FaFilter className="filter-icon" />
                                    Filter by Vehicle Type
                                </label>
                                <div className="filter-buttons">
                                    {vehicleTypes.map(type => (
                                        <button
                                            key={type}
                                            className={`filter-btn ${filterVehicle === type ? 'active' : ''}`}
                                            onClick={() => setFilterVehicle(type)}
                                        >
                                            {type === 'ALL' ? 'All Types' : type}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="results-info">
                                <span className="count-badge">{filteredPersons.length}</span>
                                <span>pickup persons found</span>
                            </div>
                        </div>
                    </div>

                    {/* Persons List */}
                    <div className="persons-list-modern">
                        <div className="list-header">
                            <h3>Pickup Persons ({persons.length})</h3>
                        </div>
                        
                        <div className="persons-container">
                            {filteredPersons.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">👤</div>
                                    <h4>No pickup persons found</h4>
                                    <p>Try changing your filters or add a new person</p>
                                </div>
                            ) : (
                                filteredPersons.map(person => (
                                    <div key={person.id} className="person-card">
                                        <div className="person-card-header">
                                            <div className="person-avatar">
                                                <FaUser />
                                            </div>
                                            <div className="person-info">
                                                <h4>{person.name}</h4>
                                                <div className="person-id">ID: #{person.id}</div>
                                            </div>
                                            <div className="person-status">
                                                {person.vehicleType ? (
                                                    <span className="status-badge active">
                                                        <FaCar /> Active
                                                    </span>
                                                ) : (
                                                    <span className="status-badge inactive">
                                                        No Vehicle
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="person-card-body">
                                            <div className="contact-info">
                                                <div className="contact-item">
                                                    <FaPhone className="contact-icon" />
                                                    <span>{person.phone}</span>
                                                </div>
                                                {person.email && (
                                                    <div className="contact-item">
                                                        <FaEnvelope className="contact-icon" />
                                                        <span>{person.email}</span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {person.vehicleType && (
                                                <div className="vehicle-info">
                                                    <h5>
                                                        <FaTruck /> Vehicle Details
                                                    </h5>
                                                    <div className="vehicle-details">
                                                        <div className="vehicle-type">
                                                            <strong>Type:</strong> {person.vehicleType}
                                                        </div>
                                                        <div className="vehicle-number">
                                                            <strong>Number:</strong> {person.vehicleNumber}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="person-card-footer">
                                            <button 
                                                className="action-btn edit-btn"
                                                onClick={() => startEdit(person)}
                                            >
                                                <FaEdit /> Edit
                                            </button>
                                            <button 
                                                className="action-btn delete-btn"
                                                onClick={() => handleDelete(person.id, person.name)}
                                            >
                                                <FaTrash /> Delete
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}