import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workspaceQueries, workspaceQueryKeys } from '../queries/workspaceQueries';
import { workspaceApi } from '../api/workspaceApi';

export const useWorkspaces = () => {
  const queryClient = useQueryClient();

  const { data: workspaces = [], isLoading, isError, error } = useQuery(workspaceQueries.list());
  const { data: titles = [] } = useQuery(workspaceQueries.titles());

  const createMutation = useMutation({
    mutationFn: workspaceApi.createWorkspace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.titles });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: workspaceApi.deleteWorkspace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.titles });
    },
  });

  return {
    workspaces,
    titles,
    isLoading,
    isError,
    error,
    createWorkspace: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    deleteWorkspace: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};
