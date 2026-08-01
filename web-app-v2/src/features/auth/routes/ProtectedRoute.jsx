import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSession } from '../hooks/useSession';
import { LoadingScreen } from '../components/LoadingScreen';

export const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useSession();

  if (isLoading) {
    return <LoadingScreen message="Verifying secure access token..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
