import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../hooks/useSession';
import { LoadingScreen } from '../components/LoadingScreen';

export const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, refetchSession } = useSession();

  useEffect(() => {
    const verifyAndRedirect = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      if (token) {
        localStorage.setItem('synapse_access_token', token);
      }
      await refetchSession();
    };
    verifyAndRedirect();
  }, [refetchSession]);

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, navigate]);

  return <LoadingScreen message="Completing authentication & establishing secure session..." />;
};
