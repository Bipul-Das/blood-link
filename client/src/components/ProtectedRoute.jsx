import React from "react";
import { Navigate } from "react-router-dom";

// Standard Protected Route
// Usage: <ProtectedRoute><Dashboard /></ProtectedRoute>
const ProtectedRoute = ({ children }) => {
  // PLACEHOLDER: Replace with AuthContext later
  const token = localStorage.getItem("token");

  if (!token) {
    // If no token, redirect to login
    return <Navigate to="/login" replace />;
  }

  // If token exists, render the protected page
  return children;
};

export default ProtectedRoute;
