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

import { WorkspaceListPage } from './features/workspace/pages/WorkspaceListPage';
import { WorkspaceDetailPage } from './features/workspace/pages/WorkspaceDetailPage';

// Initialize TanStack Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: true,
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
              <Route path="/workspaces" element={<WorkspaceListPage />} />
              <Route path="/workspaces/:workspaceId" element={<WorkspaceDetailPage />} />
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
