import { useQuery } from '@tanstack/react-query';
import { workspaceQueries } from '../queries/workspaceQueries';

export const useWorkspaceDetail = (workspaceId) => {
  const { data: workspace, isLoading, isError, error } = useQuery(workspaceQueries.detail(workspaceId));

  return {
    workspace,
    isLoading,
    isError,
    error,
  };
};
