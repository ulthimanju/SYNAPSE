import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { STORAGE_KEYS } from '../config/constants';
import { api } from '../services/api';

/**
 * AppProviders: Handles session rehydration on hard page refresh.
 * 
 * Key Design Rules:
 * - On fresh login via OAuth, the token is already valid — skip /auth/me to avoid
 *   a race condition between setAuth() and the async /auth/me call.
 * - Only validate the session via /auth/me when the user hard-refreshes the page
 *   (token already existed in localStorage before React mounted).
 * - Only call logout() on explicit 401 Unauthorized from /auth/me.
 */
export const AppProviders = ({ children }) => {
  const { token, logout } = useAuthStore();
  const hasValidated = useRef(false);

  useEffect(() => {
    // token is null means no session - nothing to validate
    if (!token) return;

    // Skip if already validated in this session
    if (hasValidated.current) return;
    hasValidated.current = true;

    // Validate session by calling /auth/me (handles hard page refreshes)
    api.get('/auth/me')
      .then(() => {
        // Session is valid - no action needed, token stays in localStorage
      })
      .catch((err) => {
        // ONLY clear session and redirect to login on explicit 401 Unauthorized.
        // All other errors (network, 404, 500) are ignored to avoid
        // destroying valid sessions due to transient backend errors.
        if (err?.status === 401) {
          console.warn('[AppProviders] Session expired (401). Clearing session.');
          localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER);
          logout();
        }
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run ONCE on mount only — not on token changes

  return <>{children}</>;
};
