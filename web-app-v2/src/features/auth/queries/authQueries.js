import { sessionService } from '../services/sessionService';

export const authQueryKeys = {
  session: ['auth', 'session'],
  status: ['auth', 'status'],
};

export const sessionQueryOptions = {
  queryKey: authQueryKeys.session,
  queryFn: sessionService.fetchSession,
  staleTime: 5 * 60 * 1000, // 5 minutes
  retry: 1, // 1 retry before redirecting to login
  refetchOnWindowFocus: true,
};
