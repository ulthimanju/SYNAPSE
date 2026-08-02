import { useQuery } from '@tanstack/react-query';
import { workspaceQueries } from '../queries/workspaceQueries';
import { useWorkspace } from '../context/WorkspaceContext';

export const useWorkspaceDetail = (workspaceId) => {
  const { userId } = useWorkspace();
  const { data: workspace, isLoading, isError, error } = useQuery(
    workspaceQueries.detail(userId, workspaceId)
  );

  return {
    workspace,
    isLoading,
    isError,
    error,
  };
};
