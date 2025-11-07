// src/components/PickupPersonManagement.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';

// DTO-like object for a new pickup person
const initialPerson = {
    name: '',
    phone: '',
    email: ''
};

export default function PickupPersonManagement({ API_BASE_URL }) {
    const [persons, setPersons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState(initialPerson);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    const API_URL = `${API_BASE_URL}/pickuppersons`;

    // --- 1. Fetch All Pickup Persons ---
    const fetchPersons = async () => {
        try {
            const response = await axios.get(API_URL);
            setPersons(response.data);
        } catch (err) {
            console.error("Error fetching pickup persons:", err);
            setError("Failed to load pickup person data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPersons();
    }, []);

    // --- 2. Handle Form Input Changes ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // --- 3. Add or Update Handler ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                // PUT Request to Update
                await axios.put(`${API_URL}/${editId}`, formData);
                alert("Pickup Person updated successfully!");
            } else {
                // POST Request to Create
                await axios.post(API_URL, formData);
                alert("Pickup Person added successfully!");
            }
            // Clear form and refresh list
            setFormData(initialPerson);
            setIsEditing(false);
            setEditId(null);
            fetchPersons();
        } catch (err) {
            console.error("Error saving pickup person:", err);
            alert(`Failed to save pickup person: ${err.response?.data?.message || err.message}`);
        }
    };

    // --- 4. Delete Handler ---
    const handleDelete = async (id) => {
        if (!window.confirm(`Are you sure you want to delete Pickup Person ID ${id}?`)) return;
        try {
            await axios.delete(`${API_URL}/${id}`);
            alert(`Pickup Person ID ${id} deleted.`);
            fetchPersons();
        } catch (err) {
            console.error("Error deleting pickup person:", err);
            alert("Failed to delete pickup person.");
        }
    };

    // --- 5. Edit Initialization ---
    const startEdit = (person) => {
        setFormData({ name: person.name, phone: person.phone, email: person.email });
        setEditId(person.id);
        setIsEditing(true);
    };

    if (loading) return <div>Loading Pickup Persons...</div>;
    if (error) return <div className="error-msg">{error}</div>;

    return (
        <div className="pickup-person-management-section">
            <h3>Pickup Person Management</h3>

            {/* Form for Add/Edit */}
            <div className="form-card">
                <h4>{isEditing ? `Edit Person ID: ${editId}` : 'Add New Pickup Person'}</h4>
                <form onSubmit={handleSubmit}>
                    <input 
                        type="text" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleChange} 
                        placeholder="Name" 
                        required 
                    />
                    <input 
                        type="text" 
                        name="phone" 
                        value={formData.phone} 
                        onChange={handleChange} 
                        placeholder="Phone" 
                        required 
                    />
                    <input 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        placeholder="Email (Optional)" 
                    />
                    <button type="submit">
                        {isEditing ? 'Update Person' : 'Add Person'}
                    </button>
                    {isEditing && (
                        <button 
                            type="button" 
                            onClick={() => {
                                setIsEditing(false);
                                setEditId(null);
                                setFormData(initialPerson);
                            }}
                            className="cancel-btn"
                        >
                            Cancel Edit
                        </button>
                    )}
                </form>
            </div>
            
            {/* List of Persons */}
            <div className="persons-list">
                <h4>Existing Pickup Persons ({persons.length})</h4>
                <table className="user-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Phone</th>
                            <th>Email</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {persons.map((person) => (
                            <tr key={person.id}>
                                <td>{person.id}</td>
                                <td>{person.name}</td>
                                <td>{person.phone}</td>
                                <td>{person.email}</td>
                                <td>
                                    <button className="edit-btn" onClick={() => startEdit(person)}>Edit</button>
                                    <button className="delete-btn" onClick={() => handleDelete(person.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}