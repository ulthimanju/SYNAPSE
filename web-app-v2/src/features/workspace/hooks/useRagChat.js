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
    // Optimistic update: show user message immediately without waiting for server
    onMutate: async (message) => {
      await queryClient.cancelQueries({ queryKey: workspaceQueryKeys.chatHistory(userId, workspaceId) });
      const previous = queryClient.getQueryData(workspaceQueryKeys.chatHistory(userId, workspaceId));
      queryClient.setQueryData(
        workspaceQueryKeys.chatHistory(userId, workspaceId),
        (old = []) => [...old, { role: 'user', message, id: `optimistic-${Date.now()}` }]
      );
      return { previous };
    },
    onError: (_err, _message, context) => {
      // Roll back optimistic message if send fails
      if (context?.previous !== undefined) {
        queryClient.setQueryData(workspaceQueryKeys.chatHistory(userId, workspaceId), context.previous);
      }
    },
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
