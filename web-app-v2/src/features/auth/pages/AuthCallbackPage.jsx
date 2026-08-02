import React from 'react';
import { LoadingScreen } from '../components/LoadingScreen';

/**
 * AuthCallbackPage — Passive handoff loading screen.
 * Post-login routing is fully server-owned by the identity service.
 * The backend sets HttpOnly session cookies and issues the direct HTTP 302 redirect target.
 */
export const AuthCallbackPage = () => {
  return <LoadingScreen message="Completing authentication & establishing secure session..." />;
};
