import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * AuthCallbackPage — Passive handoff screen.
 * Backend completes OAuth and sets HttpOnly cookies before redirecting to the frontend.
 * This component defers post-login routing to the backend's target destination (/workspaces).
 */
export const AuthCallbackPage = () => {
  return <Navigate to="/workspaces" replace />;
};
