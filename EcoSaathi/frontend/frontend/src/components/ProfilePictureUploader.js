import React, { useState } from "react";
import axios from "axios"; 
import { FaUserCircle, FaUpload } from "react-icons/fa";

// The base URL for the backend Spring Boot server
const API_BASE_URL = 'http://localhost:8080'; 

export default function ProfilePictureUploader({ userId, currentUrl, onUploadSuccess }) {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    //  Prepend API_BASE_URL to the relative image path
    const getFullImageUrl = () => {
        // If currentUrl exists AND starts with '/images/' (the path saved by the backend)
        if (currentUrl && currentUrl.startsWith('/images/')) {
            // Return the full path: http://localhost:8080/images/unique-name.jpg
            return `${API_BASE_URL}${currentUrl}`;
        }
        // Otherwise, return the URL as is (it might be a mock URL or null)
        return currentUrl;
    };
    
    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            alert("Please select a file first.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file); // Must match the backend @RequestParam("file")

        setLoading(true);
        setError(null);

        try {
            // Ensure the POST URL uses the correct /api/auth path
            await axios.post(`${API_BASE_URL}/api/auth/user/${userId}/profile-picture`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    // JWT header would go here too
                }
            });
            
            alert("Profile picture updated successfully!");
            setFile(null);
            onUploadSuccess(); // Re-fetch user details to update the image source
            
        } catch (err) {
            console.error("Upload Error:", err);
            setError("Failed to upload image. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile-picture-uploader">
            <div className="current-picture">
                {/*  Call the function to display the full image path */}
                {currentUrl ? (
                    <img src={getFullImageUrl()} alt="Profile" className="profile-img" /> 
                ) : (
                    <FaUserCircle className="default-profile-icon" />
                )}
            </div>
            
            <input 
                type="file" 
                onChange={handleFileChange} 
                accept="image/*"
                className="file-input"
            />
            
            {file && <p className="file-name">Selected: {file.name}</p>}
            
            <button 
                onClick={handleUpload} 
                disabled={!file || loading}
                className="upload-btn"
            >
                {loading ? "Uploading..." : <><FaUpload /> Upload Picture</>}
            </button>
            
            {error && <p className="error-text">{error}</p>}
        </div>
    );
}