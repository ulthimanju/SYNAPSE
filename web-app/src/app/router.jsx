import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from '../pages/Home';
import { Login } from '../pages/Login';
import { OAuthCallback } from '../pages/OAuthCallback';
import { Dashboard } from '../pages/Dashboard';
import { WorkspaceDetail } from '../pages/WorkspaceDetail';
import { CollaboratedWorkspaces } from '../pages/CollaboratedWorkspaces';
import { LearningUnitDetail } from '../pages/LearningUnitDetail';
import { NotFound } from '../pages/NotFound';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<OAuthCallback />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/workspaces"
          element={
            <ProtectedRoute>
              <Navigate to="/dashboard" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/collaborations"
          element={
            <ProtectedRoute>
              <CollaboratedWorkspaces />
            </ProtectedRoute>
          }
        />
        <Route
          path="/workspaces/:workspaceId"
          element={
            <ProtectedRoute>
              <WorkspaceDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/workspaces/:workspaceId/units/:unitId"
          element={
            <ProtectedRoute>
              <LearningUnitDetail />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
