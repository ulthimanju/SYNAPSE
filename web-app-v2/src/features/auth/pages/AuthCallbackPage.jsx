import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../hooks/useSession';
import { LoadingScreen } from '../components/LoadingScreen';

export const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, refetchSession } = useSession();

  useEffect(() => {
    const verifyAndRedirect = async () => {
      await refetchSession();
    };
    verifyAndRedirect();
  }, [refetchSession]);

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        navigate('/workspaces', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, navigate]);

  return <LoadingScreen message="Completing authentication & establishing secure session..." />;
};
