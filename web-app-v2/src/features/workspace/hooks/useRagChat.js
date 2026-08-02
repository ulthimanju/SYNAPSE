import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workspaceQueries, workspaceQueryKeys } from '../queries/workspaceQueries';
import { workspaceApi } from '../api/workspaceApi';
import { useWorkspace } from '../context/WorkspaceContext';

export const useRagChat = (workspaceId, isTabActive = true) => {
  const queryClient = useQueryClient();
  const { userId } = useWorkspace();

  const { data: messages = [], isLoading } = useQuery(
    workspaceQueries.chatHistory(userId, workspaceId, isTabActive)
  );

  const sendMessageMutation = useMutation({
    mutationFn: (message) => workspaceApi.sendChatMessage(workspaceId, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.chatHistory(userId, workspaceId) });
    },
  });

  const clearHistoryMutation = useMutation({
    mutationFn: () => workspaceApi.clearChatHistory(workspaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.chatHistory(userId, workspaceId) });
    },
  });

  return {
    messages,
    isLoading,
    sendMessage: sendMessageMutation.mutateAsync,
    isSending: sendMessageMutation.isPending,
    clearHistory: clearHistoryMutation.mutateAsync,
    isClearing: clearHistoryMutation.isPending,
  };
};
