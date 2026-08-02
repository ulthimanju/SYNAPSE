import { sessionService } from '../services/sessionService';

export const authQueryKeys = {
  session: ['auth', 'session'],
  status: ['auth', 'status'],
};

export const sessionQueryOptions = {
  queryKey: authQueryKeys.session,
  queryFn: sessionService.fetchSession,
  staleTime: 0, // Always verify active session with backend
  retry: (failureCount, error) => {
    // Do not retry 401/403 unauthenticated/forbidden responses
    const status = error?.response?.status;
    if (status === 401 || status === 403) return false;
    return failureCount < 1;
  },
  refetchOnWindowFocus: true,
};
