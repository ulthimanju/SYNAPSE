import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workspaceQueries, workspaceQueryKeys } from '../queries/workspaceQueries';
import { workspaceApi } from '../api/workspaceApi';

export const useCollaborators = (workspaceId) => {
  const queryClient = useQueryClient();

  const { data: collaborators = [], isLoading, isError, error } = useQuery(
    workspaceQueries.collaborators(workspaceId)
  );

  const addMutation = useMutation({
    mutationFn: ({ email, role }) => workspaceApi.addCollaborator(workspaceId, email, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.collaborators(workspaceId) });
      queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.detail(workspaceId) });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (collaboratorId) => workspaceApi.removeCollaborator(workspaceId, collaboratorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.collaborators(workspaceId) });
      queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.detail(workspaceId) });
    },
  });

  return {
    collaborators,
    isLoading,
    isError,
    error,
    addCollaborator: addMutation.mutateAsync,
    isAdding: addMutation.isPending,
    removeCollaborator: removeMutation.mutateAsync,
    isRemoving: removeMutation.isPending,
  };
};
