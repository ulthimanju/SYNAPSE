import { authApi } from '../api/authApi';

export const authService = {
  loginWithGoogle: () => {
    authApi.initiateGoogleLogin();
  },

  logout: async () => {
    return await authApi.logout();
  },

  checkStatus: async () => {
    return await authApi.getStatus();
  },
};
