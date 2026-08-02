import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workspaceQueries, workspaceQueryKeys } from '../queries/workspaceQueries';
import { workspaceApi } from '../api/workspaceApi';
import { useWorkspace } from '../context/WorkspaceContext';

export const useCollaborators = (workspaceId, isTabActive = true) => {
  const queryClient = useQueryClient();
  const { userId } = useWorkspace();

  const { data: collaborators = [], isLoading } = useQuery(
    workspaceQueries.collaborators(userId, workspaceId, isTabActive)
  );

  const addMutation = useMutation({
    mutationFn: ({ email, role }) => workspaceApi.addCollaborator(workspaceId, email, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.collaborators(userId, workspaceId) });
      queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.detail(userId, workspaceId) });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (collaboratorId) => workspaceApi.removeCollaborator(workspaceId, collaboratorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.collaborators(userId, workspaceId) });
      queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.detail(userId, workspaceId) });
    },
  });

  return {
    collaborators,
    isLoading,
    addCollaborator: addMutation.mutateAsync,
    isAdding: addMutation.isPending,
    removeCollaborator: removeMutation.mutateAsync,
    isRemoving: removeMutation.isPending,
  };
};
