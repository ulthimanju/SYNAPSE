import { useQuery } from '@tanstack/react-query';
import { sessionQueryOptions } from '../queries/authQueries';

export const useSession = () => {
  const { data, isLoading, isError, error, refetch } = useQuery(sessionQueryOptions);

  return {
    session: data,
    user: data?.user || null,
    roles: data?.roles || [],
    isAuthenticated: !!data?.authenticated && !!data?.user,
    isLoading,
    isError,
    error,
    refetchSession: refetch,
  };
};
