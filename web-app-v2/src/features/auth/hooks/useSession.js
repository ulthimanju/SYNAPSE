import { useQuery } from '@tanstack/react-query';
import { sessionQueryOptions } from '../queries/authQueries';

export const useSession = () => {
  const { data, isLoading, isError, error, refetch } = useQuery(sessionQueryOptions);

  const isAuthenticated = !isError && !!data?.authenticated && !!data?.user;

  return {
    session: data,
    user: isAuthenticated ? data.user : null,
    roles: isAuthenticated ? (data.roles || []) : [],
    isAuthenticated,
    isLoading,
    isError,
    error,
    refetchSession: refetch,
  };
};
