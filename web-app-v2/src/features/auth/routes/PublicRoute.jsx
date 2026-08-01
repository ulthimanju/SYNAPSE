import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSession } from '../hooks/useSession';
import { LoadingScreen } from '../components/LoadingScreen';

export const PublicRoute = () => {
  const { isAuthenticated, isLoading } = useSession();

  if (isLoading) {
    return <LoadingScreen message="Checking session status..." />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
