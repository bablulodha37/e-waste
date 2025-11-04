// src/components/RequestForm.js

import React, { useState } from "react";
import axios from "axios"; 
import "../css/RequestForm.css";
import AddressAutocomplete from "./AddressAutocomplete";
const customPhotoLabels = [
    "Top Side (Required)",
    "Bottom Side",
    "Front Side",
    "Back Side",
    "Side Wall", 
];

const API_BASE_URL = "http://localhost:8080"; 

export default function RequestForm({ userId, defaultAddress }) {
    const [type, setType] = useState('Recycling Pickup');
    const [description, setDescription] = useState('');
    //  defaultAddress का उपयोग करें और इसे Autocomplete कंपोनेंट को पास करें
    const [pickupLocation, setPickupLocation] = useState(defaultAddress || ''); 
    
    // 5 फ़ाइल इनपुट को ट्रैक करने के लिए
    const [files, setFiles] = useState([null, null, null, null, null]);
    
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    //  AddressAutocomplete से चुना गया पता प्राप्त करने का फ़ंक्शन
    const handleAddressChange = (address) => {
        setPickupLocation(address);
    };

    //  फ़ाइल बदलने पर फ़ाइल को संभालता है 
    const handleFileChange = (e, index) => {
        const newFiles = [...files];
        newFiles[index] = e.target.files[0]; 
        setFiles(newFiles);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setLoading(true);

        const selectedFiles = files.filter(file => file !== null);
        
        if (selectedFiles.length === 0) {
            setMessage('❌ Please upload at least one photo.');
            setLoading(false);
            return;
        }
        
    
        if (!pickupLocation || pickupLocation.trim() === '') {
            setMessage('❌ Pickup location is required.');
            setLoading(false);
            return;
        }

        const formData = new FormData();
        
        // 1. Request details
        formData.append('type', type);
        formData.append('description', description);
        formData.append('pickupLocation', pickupLocation); //  Autocomplete से आया हुआ पता
        
        // 2. Files
        selectedFiles.forEach((file) => {
            // 'files' key backend @RequestParam("files") से मेल खाना चाहिए
            formData.append('files', file); 
        });


        try {
            await axios.post(`${API_BASE_URL}/api/auth/user/${userId}/request`, formData);
            
            setMessage('Request submitted successfully with photos! We will schedule it soon.');
            setDescription(''); 
            setFiles([null, null, null, null, null]); // File state रीसेट करें
            // setPickupLocation(defaultAddress); // Address को डिफ़ॉल्ट पर रीसेट कर सकते हैं
            
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to submit request. Check file size or server status.';
            setMessage(`❌ ${errorMessage}`);
            console.error('Request submission error:', error);
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
                    initialValue={defaultAddress || pickupLocation}
                    onPlaceSelect={handleAddressChange}
                    placeholder="Search for pickup address..."
                />
                
                {/*  5 Photo Upload Fields */}
                <div className="photo-upload-section">
                    <label>Upload Photos (Max 5):</label>
                    <p className="photo-hint">Photos help us understand the size and type of the items.</p>
                    <div className="photo-inputs">
                        {/* 5 फ़ाइल इनपुट फ़ील्ड्स को लूप करें */}
                        {files.map((file, index) => (
                            <div key={index} className="file-input-group">
    {/* 👇️ यहाँ बदलाव किया गया है */}
    <label htmlFor={`file-${index + 1}`}>
        {customPhotoLabels[index]} 
        {/* अगर customPhotoLabels में उस index पर कोई नाम नहीं है, तो एक डिफ़ॉल्ट नाम दिखाएँ */}
        {/* उदाहरण: customPhotoLabels[index] || `Photo ${index + 1}` */}
    </label>
    <input
        id={`file-${index + 1}`}
        type="file"
        accept="image/*"
        // पहली फ़ाइल अनिवार्य (required) है
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
                
                {message && <p className={message.startsWith('✅') ? 'success-msg' : 'error-msg'}>{message}</p>}
            </form>
        </div>
    );
}