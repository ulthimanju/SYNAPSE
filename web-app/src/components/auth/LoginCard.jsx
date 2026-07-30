import React, { useState } from 'react';
import { WelcomePanel } from './WelcomePanel';
import { GoogleSignInButton } from './GoogleSignInButton';
import { Alert } from '../feedback/Alert';

export const LoginCard = () => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleGoogleSignIn = () => {
    setLoading(true);
    setErrorMessage(null);

    // Redirect to Gateway Google OAuth 302 endpoint using exact Google Cloud Console registered redirect URI
    const gatewayUrl = 'http://localhost:8000/api/v1/auth/google/login';
    window.location.href = gatewayUrl;
  };

  return (
    <div className="editorial-card" style={{ padding: '2.5rem 2rem' }}>
      <WelcomePanel />

      {errorMessage && (
        <Alert
          type="info"
          title="OAuth Integration Notice"
          message={errorMessage}
        />
      )}

      <div style={{ marginTop: '1.5rem' }}>
        <GoogleSignInButton onClick={handleGoogleSignIn} loading={loading} />
      </div>

      <div className="editorial-divider" style={{ margin: '1.75rem 0 1.25rem 0' }} />

      <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        By signing in, you agree to Synapse terms of service and workspace privacy policy.
      </p>
    </div>
  );
};
