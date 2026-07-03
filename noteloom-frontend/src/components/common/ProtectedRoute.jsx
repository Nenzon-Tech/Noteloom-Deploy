import React from "react";
import { Navigate } from "react-router-dom";
import { useSessionManager } from "@/hooks/useSessionManager";
import LoadingSpinner from "@/components/common/LoadingSpinner";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { profile, loading, isSessionValid } = useSessionManager();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <LoadingSpinner message="Verifying session..." />
      </div>
    );
  }

  if (!isSessionValid) {
    // If not authenticated, redirect to college selection or login
    const savedCode = localStorage.getItem('selectedCollegeCode');
    return <Navigate to={savedCode ? `/login?code=${savedCode}` : "/college-selection"} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(profile?.role)) {
    // If authenticated but unauthorized role, redirect to unauthorized error
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
