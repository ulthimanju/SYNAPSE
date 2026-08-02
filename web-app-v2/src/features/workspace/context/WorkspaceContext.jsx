import React, { createContext, useContext, useEffect, useRef, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { workspaceQueries, workspaceQueryKeys } from '../queries/workspaceQueries';
import { workspaceApi } from '../api/workspaceApi';

const WorkspaceContext = createContext(null);

export const WorkspaceProvider = ({ children }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 1. Single Source of Truth: URL Query Parameters
  const rawWorkspaceId = searchParams.get('workspace');
  const activeTab = searchParams.get('tab') || 'documents';

  // AbortController ref for canceling in-flight HTTP requests when switching workspaces
  const abortControllerRef = useRef(null);

  // 2. Fetch list of available workspaces to default if no query param is present
  const { data: workspaces = [] } = useQuery(workspaceQueries.list());

  // Default workspace ID if missing from URL
  const workspaceId = useMemo(() => {
    if (rawWorkspaceId) return rawWorkspaceId;
    if (workspaces.length > 0) {
      return workspaces[0].id || workspaces[0]._id || workspaces[0].workspace_id;
    }
    return 'operating_system'; // Fallback default workspace
  }, [rawWorkspaceId, workspaces]);

  // Synchronize URL if workspace param was missing
  useEffect(() => {
    if (!rawWorkspaceId && workspaceId) {
      setSearchParams({ workspace: workspaceId, tab: activeTab }, { replace: true });
    }
  }, [rawWorkspaceId, workspaceId, activeTab, setSearchParams]);

  // 3. Workspace Switch Handler & Request Isolation Engine
  useEffect(() => {
    if (!workspaceId) return;

    // Abort previous in-flight HTTP requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort('Workspace switched');
    }
    abortControllerRef.current = new AbortController();

    // Cancel all running React Query queries for previous workspace
    queryClient.cancelQueries();

    // Clean up on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort('Component unmounted');
      }
    };
  }, [workspaceId, queryClient]);

  // 4. Fetch Active Workspace Details (Workspace-Scoped)
  const { data: currentWorkspace, isLoading: isWorkspaceLoading } = useQuery(
    workspaceQueries.detail(workspaceId)
  );

  // 5. Actions for switching workspace while preserving active tab & updating URL
  const switchWorkspace = (newWorkspaceId) => {
    if (!newWorkspaceId || newWorkspaceId === workspaceId) return;
    setSearchParams({ workspace: newWorkspaceId, tab: activeTab });
  };

  const setActiveTab = (newTab) => {
    if (!newTab || newTab === activeTab) return;
    setSearchParams({ workspace: workspaceId, tab: newTab });
  };

  const signal = abortControllerRef.current?.signal;

  const value = {
    workspaceId,
    activeTab,
    currentWorkspace: currentWorkspace || { id: workspaceId, name: 'Operating system' },
    isWorkspaceLoading,
    workspaces,
    switchWorkspace,
    setActiveTab,
    signal,
  };

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
