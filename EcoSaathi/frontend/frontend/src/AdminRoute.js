// src/AdminRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * A wrapper component that checks if the logged-in user is an administrator.
 * If the user is not an admin, they are redirected to the home page.
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The child components (e.g., <Admin />).
 */
export default function AdminRoute({ children }) {
    const user = JSON.parse(localStorage.getItem('user'));
    
    // Check if the user is logged in AND if they have the isAdmin flag set to true
    if (!user || !user.isAdmin) {
        // You can use a more specific alert if needed
        alert("Access Denied. Administrator privileges required.");
        
        // Redirect non-admin users to the home page
        return <Navigate to="/" replace />;
    }

    // If the user is an admin, render the child component (e.g., <Admin />)
    return children;
}