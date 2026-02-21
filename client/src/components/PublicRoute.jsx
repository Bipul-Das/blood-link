import React from "react";
import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (token) {
    // If user is already logged in, push them to dashboard
    return <Navigate to="/dashboard/donor" replace />;
  }

  return children;
};

export default PublicRoute;
