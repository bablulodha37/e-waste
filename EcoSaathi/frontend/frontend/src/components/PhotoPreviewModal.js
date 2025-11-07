// src/components/PhotoPreviewModal.js

import React, { useState, useEffect } from 'react';
import '../css/PhotoPreviewModal.css';

export default function PhotoPreviewModal({ imageUrl, onClose }) {
    
    // Zoom state: 1.0 means original size, 1.5 means 50% zoomed in, etc.
    const [zoomLevel, setZoomLevel] = useState(1.0);
    
    // Reset zoom when image changes
    useEffect(() => {
        setZoomLevel(1.0);
    }, [imageUrl]);

    if (!imageUrl) return null; // Don't render if no image URL is provided

    const handleZoomIn = () => {
        // Max zoom limit
        setZoomLevel(prev => Math.min(prev + 0.2, 3.0)); 
    };

    const handleZoomOut = () => {
        // Min zoom limit
        setZoomLevel(prev => Math.max(prev - 0.2, 1.0)); 
    };
    
    // 🆕 New Handler: Reset zoom level to 1.0
    const handleResetZoom = () => {
        setZoomLevel(1.0);
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                
                <button className="modal-close-btn" onClick={onClose}>&times;</button>
                
                <div className="modal-controls">
                    <button 
                        onClick={handleZoomOut} 
                        disabled={zoomLevel <= 1.0}>
                        Zoom Out
                    </button>
                    
                    {/* 🆕 New Reset Button */}
                    <button 
                        onClick={handleResetZoom} 
                        disabled={zoomLevel === 1.0}
                        className="reset-btn"> 
                        Reset
                    </button>
                    
                    <button 
                        onClick={handleZoomIn} 
                        disabled={zoomLevel >= 3.0}>
                        Zoom In
                    </button>
                    
                    <span>Zoom: {Math.round(zoomLevel * 100)}%</span>
                </div>

                <div className="modal-image-container">
                    {/* Apply scale transformation for zoom effect */}
                    <img 
                        src={imageUrl} 
                        alt="E-waste Preview" 
                        style={{ 
                            transform: `scale(${zoomLevel})`,
                            // Drag cursor only appears when zoomed
                            cursor: zoomLevel > 1.0 ? 'grab' : 'default' 
                        }}
                    />
                </div>
            </div>
        </div>
    );
}