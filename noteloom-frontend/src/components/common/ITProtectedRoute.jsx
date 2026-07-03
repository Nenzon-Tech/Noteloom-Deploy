import React from "react";
import { Navigate } from "react-router-dom";
import { useITSessionManager } from "@/hooks/useITSessionManager";
import LoadingSpinner from "@/components/common/LoadingSpinner";

const ITProtectedRoute = ({ allowedRoles, children }) => {
  const { itUser, loading, isSessionValid } = useITSessionManager();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <LoadingSpinner message="Verifying IT session..." />
      </div>
    );
  }

  if (!isSessionValid || !itUser) {
    // If not authenticated, redirect to IT login page
    return <Navigate to="/it-login" replace />;
  }

  const validRoles = allowedRoles || ['it_admin', 'it_user', 'noteloom_admin', 'noteloom_manager'];
  if (!validRoles.includes(itUser?.role)) {
    // If authenticated but role not allowed, redirect to IT login
    return <Navigate to="/it-login" replace />;
  }

  return children;
};

export default ITProtectedRoute;
