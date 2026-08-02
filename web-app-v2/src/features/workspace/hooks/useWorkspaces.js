import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workspaceQueries, workspaceQueryKeys } from '../queries/workspaceQueries';
import { workspaceApi } from '../api/workspaceApi';
import { useWorkspace } from '../context/WorkspaceContext';

export const useWorkspaces = () => {
  const queryClient = useQueryClient();
  const { userId } = useWorkspace();

  const { data: workspaces = [], isLoading, isError, error } = useQuery(workspaceQueries.list(userId));

  const createMutation = useMutation({
    mutationFn: (payload) => workspaceApi.createWorkspace(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.all(userId) });
      queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.titles(userId) });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (workspaceId) => workspaceApi.deleteWorkspace(workspaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.all(userId) });
      queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.titles(userId) });
    },
  });

  return {
    workspaces,
    isLoading,
    isError,
    error,
    createWorkspace: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    deleteWorkspace: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};
