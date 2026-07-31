import React, { useEffect, useRef } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../services/queryClient';
import { useAuthStore } from '../stores/authStore';
import { STORAGE_KEYS } from '../config/constants';
import { api } from '../services/api';

/**
 * AppProviders: Configures TanStack QueryClientProvider and handles session rehydration on hard page refresh.
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
        if (err?.status === 401) {
          console.warn('[AppProviders] Session expired (401). Clearing session.');
          localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER);
          logout();
        }
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run ONCE on mount only — not on token changes

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};
