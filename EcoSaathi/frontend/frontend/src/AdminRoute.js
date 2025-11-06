// src/AdminRoute.js

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * A wrapper component that checks if the logged-in user is an administrator.
 * If the user is not an admin, they are redirected to a relevant page.
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The child components (e.g., <Admin />).
 */
export default function AdminRoute({ children }) {
    const user = JSON.parse(localStorage.getItem('user'));
    const location = useLocation();

    // 1. Authentication Check (Is the user logged in?)
    if (!user) {
        // If not logged in, send them to the login page.
        // We pass the location state so they are returned here after login.
        alert("Authentication required. Please log in to access this page.");
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    
    // 2. Authorization Check (Is the user an ADMIN?)
    if (user.role !== 'ADMIN') {
        // If logged in but not an admin, deny access and send them to their dashboard.
        
        // 💡 Use user.id to dynamically construct the dashboard path
        const dashboardPath = `/dashboard/${user.id}`; 
        
        alert("Access Denied. Administrator privileges required.");
        // Redirect to a page they are authorized to see
        return <Navigate to={dashboardPath} replace />; 
    }

    // 3. Access Granted: If the user is logged in AND is an admin.
    return children;
}