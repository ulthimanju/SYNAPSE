import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { Alert } from '../components/feedback/Alert';
import { useAuthStore } from '../stores/authStore';
import { Loader2 } from 'lucide-react';

export const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    const name = searchParams.get('name');
    const avatar = searchParams.get('avatar');

    if (!token) {
      setError('Authentication token missing from Google OAuth redirect.');
      return;
    }

    const userProfile = {
      email: email || 'user@synapse.ai',
      full_name: name || 'Authenticated User',
      avatar_url: avatar || null,
    };

    // Store auth token in localStorage and update Zustand state
    setAuth(userProfile, token);
    navigate('/dashboard', { replace: true });
  }, [searchParams, navigate, setAuth]);

  return (
    <AuthLayout>
      <div className="editorial-card" style={{ padding: '3rem 2rem', textAlign: 'center', maxWidth: '420px', width: '100%' }}>
        {error ? (
          <Alert type="info" message={error} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <Loader2 size={32} className="animate-spin" style={{ color: 'var(--accent-amber-hover)' }} />
            <h3 className="font-serif" style={{ fontSize: '1.25rem' }}>Authenticating with Google...</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Syncing user profile and initializing Synapse workspace session.
            </p>
          </div>
        )}
      </div>
    </AuthLayout>
  );
};
