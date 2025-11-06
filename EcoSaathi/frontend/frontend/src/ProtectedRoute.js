import React from "react";
import { Navigate, useLocation } from "react-router-dom"; // useLocation imported

export default function ProtectedRoute({ children }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const location = useLocation(); // Get current location

  // 1. Check if the user is logged in
  if (!user) {
    // If not logged in, redirect to login page.
    // We pass the current path in the 'state' so Login component knows where to redirect after success.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // 2. If logged in, render the child component (the protected page)
  return children;
}