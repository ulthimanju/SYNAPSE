import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { authQueryKeys } from '../queries/authQueries';

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      localStorage.removeItem('synapse_access_token');
      queryClient.setQueryData(authQueryKeys.session, null);
      queryClient.removeQueries();
      queryClient.clear();
      window.location.href = '/login';
    },
    onError: () => {
      localStorage.removeItem('synapse_access_token');
      queryClient.setQueryData(authQueryKeys.session, null);
      queryClient.removeQueries();
      queryClient.clear();
      window.location.href = '/login';
    },
  });
};
