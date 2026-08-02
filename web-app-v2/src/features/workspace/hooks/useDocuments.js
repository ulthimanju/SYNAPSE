import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workspaceQueries, workspaceQueryKeys } from '../queries/workspaceQueries';
import { workspaceApi } from '../api/workspaceApi';
import { useWorkspace } from '../context/WorkspaceContext';

export const useDocuments = (workspaceId) => {
  const queryClient = useQueryClient();
  const { userId } = useWorkspace();

  const { data: documents = [], isLoading, isError, error } = useQuery(
    workspaceQueries.documents(userId, workspaceId)
  );

  const uploadMutation = useMutation({
    mutationFn: (formData) => workspaceApi.uploadDocument(workspaceId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.documents(userId, workspaceId) });
      queryClient.invalidateQueries({ queryKey: workspaceQueryKeys.detail(userId, workspaceId) });
    },
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
