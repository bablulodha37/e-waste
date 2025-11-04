// src/components/AddressAutocomplete.js (Using OpenStreetMap/Nominatim)
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// Utility function to delay API calls (Debouncing)
// This is CRITICAL for Nominatim to avoid getting blocked.
const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            func.apply(null, args);
        }, delay);
    };
};


export default function AddressAutocomplete({ initialValue, onPlaceSelect, placeholder }) {
    // 1. Inpuit value और suggestions को मैनेज करने के लिए state
    const [inputValue, setInputValue] = useState(initialValue);
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // 2. Debounced search function (API call)
    // useEffect के बाहर एक Debounced function बनाएं जो API को कॉल करेगा
    const searchNominatim = useRef(
        debounce(async (query) => {
            if (query.length < 3) {
                setSuggestions([]);
                return;
            }
            setLoading(true);
            try {
                const response = await axios.get('https://nominatim.openstreetmap.org/search', {
                    params: {
                        q: query, // Search query
                        format: 'json', // Request JSON output
                        addressdetails: 1, // Include address details
                        limit: 5, // Limit to 5 suggestions
                        countrycodes: 'in' // Optional: Focus search on India
                    }
                });
                
                // Nominatim 'display_name' property में पूरा पता देता है
                setSuggestions(response.data);
            } catch (error) {
                console.error("Nominatim search error:", error);
            } finally {
                setLoading(false);
            }
        }, 500) // 500ms debounce
    ).current;

    // 3. जब input बदलता है, तो searchNominatim को कॉल करें
    useEffect(() => {
        // Debounced search function कॉल करें
        searchNominatim(inputValue);
    }, [inputValue, searchNominatim]);


    // 4. सुझाव चुने जाने पर हैंडलर
    const handleSelect = (selectedPlace) => {
        const fullAddress = selectedPlace.display_name;
        
        // Input state और suggestions को अपडेट करें
        setInputValue(fullAddress);
        setSuggestions([]); 
        
        // Parent component को full address भेजें
        onPlaceSelect(fullAddress);
    };
    
    // 5. मैनुअल इनपुट बदलने पर हैंडलर
    const handleChange = (e) => {
        const value = e.target.value;
        setInputValue(value);
        // अगर user टाइप कर रहा है, तो पुरानी suggestions साफ़ कर दें 
        // ताकि वे नया सुझाव आने की प्रतीक्षा करें
        if (value.length < 3) {
            setSuggestions([]);
        }
        // अगर user सजेशन लिस्ट पर क्लिक किए बिना फ़ील्ड छोड़ देता है, 
        // तो यह सुनिश्चित करता है कि parent component को current value मिले
        onPlaceSelect(value); 
    }
    
    // 6. initialValue बदलने पर state को अपडेट करें (जैसे, प्रोफ़ाइल से डिफ़ॉल्ट लोड करना)
    useEffect(() => {
        setInputValue(initialValue);
    }, [initialValue]);


    return (
        <div className="autocomplete-container">
            <input
                type="text"
                value={inputValue} 
                onChange={handleChange}
                placeholder={placeholder || "Search for pickup address..."}
                className="address-input"
                required
            />
            
            {loading && <div className="suggestion-status">Loading suggestions...</div>}
            
            {/* Suggestions List */}
            {suggestions.length > 0 && (
                <ul className="suggestions-list">
                    {suggestions.map((place) => (
                        <li 
                            key={place.place_id} 
                            onClick={() => handleSelect(place)}
                        >
                            {place.display_name}
                        </li>
                    ))}
                </ul>
            )}
            
            {/* If there are suggestions, we need to add styling to make the list look good */}
        </div>
    );
}