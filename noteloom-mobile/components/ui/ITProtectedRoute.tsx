import React, { ReactNode } from 'react';
import { View, Text } from 'react-native';
import { Redirect } from 'expo-router';
import { useSession } from '../../hooks/useSession';
import LoadingSpinner from './LoadingSpinner';

interface ITProtectedRouteProps {
  allowedRoles?: string[];
  children: ReactNode;
}

export const ITProtectedRoute = ({ allowedRoles, children }: ITProtectedRouteProps) => {
  const { user, profile, loading, isSessionValid } = useSession();

  if (loading) {
    return <LoadingSpinner message="Verifying IT session..." />;
  }

  if (!isSessionValid || !user) {
    return <Redirect href="/" />;
  }

  const validRoles = allowedRoles || ['eduspace_admin', 'eduspace_manager'];
  if (!validRoles.includes(profile?.role || '')) {
    return <Redirect href="/" />;
  }

  return <>{children}</>;
};

export default ITProtectedRoute;
