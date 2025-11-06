// src/components/RequestForm.js

import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import axios from "axios"; 
import "../css/RequestForm.css";
// सुनिश्चित करें कि यह कंपोनेंट आपके पास मौजूद है
import AddressAutocomplete from "./AddressAutocomplete"; 

// --- Constants ---
const customPhotoLabels = [
    "Top Side (Required)",
    "Bottom Side",
    "Front Side",
    "Back Side",
    "Side Wall", 
];

const API_BASE_URL = "http://localhost:8080"; 

// 💡 कंपोनेंट अब कोई props नहीं लेता है
export default function RequestForm() {
    
    // --- 1. HOOKS MUST BE CALLED FIRST (Unconditional) ---
    const navigate = useNavigate();
    
    // --- Get User Data and Initial Values ---
    // 💡 लोकल स्टोरेज से यूजर डेटा सुरक्षित रूप से प्राप्त करें
    const user = JSON.parse(localStorage.getItem('user'));
    
    // null या undefined से बचने के लिए Optional Chaining का उपयोग करें
    const initialAddress = user?.pickupAddress || ''; 
    
    // --- 2. STATE INITIALIZATION (Unconditional) ---
    const [type, setType] = useState('Recycling Pickup');
    const [description, setDescription] = useState('');
    const [pickupLocation, setPickupLocation] = useState(initialAddress); 
    const [files, setFiles] = useState([null, null, null, null, null]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    // --- 3. EARLY RETURN CHECK (AFTER ALL HOOKS) ---
    if (!user || !user.id) {
        return (
            <div className="request-form-card error-msg">
                ❌ Error: User data not found. Please log in again to submit a request.
            </div>
        );
    }
    
    // Assign userId after the check
    const userId = user.id; 
    
    // --- Handlers ---
    
    const handleAddressChange = (address) => {
        setPickupLocation(address);
        setMessage('');
    };

    const handleFileChange = (e, index) => {
        const selectedFile = e.target.files[0];
        const newFiles = [...files];
        newFiles[index] = selectedFile || null; 
        setFiles(newFiles);
        setMessage('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setLoading(true);

        const selectedFiles = files.filter(file => file !== null);
        
        // --- Client-Side Validation ---
        if (files[0] === null) {
             setMessage('❌ Top Side photo is required for submission.');
             setLoading(false);
             return;
        }
        
        if (!pickupLocation || pickupLocation.trim() === '') {
            setMessage('❌ Pickup location is required.');
            setLoading(false);
            return;
        }
        
        if (!description || description.trim() === '') {
            setMessage('❌ Item description is required.');
            setLoading(false);
            return;
        }

        // --- Data Preparation ---
        const formData = new FormData();
        formData.append('type', type);
        formData.append('description', description);
        formData.append('pickupLocation', pickupLocation);
        
        selectedFiles.forEach((file) => {
            formData.append('files', file); 
        });

        // --- API Call ---
        try {
            // 🔑 FIX: userId का उपयोग API पाथ में किया जाता है
            await axios.post(`${API_BASE_URL}/api/auth/user/${userId}/request`, formData);
            
            setMessage('✅ Request submitted successfully! We will schedule it soon.');
            
            // Clear fields and redirect
            setDescription(''); 
            setFiles([null, null, null, null, null]); 

            setTimeout(() => {
                navigate(`/profile/${userId}/history`);
            }, 1500);
            
        } catch (error) {
            // बेहतर त्रुटि संदेशों के लिए error.response का उपयोग करें
            const errorMessage = error.response?.data?.message || 'Failed to submit request. Check file size or server status.';
            setMessage(`❌ ${errorMessage}`);
            console.error('Request submission error:', error.response || error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="request-form-card">
            <h3>New Pickup/Dropoff Request</h3>
            <form onSubmit={handleSubmit}>
                
                <label>Request Type:</label>
                <select value={type} onChange={(e) => setType(e.target.value)} required>
                    <option>Recycling Pickup</option>
                    <option>E-Waste Dropoff (Need Info)</option>
                    <option>Bulk Collection</option>
                </select>

                <label>Description (Items, Quantity, etc.):</label>
                <textarea 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    placeholder="e.g., 2 old monitors, 1 keyboard, 5 kg of mixed plastics."
                    required
                />

                {/* Address Autocomplete Component का उपयोग */}
                <label>Pickup Location :</label>
                <AddressAutocomplete
                    initialValue={pickupLocation} 
                    onPlaceSelect={handleAddressChange}
                    placeholder="Search for pickup address..."
                />
                
                {/* 5 Photo Upload Fields */}
                <div className="photo-upload-section">
                    <label>Upload Photos (Max 5):</label>
                    <p className="photo-hint">Photos help us understand the size and type of the items.</p>
                    <div className="photo-inputs">
                        {files.map((file, index) => (
                            <div key={index} className="file-input-group">
                                <label htmlFor={`file-${index + 1}`}>
                                    {customPhotoLabels[index]} 
                                </label>
                                <input
                                    id={`file-${index + 1}`}
                                    type="file"
                                    accept="image/*"
                                    required={index === 0} 
                                    onChange={(e) => handleFileChange(e, index)}
                                />
                                {files[index] && <span className="file-name-display">{files[index].name}</span>}
                            </div>
                        ))}
                    </div>
                </div>
                
                <button type="submit" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit Request'}
                </button>
                
                {message && <p className={message.startsWith('✅') ? 'success-message' : 'error-message'}>{message}</p>}
            </form>
        </div>
    );
}