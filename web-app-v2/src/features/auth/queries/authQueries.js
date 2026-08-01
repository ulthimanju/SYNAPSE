import { sessionService } from '../services/sessionService';

export const authQueryKeys = {
  session: ['auth', 'session'],
  status: ['auth', 'status'],
};

export const sessionQueryOptions = {
  queryKey: authQueryKeys.session,
  queryFn: sessionService.fetchSession,
  staleTime: 0, // Always verify active session
  retry: 1, // 1 retry before redirecting to login
  refetchOnWindowFocus: true,
};
