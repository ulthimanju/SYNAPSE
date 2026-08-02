import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workspaceQueries, workspaceQueryKeys } from '../queries/workspaceQueries';
import { workspaceApi } from '../api/workspaceApi';
import { useWorkspace } from '../context/WorkspaceContext';

export const useLearningPath = (workspaceId, selectedUnitId = null) => {
  const queryClient = useQueryClient();
  const { userId } = useWorkspace();

  const { data: learningPath, isLoading: isPathLoading } = useQuery(
    workspaceQueries.learningPath(userId, workspaceId)
  );

  const { data: unitContent, isLoading: isUnitLoading } = useQuery(
    workspaceQueries.unitContent(userId, workspaceId, selectedUnitId)
  );

  const generateMutation = useMutation({
    mutationFn: () => workspaceApi.generateLearningPath(workspaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.learningPath(userId, workspaceId) });
    },
  });

  return {
    learningPath,
    unitContent,
    isPathLoading,
    isUnitLoading,
    generateLearningPath: generateMutation.mutateAsync,
    isGenerating: generateMutation.isPending,
  };
};
