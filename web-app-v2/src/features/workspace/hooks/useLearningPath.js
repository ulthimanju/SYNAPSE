import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workspaceQueries, workspaceQueryKeys } from '../queries/workspaceQueries';
import { workspaceApi } from '../api/workspaceApi';

export const useLearningPath = (workspaceId, selectedUnitId = null) => {
  const queryClient = useQueryClient();

  const { data: learningPath, isLoading, isError, error } = useQuery(workspaceQueries.learningPath(workspaceId));

  const { data: unitContent, isLoading: isUnitLoading } = useQuery(
    workspaceQueries.unitContent(workspaceId, selectedUnitId)
  );

  const generateMutation = useMutation({
    mutationFn: () => workspaceApi.generateLearningPath(workspaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.learningPath(workspaceId) });
    },
  });

  return {
    learningPath,
    isLoading,
    isError,
    error,
    unitContent,
    isUnitLoading,
    generateLearningPath: generateMutation.mutateAsync,
    isGenerating: generateMutation.isPending,
  };
};
