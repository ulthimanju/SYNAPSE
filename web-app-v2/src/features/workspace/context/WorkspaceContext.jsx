import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { workspaceQueries } from '../queries/workspaceQueries';
import { useSession } from '../../auth/hooks/useSession';

const WorkspaceContext = createContext(null);

export const WorkspaceProvider = ({ children }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { user } = useSession();

  // Extract User ID for complete cache isolation
  const userId = user?.id || user?.user_id || 'anonymous';

  // 1. Single Source of Truth: URL Query Parameters
  const workspaceId = searchParams.get('workspace');
  const activeTab = searchParams.get('tab') || 'documents';

  // AbortController ref for canceling in-flight HTTP requests when switching workspaces
  const abortControllerRef = useRef(null);

  // 2. Fetch list of available workspaces (User-Scoped)
  const { data: workspaces = [] } = useQuery(workspaceQueries.list(userId));

  // 3. Workspace Switch Handler & Request Isolation Engine
  useEffect(() => {
    if (!workspaceId) return;

    // Abort previous in-flight HTTP requests immediately
    if (abortControllerRef.current) {
      abortControllerRef.current.abort('Workspace switched');
    }
    abortControllerRef.current = new AbortController();

    // Cancel all running React Query queries for previous workspace
    queryClient.cancelQueries();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort('Component unmounted');
      }
    };
  }, [workspaceId, queryClient]);

  // 4. Fetch Active Workspace Details (User-Scoped & Workspace-Scoped)
  const { data: fetchedWorkspace, isLoading: isWorkspaceLoading } = useQuery(
    workspaceQueries.detail(userId, workspaceId)
  );

  const currentWorkspace = workspaceId
    ? fetchedWorkspace || { id: workspaceId, name: 'Workspace' }
    : null;

  // 5. Actions for switching workspace while preserving active tab & updating URL
  const switchWorkspace = (newWorkspaceId) => {
    if (!newWorkspaceId) return;
    setSearchParams({ workspace: newWorkspaceId, tab: activeTab });
  };

  const setActiveTab = (newTab) => {
    if (!newTab || !workspaceId) return;
    setSearchParams({ workspace: workspaceId, tab: newTab });
  };

  const signal = abortControllerRef.current?.signal;

  const value = {
    userId,
    workspaceId,
    activeTab,
    currentWorkspace,
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
