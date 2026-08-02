import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { authQueryKeys } from '../queries/authQueries';

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      // Server-driven logout: backend revokes HttpOnly cookies.
      // Invalidate session query to reflect unauthenticated state and redirect to /login.
      queryClient.invalidateQueries({ queryKey: authQueryKeys.session });
      window.location.href = '/login';
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: authQueryKeys.session });
      window.location.href = '/login';
    },
  });
};
