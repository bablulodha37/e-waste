import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
    const user = JSON.parse(localStorage.getItem("user"));

    // Check if the user is logged in
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    //  Check if the user is verified
    //    We assume the 'user' object retrieved from login contains the 'verified' flag.
    if (!user.verified) {
        alert("Access Denied. Please verify your account using the OTP sent to your email.");
        
        // Redirect the unverified user to the OTP verification page (passing their email)
        // Note: The email in localStorage might be stale, but we use the stored user object for redirection.
        return <Navigate to="/verify-otp" replace state={{ email: user.email }} />;
    }

    // 3. If logged in AND verified, grant access
    return children;
}