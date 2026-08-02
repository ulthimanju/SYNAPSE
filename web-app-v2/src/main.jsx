import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

import { PublicRoute } from './features/auth/routes/PublicRoute';
import { ProtectedRoute } from './features/auth/routes/ProtectedRoute';
import { LoginPage } from './features/auth/pages/LoginPage';
import { AuthCallbackPage } from './features/auth/pages/AuthCallbackPage';
import { MainLayout } from './layouts/MainLayout';
import { DashboardPage } from './pages/DashboardPage';

import './index.css';

// Apply saved theme class BEFORE React renders to prevent flash-of-wrong-theme
(function applyTheme() {
  const saved = localStorage.getItem('synapse_theme');
  if (saved === 'dark') document.documentElement.classList.add('dark');
  else document.documentElement.classList.remove('dark');
})();

import { WorkspaceListPage } from './features/workspace/pages/WorkspaceListPage';
import { WorkspaceDetailPage } from './features/workspace/pages/WorkspaceDetailPage';

import { WorkspaceProvider } from './features/workspace/context/WorkspaceContext';

// Initialize TanStack Query Client
// refetchOnWindowFocus=false prevents request storms when Alt+Tabbing back.
// staleTime=5min is the global default; per-query overrides only where needed.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>

          {/* OAuth Callback Route */}
          <Route path="/auth/callback" element={<AuthCallbackPage />} />

          {/* Protected Application Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route
                path="/workspaces"
                element={
                  <WorkspaceProvider>
                    <WorkspaceDetailPage />
                  </WorkspaceProvider>
                }
              />
              <Route path="/" element={<Navigate to="/workspaces" replace />} />
            </Route>
          </Route>

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>

      {/* Global Notifications */}
      <Toaster position="top-right" richColors theme="dark" />
    </QueryClientProvider>
  </React.StrictMode>
);
