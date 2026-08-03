import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workspaceQueries, workspaceQueryKeys } from '../queries/workspaceQueries';
import { workspaceApi } from '../api/workspaceApi';
import { useWorkspace } from '../context/WorkspaceContext';

export const useDocuments = (workspaceId, isTabActive = true) => {
  const queryClient = useQueryClient();
  const { userId } = useWorkspace();

  const { data: documents = [], isLoading, isFetching, isError, error } = useQuery(
    workspaceQueries.documents(userId, workspaceId, isTabActive)
  );

  const uploadMutation = useMutation({
    mutationFn: (formData) => workspaceApi.uploadDocument(workspaceId, formData),
    // No invalidateQueries here — the SSE stream (useDocumentSSE) handles cache updates
    // in real-time via snapshot/status events. Calling invalidateQueries would race
    // against concurrent uploads and cause the second file to disappear from cache.
  });


  const deleteMutation = useMutation({
    mutationFn: (documentId) => workspaceApi.deleteDocument(workspaceId, documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.documents(userId, workspaceId) });
      queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.detail(userId, workspaceId) });
    },
  });

  const retryMutation = useMutation({
    mutationFn: (documentId) => workspaceApi.retryDocument(workspaceId, documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.documents(userId, workspaceId) });
    },
  });

  return {
    documents,
    isLoading,
    isFetching,
    isError,
    error,
    uploadDocument: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
    deleteDocument: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    retryDocument: retryMutation.mutateAsync,
    isRetrying: retryMutation.isPending,
  };
};
