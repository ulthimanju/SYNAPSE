import { authApi } from '../api/authApi';

export const sessionService = {
  fetchSession: async () => {
    return await authApi.getSession();
  },

  refreshSession: async () => {
    return await authApi.refreshSession();
  },
};
