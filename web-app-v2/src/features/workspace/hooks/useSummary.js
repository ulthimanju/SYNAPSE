import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workspaceQueries, workspaceQueryKeys } from '../queries/workspaceQueries';
import { workspaceApi } from '../api/workspaceApi';
import { useWorkspace } from '../context/WorkspaceContext';

export const useSummary = (workspaceId, isTabActive = true) => {
  const queryClient = useQueryClient();
  const { userId } = useWorkspace();

  const { data: summary, isLoading, isError, error } = useQuery(
    workspaceQueries.summary(userId, workspaceId, isTabActive)
  );

  const generateMutation = useMutation({
    mutationFn: () => workspaceApi.generateSummary(workspaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.summary(userId, workspaceId) });
    },
  });

  return {
    summary,
    isLoading,
    isError,
    error,
    generateSummary: generateMutation.mutateAsync,
    isGenerating: generateMutation.isPending,
  };
};
