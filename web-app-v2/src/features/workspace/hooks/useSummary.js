import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workspaceQueries, workspaceQueryKeys } from '../queries/workspaceQueries';
import { workspaceApi } from '../api/workspaceApi';

export const useSummary = (workspaceId) => {
  const queryClient = useQueryClient();

  const { data: summary, isLoading, isError, error } = useQuery(workspaceQueries.summary(workspaceId));

  const generateMutation = useMutation({
    mutationFn: () => workspaceApi.generateSummary(workspaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.summary(workspaceId) });
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
