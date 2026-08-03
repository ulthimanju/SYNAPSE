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
    onSuccess: (uploadedDoc) => {
      // Optimistically add the doc to cache immediately so it shows in the UI.
      if (uploadedDoc) {
        queryClient.setQueryData(
          workspaceQueryKeys.documents(userId, workspaceId),
          (old = []) => {
            const docId = uploadedDoc.id || uploadedDoc._id;
            const exists = old.some((d) => (d.id || d._id) === docId);
            return exists ? old : [uploadedDoc, ...old];
          }
        );
      }
      // Also invalidate so React Query re-fetches from server and reconciles
      // any discrepancy (e.g. SSE snapshot fired before onSuccess ran).
      queryClient.invalidateQueries({
        queryKey: workspaceQueryKeys.documents(userId, workspaceId),
      });
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
