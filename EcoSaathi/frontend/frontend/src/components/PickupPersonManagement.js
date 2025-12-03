import React, { useState, useEffect } from 'react';
import axios from 'axios';

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

    // Assuming API_BASE_URL is passed as http://localhost:8080/api/admin
    const API_URL = `${API_BASE_URL}/pickuppersons`;

    const fetchPersons = async () => {
        try {
            const response = await axios.get(API_URL);
            setPersons(response.data);
        } catch (err) {
            console.error(err);
            setError("Failed to load pickup person data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPersons(); }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await axios.put(`${API_URL}/${editId}`, formData);
                alert("Pickup Person updated successfully!");
            } else {
                await axios.post(API_URL, formData);
                alert("Pickup Person added successfully!");
            }
            setFormData(initialPerson);
            setIsEditing(false);
            setEditId(null);
            fetchPersons();
        } catch (err) {
            alert(`Failed to save: ${err.response?.data?.message || err.message}`);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm(`Are you sure you want to delete Pickup Person ID ${id}?`)) return;
        try {
            await axios.delete(`${API_URL}/${id}`);
            fetchPersons();
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
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="error-msg">{error}</div>;

    return (
        <div className="pickup-person-management-section">
            <h3>Pickup Person & Vehicle Management</h3>

            {/* FORM CARD */}
            <div className="form-card">
                <h4>{isEditing ? `Edit Person ID: ${editId}` : 'Add New Pickup Person'}</h4>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    
                    <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Name" required />
                    
                    <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" required />
                    
                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" />
                    
                    <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder={isEditing ? "New Password (Optional)" : "Password"} required={!isEditing} />
                    
                    {/* Vehicle Details */}
                    <input type="text" name="vehicleNumber" value={formData.vehicleNumber} onChange={handleChange} placeholder="Vehicle No. (e.g. MH-01-AB-1234)" />
                    
                    <select name="vehicleType" value={formData.vehicleType} onChange={handleChange} style={{padding: '10px', borderRadius:'5px', border:'1px solid #ccc'}}>
                        <option value="">-- Select Vehicle Type --</option>
                        <option value="Bike">Bike</option>
                        <option value="Scooter">Scooter</option>
                        <option value="Tempo">Tempo / Van</option>
                        <option value="Truck">Truck</option>
                        <option value="Electric Vehicle">Electric Vehicle</option>
                    </select>

                    <div style={{ gridColumn: 'span 2', display:'flex', gap:'10px' }}>
                        <button type="submit" style={{flex:1}}>{isEditing ? 'Update Details' : 'Add Person'}</button>
                        {isEditing && (
                            <button type="button" onClick={() => { setIsEditing(false); setFormData(initialPerson); }} className="cancel-btn">
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* LIST TABLE */}
            <div className="persons-list" style={{marginTop:'20px'}}>
                <table className="user-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Phone</th>
                            <th>Vehicle</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {persons.map((p) => (
                            <tr key={p.id}>
                                <td>{p.id}</td>
                                <td>
                                    <strong>{p.name}</strong><br/>
                                    <small>{p.email}</small>
                                </td>
                                <td>{p.phone}</td>
                                <td>
                                    {p.vehicleType || "N/A"} <br/>
                                    <small style={{color:'#666'}}>{p.vehicleNumber}</small>
                                </td>
                                <td>
                                    <button className="edit-btn" onClick={() => startEdit(p)}>Edit</button>
                                    <button className="delete-btn" onClick={() => handleDelete(p.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}