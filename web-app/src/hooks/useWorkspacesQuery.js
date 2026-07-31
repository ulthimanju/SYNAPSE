import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuthStore } from '../stores/authStore';

/**
 * Custom TanStack Query hooks for Workspace Server State.
 * Keys are automatically scoped by user ID to guarantee 0 cross-account cache leaks.
 */

export const useWorkspacesQuery = () => {
  const { user } = useAuthStore();
  const userId = user?.id || user?.user_id || 'anonymous';

  return useQuery({
    queryKey: ['workspaces', userId],
    queryFn: async () => {
      const res = await api.get('/workspaces/titles');
      return res?.data?.data || res?.data || [];
    },
    enabled: !!user,
  });
};

export const useWorkspaceDetailQuery = (workspaceId) => {
  const { user } = useAuthStore();
  const userId = user?.id || user?.user_id || 'anonymous';

  return useQuery({
    queryKey: ['workspace', workspaceId, userId],
    queryFn: async () => {
      const res = await api.get(`/workspaces/${workspaceId}`);
      return res?.data?.data || res?.data;
    },
    enabled: !!workspaceId && !!user,
  });
};

export const useLearningPathQuery = (workspaceId) => {
  const { user } = useAuthStore();
  const userId = user?.id || user?.user_id || 'anonymous';

  return useQuery({
    queryKey: ['learningPath', workspaceId, userId],
    queryFn: async () => {
      const res = await api.get(`/workspaces/${workspaceId}/learning-path`);
      return res?.data?.data || res?.data;
    },
    enabled: !!workspaceId && !!user,
    retry: false, // Don't retry if LP isn't generated yet
  });
};

export const useCollaboratorsQuery = (workspaceId) => {
  const { user } = useAuthStore();
  const userId = user?.id || user?.user_id || 'anonymous';

  return useQuery({
    queryKey: ['collaborators', workspaceId, userId],
    queryFn: async () => {
      const res = await api.get(`/workspaces/${workspaceId}/collaborators`);
      return res?.data?.data || res?.data || [];
    },
    enabled: !!workspaceId && !!user,
  });
};

export const useInviteCollaboratorMutation = (workspaceId) => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const userId = user?.id || user?.user_id || 'anonymous';

  return useMutation({
    mutationFn: async (email) => {
      const res = await api.post(`/workspaces/${workspaceId}/collaborators`, { email });
      return res?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaborators', workspaceId, userId] });
    },
  });
};

export const useRemoveCollaboratorMutation = (workspaceId) => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const userId = user?.id || user?.user_id || 'anonymous';

  return useMutation({
    mutationFn: async (targetIdOrEmail) => {
      const res = await api.delete(`/workspaces/${workspaceId}/collaborators/${targetIdOrEmail}`);
      return res?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collaborators', workspaceId, userId] });
    },
  });
};
