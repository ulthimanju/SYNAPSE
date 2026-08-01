import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workspaceQueries, workspaceQueryKeys } from '../queries/workspaceQueries';
import { workspaceApi } from '../api/workspaceApi';

export const useRagChat = (workspaceId) => {
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading, isError, error } = useQuery(workspaceQueries.chatHistory(workspaceId));

  const sendMutation = useMutation({
    mutationFn: (message) => workspaceApi.sendChatMessage(workspaceId, message),
    onSuccess: (data) => {
      // Optimistically update chat history
      queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.chatHistory(workspaceId) });
    },
  });

  const clearMutation = useMutation({
    mutationFn: () => workspaceApi.clearChatHistory(workspaceId),
    onSuccess: () => {
      queryClient.setQueryData(workspaceQueryKeys.chatHistory(workspaceId), []);
    },
  });

  return {
    messages,
    isLoading,
    isError,
    error,
    sendMessage: sendMutation.mutateAsync,
    isSending: sendMutation.isPending,
    clearHistory: clearMutation.mutateAsync,
    isClearing: clearMutation.isPending,
  };
};
